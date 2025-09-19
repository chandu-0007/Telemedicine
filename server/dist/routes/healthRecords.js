"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
// 📂 Multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Extend Request type to include `user` from auth middleware
// ✅ Upload health record
router.post("/", upload.single("file"), async (req, res) => {
    try {
        const { type, details } = req.body;
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        // Check patient exists
        const patient = await prisma.patient.findUnique({
            where: { userId },
        });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        const record = await prisma.healthRecord.create({
            data: {
                patientId: patient.id,
                type,
                fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
                details,
            },
        });
        res.json({ success: true, record });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "Failed to upload record" });
    }
});
// ✅ Get health records of logged-in patient
router.get("/", async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const patient = await prisma.patient.findUnique({ where: { userId } });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        const records = await prisma.healthRecord.findMany({
            where: { patientId: patient.id },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, records });
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Failed to fetch records" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const patient = await prisma.patient.findUnique({ where: { userId } });
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        // Check if record belongs to patient
        const record = await prisma.healthRecord.findUnique({
            where: { id: Number(id) },
        });
        if (!record || record.patientId !== patient.id) {
            return res.status(404).json({ error: "Record not found" });
        }
        await prisma.healthRecord.delete({
            where: { id: record.id },
        });
        res.json({ success: true, message: "Record deleted successfully" });
    }
    catch (err) {
        console.error("Delete error:", err);
        res.status(500).json({ error: "Failed to delete record" });
    }
});
exports.default = router;
