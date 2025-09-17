import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/users';
import appointmentRoutes from './routes/appointments';
import { registerSocketHandlers } from './socketHandlers';
import { PrismaClient } from '@prisma/client';
import doctorRoutes from "./routes/doctors";
import consultations from "./routes/consultations";
dotenv.config();
const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req: Request, res: Response) => {
  res.send('API is running ✅');
});

// Routes
app.use('/users', userRoutes);
app.use('/consultations',consultations);
app.use('/appointments', appointmentRoutes);
app.use("/doctors", doctorRoutes);

// 404 Not Found
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler (optional)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create HTTP server instead of app.listen
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your React dev server
    methods: ["GET", "POST"],
  },
});


// Register signaling logic
registerSocketHandlers(io);

// Start server
server.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
