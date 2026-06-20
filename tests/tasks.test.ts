import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import taskRoutes from '../src/routes/tasks.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

// Mock JWT authentication middleware
jest.mock('../src/middlewares/auth.js', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 1;
    req.tenantId = 1;
    req.roleName = 'User';
    next();
  },
  roleBasedAccess: () => (req, res, next) => next(),
}));

beforeEach(async () => {
  await prisma.$connect();
  await prisma.task.deleteMany(); // Clear previous test data
});

afterEach(async () => {
  await prisma.task.deleteMany();
  await prisma.$disconnect();
});

describe('Task Management API', () => {
  it('should create a new task', async () => {
    const response = await request(app)
      .post('/tasks')
      .send({ description: 'New Task', status: 'Pending', userId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.description).toBe('New Task');
  });

  it('should update a task', async () => {
    const task = await prisma.task.create({
      data: { description: 'Task to Update', status: 'Pending', tenantId: 1 },
    });

    const response = await request(app)
      .put(`/tasks/${task.id}`)
      .send({ description: 'Updated Task', status: 'In Progress' });

    expect(response.status).toBe(200);
    expect(response.body.description).toBe('Updated Task');
  });

  it('should delete a task', async () => {
    const task = await prisma.task.create({
      data: { description: 'Task to Delete', status: 'Pending', tenantId: 1 },
    });

    const response = await request(app)
      .delete(`/tasks/${task.id}`);

    expect(response.status).toBe(204);
  });

  it('should retrieve a list of tasks', async () => {
    await prisma.task.create({
      data: { description: 'Task 1', status: 'Pending', tenantId: 1 },
    });
    await prisma.task.create({
      data: { description: 'Task 2', status: 'Completed', tenantId: 1 },
    });

    const response = await request(app)
      .get('/tasks');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should retrieve a task by ID', async () => {
    const task = await prisma.task.create({
      data: { description: 'Task to Get', status: 'Pending', tenantId: 1 },
    });

    const response = await request(app)
      .get(`/tasks/${task.id}`);

    expect(response.status).toBe(200);
    expect(response.body.description).toBe('Task to Get');
  });
});
