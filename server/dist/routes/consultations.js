"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/consultations.ts
const express_1 = require("express");
const client_1 = require("@prisma/client");
const Auth_1 = require("../middleware/Auth"); // your existing middleware
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.post("/", Auth_1.authMiddleware, async (req, res) => {
    try {
        const doctorUserId = req.userId;
        const { patientUserId, notes } = req.body;
        if (!doctorUserId)
            return res.status(401).json({ error: "Unauthorized" });
        if (!patientUserId)
            return res.status(400).json({ error: "patientUserId required" });
        const doctor = await prisma.doctor.findUnique({ where: { userId: Number(doctorUserId) } });
        if (!doctor)
            return res.status(404).json({ error: "Doctor not found" });
        const patient = await prisma.patient.findUnique({ where: { userId: Number(patientUserId) } });
        if (!patient)
            return res.status(404).json({ error: "Patient not found" });
        const consultation = await prisma.consultation.create({
            data: {
                doctorId: doctor.id,
                patientId: patient.id,
                notes: notes || "",
            },
        });
        res.json({ success: true, consultation });
    }
    catch (err) {
        console.error("Consultation save error:", err);
        res.status(500).json({ error: "Failed to save consultation" });
    }
});
exports.default = router;
