"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const Auth_1 = require("../middleware/Auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// 📌 Create consultation (doctor only)
router.post("/", Auth_1.authMiddleware, async (req, res) => {
    try {
        const { appointmentId, notes, prescription } = req.body;
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment || appointment.doctorId !== req.userId) {
            return res.status(404).json({ message: "Appointment not found or not assigned to you" });
        }
        const consultation = await prisma.consultation.create({
            data: {
                doctorId: Number(req.userId),
                patientId: appointment.patientId,
                appointmentId,
                notes,
                prescription,
            },
        });
        // Mark appointment as completed
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: "completed" },
        });
        res.json({ consultation });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating consultation" });
    }
});
// 📌 Get consultations for patient
router.get("/patient", Auth_1.authMiddleware, async (req, res) => {
    const consultations = await prisma.consultation.findMany({
        where: { patientId: req.userId },
        include: { doctor: { include: { user: true } }, appointment: true },
    });
    res.json({ consultations });
});
// 📌 Get consultations for doctor
router.get("/doctor", Auth_1.authMiddleware, async (req, res) => {
    const consultations = await prisma.consultation.findMany({
        where: { doctorId: req.userId },
        include: { patient: { include: { user: true } }, appointment: true },
    });
    res.json({ consultations });
});
exports.default = router;
