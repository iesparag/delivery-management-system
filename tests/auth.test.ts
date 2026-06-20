import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

process.env.JWT_SECRET = 'test-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';

beforeEach(async () => {
  await prisma.$connect();
  await prisma.role.create({ data: { name: 'User' } });
});

afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.$disconnect();
});

describe('Authentication API', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password', tenantId: 1, role: 'User' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should login a user', async () => {
    // First register a user
    await request(app)
      .post('/auth/register')
      .send({ email: 'user@example.com', password: 'password', tenantId: 1, role: 'User' });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('refreshToken');
  });
});
