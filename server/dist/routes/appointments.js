"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
/**
 * GET /appointments/nearby-doctors
 * Find doctors by specialty near a patient's location (within radius in km)
 * Query params: specialty, latitude, longitude, radius (km)
 */
router.get('/nearby-doctors', async (req, res) => {
    const { specialty, latitude, longitude, radius } = req.query;
    // Validate inputs
    if (!specialty || !latitude || !longitude || !radius) {
        return res.status(400).json({
            error: 'Missing query parameters: specialty, latitude, longitude, radius are required.',
        });
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    const radiusInKm = Number(radius);
    if (isNaN(lat) || isNaN(lng) || isNaN(radiusInKm)) {
        return res.status(400).json({ error: 'Invalid latitude, longitude, or radius.' });
    }
    try {
        // Fetch doctors with specialty (case-insensitive) and valid location
        const doctors = await prisma.doctor.findMany({
            where: {
                specialty: {
                    equals: specialty,
                    mode: 'insensitive',
                },
            },
            include: {
                user: true,
            },
        });
        // Filter doctors by distance (Haversine formula)
        const nearby = doctors.filter((doc) => {
            if (!doc.user?.latitude || !doc.user?.longitude)
                return false;
            const dLat = deg2rad(doc.user.latitude - lat);
            const dLng = deg2rad(doc.user.longitude - lng);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(deg2rad(lat)) *
                    Math.cos(deg2rad(doc.user.latitude)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = 6371 * c; // Earth radius in km
            return distance <= radiusInKm;
        });
        res.json({ doctors: nearby });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch nearby doctors.' });
    }
});
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
/**
 * POST /appointments/book
 * Body: patientId, doctorId, notes
 */
router.post('/book', async (req, res) => {
    const { patientId, doctorId, notes } = req.body;
    if (!patientId || !doctorId) {
        return res.status(400).json({ error: 'patientId and doctorId are required.' });
    }
    try {
        // Check patient and doctor exist
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
        if (!patient || !doctor) {
            return res.status(404).json({ error: 'Doctor or patient not found.' });
        }
        const consultation = await prisma.consultation.create({
            data: {
                patientId,
                doctorId,
                notes,
            },
        });
        res.status(201).json({ message: 'Appointment booked', consultation });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not book appointment.' });
    }
});
exports.default = router;
