// src/routes/consultations.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/Auth"; // your existing middleware

const prisma = new PrismaClient();
const router = Router();

router.post("/", authMiddleware, async (req: Request, res: Response) => {
  try {
    const doctorUserId = (req as any).userId;
    const { patientUserId, notes } = req.body;

    if (!doctorUserId) return res.status(401).json({ error: "Unauthorized" });
    if (!patientUserId) return res.status(400).json({ error: "patientUserId required" });

    const doctor = await prisma.doctor.findUnique({ where: { userId: Number(doctorUserId) } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const patient = await prisma.patient.findUnique({ where: { userId: Number(patientUserId) } });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const consultation = await prisma.consultation.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        notes: notes || "",
      },
    });

    res.json({ success: true, consultation });
  } catch (err) {
    console.error("Consultation save error:", err);
    res.status(500).json({ error: "Failed to save consultation" });
  }
});

export default router;
