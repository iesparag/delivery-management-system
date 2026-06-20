import express from 'express';
import { authenticateJWT, roleBasedAccess } from '../middlewares/auth.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Middleware to ensure only Tenant Admins or above can access
const adminAccess = roleBasedAccess(['Admin', 'SuperAdmin']);

// Create a new user
router.post('/', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { email, password, role, tenantId } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const newUser = await prisma.user.create({
      data: { email, password, tenantId, role },
    });

    logger.info(`User created: ${newUser.email}`);
    res.status(201).json(newUser);
  } catch (error) {
    logger.error(`Error creating user: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Retrieve all users for a tenant
router.get('/', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { tenantId } = req;
    const users = await prisma.user.findMany({ where: { tenantId } });
    res.json(users);
  } catch (error) {
    logger.error(`Error retrieving users: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Retrieve a user by ID
router.get('/:id', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    logger.error(`Error retrieving user: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update user information
router.put('/:id', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { email, role },
    });

    logger.info(`User updated: ${updatedUser.email}`);
    res.json(updatedUser);
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a user
router.delete('/:id', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({ where: { id: parseInt(id, 10) } });

    logger.info(`User deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Activate or deactivate a user
router.post('/:id/toggle', authenticateJWT, adminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id, 10) },
      data: { deletedAt: active ? null : new Date() },
    });

    logger.info(`User ${active ? 'activated' : 'deactivated'}: ${updatedUser.email}`);
    res.json(updatedUser);
  } catch (error) {
    logger.error(`Error toggling user active state: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;