import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET as string;
const prisma = new PrismaClient();

// In-memory maps
const userSocketMap = new Map<number, string>(); // userId -> socketId
const socketUserMap = new Map<string, number>(); // socketId -> userId
const userAvailable = new Map<number, boolean>(); // doctors availability

export function registerSocketHandlers(io: Server) {
  // JWT middleware
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      (socket.handshake.query?.token as string);

    if (!token) return next(new Error("No token provided"));

    try {
      const cleanToken = token.startsWith("Bearer ") ? token.slice(7) : token;
      const payload = jwt.verify(cleanToken, JWT_SECRET) as {
        userId: number;
        role: string;
      };
      (socket as any).user = payload;
      next();
    } catch (err) {
      console.error("JWT Error:", err);
      next(new Error("Invalid token"));
    }
  });


  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    console.log("✅ Socket connected:", user);

    // Track connections
    userSocketMap.set(user.userId, socket.id);
    socketUserMap.set(socket.id, user.userId);

    // Doctors available
    if (user.role === "doctor") {
      userAvailable.set(user.userId, true);
      io.emit("presence:update", [{ userId: user.userId, available: true }]);
    }

    /** 📞 CALL EVENTS **/
    socket.on("call:request", ({ doctorId }) => {
      
      const doctorSocket = userSocketMap.get(doctorId);
      console.log("Call request to doctor socket:", doctorSocket);
      if (doctorSocket) {
        io.to(doctorSocket).emit("call:incoming", { patientId: user.userId });
      }
    });

    socket.on("call:accept", ({ patientId }) => {
      const patientSocket = userSocketMap.get(patientId);
      if (patientSocket) {
        io.to(patientSocket).emit("call:accepted", { doctorId: user.userId });
      }
    });
   
    socket.on("call:cancel", ({ to }) => {
      const targetSocket = userSocketMap.get(to);
      if (targetSocket)
        io.to(targetSocket).emit("call:canceled", { from: user.userId });
    });

    socket.on("call:end", ({ to }) => {
      const targetSocket = userSocketMap.get(to);
      if (targetSocket)
        io.to(targetSocket).emit("call:ended", { from: user.userId });
    });

    /** 🌐 SIGNALING (offer/answer/candidates) **/
    socket.on("signal", ({ to, type, payload }) => {
      const targetSocket = userSocketMap.get(to);
      if (targetSocket) {
        io.to(targetSocket).emit("signal", {
          from: user.userId,
          type,
          payload,
        });
      }
    });

    /** ❌ DISCONNECT **/
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
