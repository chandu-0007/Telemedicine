import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/Auth";

const prisma = new PrismaClient();
const router = Router();

// 📂 Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Extend Request type to include `user` from auth middleware
// ✅ Upload health record
router.post(
  "/",
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const { type, details } = req.body;
      const userId = req.userId

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
    } catch (err) {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Failed to upload record" });
    }
  }
);

// ✅ Get health records of logged-in patient
router.get("/", async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

export default router;
