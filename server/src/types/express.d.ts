// src/types/express.d.ts
import "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      role?: 'patient' | 'doctor' | 'pharmacy';
    }
  }
}
