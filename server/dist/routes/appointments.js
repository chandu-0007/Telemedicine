"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const Auth_1 = require("../middleware/Auth");
const twilio_1 = __importDefault(require("twilio"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const client = (0, twilio_1.default)(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
router.post("/", Auth_1.authMiddleware, async (req, res) => {
    try {
        const { doctorId, date, notes } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        // doctorId is actually user.id, so find the Doctor row
        const doctor = await prisma.doctor.findUnique({
            where: { userId: doctorId },
        });
        const patient = await prisma.patient.findUnique({
            where: { userId: req.userId },
        });
        if (!doctor)
            return res.status(404).json({ error: "Doctor not found" });
        const appointment = await prisma.appointment.create({
            data: {
                doctorId: Number(doctor.id), // use Doctor.id, not User.id
                patientId: Number(patient?.id), // from token or lookup
                date: new Date(date),
                notes,
            },
        });
        const patientPhone = `whatsapp:+91${user.phone}`;
        const doctorName = user.name;
        // await client.messages.create({
        //   from: process.env.TWILIO_WHATSAPP, // Twilio sandbox
        //   to: patientPhone,
        //   body: `✅ Appointment Confirmed!\nDoctor: Dr. ${doctorName}\n📅 Date: ${appointment.date.toDateString()}\n📝 Notes: ${appointment.notes || "N/A"}`,
        // });
        res.json({ appointment });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to book appointment" });
    }
});
router.get("/my", Auth_1.authMiddleware, async (req, res) => {
    try {
        // find the patientId for this user
        const patient = await prisma.patient.findUnique({
            where: { userId: req.userId },
        });
        if (!patient)
            return res.status(404).json({ error: "Patient not found" });
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch appointments" });
    }
});
// 📌 Doctor confirms or cancels appointment
router.patch("/:id/status", Auth_1.authMiddleware, async (req, res) => {
    try {
        const { status } = req.body; // "confirmed", "canceled", "completed"
        const appointment = await prisma.appointment.update({
            where: { id: Number(req.params.id) },
            data: { status },
        });
        res.json({ appointment });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating appointment" });
    }
});
// 📌 Get appointments for patient
router.get("/patient", Auth_1.authMiddleware, async (req, res) => {
    const appointments = await prisma.appointment.findMany({
        where: { patientId: req.userId },
        include: { doctor: { include: { user: true } }, consultation: true },
    });
    res.json({ appointments });
});
// 📌 Get appointments for doctor
router.get("/doctor", Auth_1.authMiddleware, async (req, res) => {
    const appointments = await prisma.appointment.findMany({
        where: { doctorId: req.userId },
        include: { patient: { include: { user: true } }, consultation: true },
    });
    res.json({ appointments });
});
exports.default = router;
