import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

// In-memory maps
const userSocketMap = new Map<number, string>();
const socketUserMap = new Map<string, number>();
const userAvailable = new Map<number, boolean>();

export function registerSocketHandlers(io: Server, prisma: PrismaClient) {
  // Middleware: check JWT
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.query?.token as string);

    if (!token) return next(new Error("No token"));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        role: string;
      };
      (socket as any).user = payload;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as { userId: number; role: string };
    console.log("✅ Socket connected:", user);

    userSocketMap.set(user.userId, socket.id);
    socketUserMap.set(socket.id, user.userId);

    if (user.role === "doctor") {
      userAvailable.set(user.userId, true);
      io.emit("presence:update", [{ userId: user.userId, available: true }]);
    }

    // Request a call
    socket.on("call:request", ({ doctorId }) => {
      const doctorSocket = userSocketMap.get(doctorId);
      if (doctorSocket) {
        io.to(doctorSocket).emit("call:incoming", {
          patientId: user.userId,
        });
      }
    });

    // Doctor accepts call
    socket.on("call:accept", ({ patientId }) => {
      const patientSocket = userSocketMap.get(patientId);
      if (patientSocket) {
        io.to(patientSocket).emit("call:accepted", {
          doctorId: user.userId,
        });
      }
    });

    // WebRTC signaling (offer/answer/ICE candidates)
    socket.on("signal", (data) => {
      const { to, type, payload } = data; // {to: userId, type: 'offer'|'answer'|'candidate'}
      const targetSocket = userSocketMap.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("signal", {
          from: user.userId,
          type,
          payload,
        });
      }
    });

    // End call
    socket.on("call:end", ({ to }) => {
      const targetSocket = userSocketMap.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("call:ended", { from: user.userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);
      const uid = socketUserMap.get(socket.id);
      if (uid) {
        userSocketMap.delete(uid);
        socketUserMap.delete(socket.id);
        if (user.role === "doctor") {
          userAvailable.set(uid, false);
          io.emit("presence:update", [{ userId: uid, available: false }]);
        }
      }
    });
  });
}
