import express from 'express';
import { authenticateJWT, roleBasedAccess } from '../middlewares/auth.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Middleware to ensure only Super Admins can access
const superAdminAccess = roleBasedAccess(['SuperAdmin']);

// Create a new tenant
router.post('/', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { name } = req.body;
    const newTenant = await prisma.tenant.create({ data: { name } });
    logger.info(`Tenant created: ${newTenant.name}`);
    res.status(201).json(newTenant);
  } catch (error) {
    logger.error(`Error creating tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update tenant information
router.put('/:id', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const updatedTenant = await prisma.tenant.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });

    logger.info(`Tenant updated: ${updatedTenant.name}`);
    res.json(updatedTenant);
  } catch (error) {
    logger.error(`Error updating tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Retrieve a tenant by ID
router.get('/:id', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findUnique({ where: { id: parseInt(id, 10) } });

    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    res.json(tenant);
  } catch (error) {
    logger.error(`Error retrieving tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a tenant
router.delete('/:id', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tenant.delete({ where: { id: parseInt(id, 10) } });

    logger.info(`Tenant deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Suspend a tenant
router.post('/:id/suspend', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const suspendedTenant = await prisma.tenant.update({
      where: { id: parseInt(id, 10) },
      data: { deletedAt: new Date() },
    });

    logger.info(`Tenant suspended: ${suspendedTenant.name}`);
    res.json(suspendedTenant);
  } catch (error) {
    logger.error(`Error suspending tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Activate a suspended tenant
router.post('/:id/activate', authenticateJWT, superAdminAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const activatedTenant = await prisma.tenant.update({
      where: { id: parseInt(id, 10) },
      data: { deletedAt: null },
    });

    logger.info(`Tenant activated: ${activatedTenant.name}`);
    res.json(activatedTenant);
  } catch (error) {
    logger.error(`Error activating tenant: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
