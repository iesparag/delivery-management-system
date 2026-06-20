import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import analyticsRoutes from '../src/routes/analytics.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/analytics', analyticsRoutes);

// Mock JWT authentication middleware
jest.mock('../src/middlewares/auth.js', () => ({
  authenticateJWT: (req, res, next) => {
    req.tenantId = 1;
    next();
  },
  roleBasedAccess: () => (req, res, next) => next(),
}));

beforeEach(async () => {
  await prisma.$connect();
  await prisma.user.create({ data: { email: 'user1@example.com', tenantId: 1, roleId: 1 } });
  await prisma.task.create({ data: { description: 'Test Task', status: 'Pending', tenantId: 1, userId: 1 } });
});

afterEach(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Analytics API', () => {
  it('should get task status analytics', async () => {
    const response = await request(app).get('/analytics/task-status');

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toHaveProperty('status', 'Pending');
  });

  it('should get agent performance analytics', async () => {
    const response = await request(app).get('/analytics/agent-performance');

    expect(response.status).toBe(200);
    expect(response.body[0]).toHaveProperty('userId', 1);
    expect(response.body[0]).toHaveProperty('completedTasks', 0);
  });

  it('should get tenant activity analytics', async () => {
    const response = await request(app).get('/analytics/tenant-activity');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('tasksCreated', 1);
    expect(response.body).toHaveProperty('usersActive', 1);
  });
});
