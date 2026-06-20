import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../src/routes/users.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/users', userRoutes);

// Mock JWT authentication middleware
jest.mock('../src/middlewares/auth.js', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 1;
    req.tenantId = 1;
    req.roleName = 'Admin';
    next();
  },
  roleBasedAccess: () => (req, res, next) => next(),
}));

beforeEach(async () => {
  await prisma.$connect();
  await prisma.user.deleteMany(); // Clear previous test data
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe('Admin User Management', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'newuser@example.com', password: 'password', role: 'User', tenantId: 1 });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('newuser@example.com');
  });

  it('should update a user', async () => {
    const user = await prisma.user.create({
      data: { email: 'userupdate@example.com', password: 'password', tenantId: 1, role: 'User' },
    });

    const response = await request(app)
      .put(`/users/${user.id}`)
      .send({ email: 'updateduser@example.com', role: 'User' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('updateduser@example.com');
  });

  it('should retrieve a user by ID', async () => {
    const user = await prisma.user.create({
      data: { email: 'usertoget@example.com', password: 'password', tenantId: 1, role: 'User' },
    });

    const response = await request(app)
      .get(`/users/${user.id}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('usertoget@example.com');
  });

  it('should delete a user', async () => {
    const user = await prisma.user.create({
      data: { email: 'usertodelete@example.com', password: 'password', tenantId: 1, role: 'User' },
    });

    const response = await request(app)
      .delete(`/users/${user.id}`);

    expect(response.status).toBe(204);
  });

  it('should toggle a user activation', async () => {
    const user = await prisma.user.create({
      data: { email: 'usertoactivate@example.com', password: 'password', tenantId: 1, role: 'User', deletedAt: new Date() },
    });

    const response = await request(app)
      .post(`/users/${user.id}/toggle`)
      .send({ active: true });

    expect(response.status).toBe(200);
    expect(response.body.deletedAt).toBeNull();
  });
});
