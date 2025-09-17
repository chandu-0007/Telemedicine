import express from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/Auth';
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Register
router.post("/register", async (req, res) => {
  const {
    phone,
    name,
    role,
    address,
    latitude,
    longitude,
    age,
    gender,
    registrationId,
    specialty,
    experience,
    hospitalName,
    licenseId,
  } = req.body;

  if (!phone || !name || !role || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ status: false, error: "All fields are required." });
  }

  if (!["patient", "doctor", "pharmacy"].includes(role)) {
    return res.status(400).json({ status: false, error: "Invalid role." });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ status: false, error: "User already exists." });
    }

    const user = await prisma.user.create({
      data: {
        phone,
        name,
        role,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
    });

    // Role-specific creation
    if (role === "patient") {
      await prisma.patient.create({
        data: {
          userId: user.id,
          age: age ? parseInt(age) : null,
          gender: gender || null,
        },
      });
    } else if (role === "doctor") {
      if (!registrationId) {
        return res.status(400).json({ status: false, error: "registrationId is required for doctors." });
      }
      await prisma.doctor.create({
        data: {
          userId: user.id,
          registrationId,
          specialty: specialty || null,
          experience: experience ? parseInt(experience) : null,
          hospitalName: hospitalName || null,
          isAvailable: true,
        },
      });
    } else if (role === "pharmacy") {
      if (!licenseId) {
        return res.status(400).json({ status: false, error: "licenseId is required for pharmacies." });
      }
      await prisma.pharmacy.create({
        data: {
          userId: user.id,
          licenseId,
        },
      });
    }
       const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ status: true,token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, error: "Server error" });
  }
});



// Login
router.post('/login', async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ status: false, error: 'Phone is required.' });

  try {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(404).json({ status: false, error: 'User not found.' });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ status: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Login failed' });
  }
});


// users.ts
  router.get('/me', authMiddleware, async (req, res) => {
    try {
      if(!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      } 
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: {
          patient: true,
          doctor: true,
          pharmacy: true,
        },
      });
      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Could not fetch user" });
    }
  });

export default router;