import express from 'express';
import { authenticateJWT, roleBasedAccess } from '../middlewares/auth.js';
import prisma from '../config/database.js';
import logger from '../utils/logger.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();

const prismaClient = new PrismaClient();

// Middleware for ensuring only Users or Admins can access
const userAccess = roleBasedAccess(['User', 'Admin', 'SuperAdmin']);

// Create a new task
router.post('/', authenticateJWT, userAccess, async (req, res) => {
  try {
    const { description, status, userId } = req.body;
    const { tenantId } = req;

    const newTask = await prismaClient.task.create({
      data: { description, status, tenantId, userId },
    });

    logger.info(`Task created: ${newTask.description}`);
    res.status(201).json(newTask);
  } catch (error) {
    logger.error(`Error creating task: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update a task
router.put('/:id', authenticateJWT, userAccess, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, status, userId } = req.body;
    const { tenantId } = req;

    const updatedTask = await prismaClient.task.update({
      where: { id: parseInt(id, 10) },
      data: { description, status, tenantId, userId },
    });

    logger.info(`Task updated: ${updatedTask.description}`);
    res.json(updatedTask);
  } catch (error) {
    logger.error(`Error updating task: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateJWT, userAccess, async (req, res) => {
  try {
    const { id } = req.params;

    await prismaClient.task.delete({ where: { id: parseInt(id, 10) } });

    logger.info(`Task deleted: ${id}`);
    res.status(204).send();
  } catch (error) {
    logger.error(`Error deleting task: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get all tasks for a tenant
router.get('/', authenticateJWT, userAccess, async (req, res) => {
  try {
    const { tenantId } = req;

    const tasks = await prismaClient.task.findMany({ where: { tenantId } });
    res.json(tasks);
  } catch (error) {
    logger.error(`Error retrieving tasks: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get a task by ID
router.get('/:id', authenticateJWT, userAccess, async (req, res) => {
  try {
    const { id } = req.params;

    const task = await prismaClient.task.findUnique({ where: { id: parseInt(id, 10) } });

    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (error) {
    logger.error(`Error retrieving task: ${error.message}`);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export default router;
