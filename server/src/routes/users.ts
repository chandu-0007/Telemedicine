import express from 'express';
import { PrismaClient, Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/Auth';
const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET as string;

// Register
router.post('/register', async (req, res) => {
  const { phone, name, role, address, latitude, longitude } = req.body;

  if (!phone || !name || !role || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ status: false, error: 'All fields are required.' });
  }

  if (!['patient', 'doctor', 'pharmacy'].includes(role)) {
    return res.status(400).json({ status: false, error: 'Invalid role.' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ status: false, error: 'User already exists.' });
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
    if (role === 'patient') {
      await prisma.patient.create({ data: { userId: user.id } });
    } else if (role === 'doctor') {
      await prisma.doctor.create({
        data: {
          userId: user.id,
          registrationId: 'TEMP123', // Replace with real data
        },
      });
    } else if (role === 'pharmacy') {
      await prisma.pharmacy.create({
        data: {
          userId: user.id,
          licenseId: 'TEMP456', // Replace with real data
        },
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ status: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
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


router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.userId;
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId }
    })
    res.status(200).json({ status: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: 'Failed to fetch user' });
  }
})
export default router;