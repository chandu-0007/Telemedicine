import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/Auth';
const router = express.Router();
const prisma = new PrismaClient();

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, notes } = req.body;

    // doctorId is actually user.id, so find the Doctor row
    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorId },
    });
    const patient = await prisma.patient.findUnique({
      where: { userId: req.userId },
    });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const appointment = await prisma.appointment.create({
      data: {
        doctorId: Number(doctor.id), // use Doctor.id, not User.id
        patientId: Number(patient?.id), // from token or lookup
        date: new Date(date),
        notes,
      },
    });

    res.json({ appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

router.get("/my", authMiddleware, async (req, res) => {
  try {
    // find the patientId for this user
    const patient = await prisma.patient.findUnique({
      where: { userId: req.userId },
    });
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    const appointments = await prisma.appointment.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: {
          include: { user: true }, // get doctor's name, phone, etc.
        },
      },
      orderBy: { date: "asc" },
    });

    res.json({ appointments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// 📌 Doctor confirms or cancels appointment
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
   
    const { status } = req.body; // "confirmed", "canceled", "completed"

    const appointment = await prisma.appointment.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json({ appointment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating appointment" });
  }
});

// 📌 Get appointments for patient
router.get("/patient", authMiddleware, async (req, res) => {


  const appointments = await prisma.appointment.findMany({
    where: { patientId: req.userId },
    include: { doctor: { include: { user: true } }, consultation: true },
  });

  res.json({ appointments });
});

// 📌 Get appointments for doctor
router.get("/doctor", authMiddleware, async (req, res) => {

  const appointments = await prisma.appointment.findMany({
    where: { doctorId: req.userId },
    include: { patient: { include: { user: true } }, consultation: true },
  });

  res.json({ appointments });
});

export default router;
