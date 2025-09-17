// routes/doctors.ts
import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/available", async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isAvailable: true },
      include: { user: true },
    });
    res.json({ doctors });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch doctors" });
  }
});

export default router;
