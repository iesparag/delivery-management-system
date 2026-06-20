import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import express from 'express';
import tenantRoutes from '../src/routes/tenant.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/tenants', tenantRoutes);

// Mock JWT authentication middleware
jest.mock('../src/middlewares/auth.js', () => ({
  authenticateJWT: (req, res, next) => {
    req.userId = 1;
    req.tenantId = 1;
    req.roleName = 'SuperAdmin';
    next();
  },
  roleBasedAccess: () => (req, res, next) => next(),
}));

beforeEach(async () => {
  await prisma.$connect();
  await prisma.tenant.deleteMany(); // Clear previous test data
});

afterEach(async () => {
  await prisma.tenant.deleteMany();
  await prisma.$disconnect();
});

describe('Super Admin Tenant Management', () => {
  it('should create a new tenant', async () => {
    const response = await request(app)
      .post('/tenants')
      .send({ name: 'NewTenant' });

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('NewTenant');
  });

  it('should update tenant information', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'TenantToUpdate' },
    });

    const response = await request(app)
      .put(`/tenants/${tenant.id}`)
      .send({ name: 'UpdatedTenant' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('UpdatedTenant');
  });

  it('should suspend a tenant', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'TenantToSuspend' },
    });

    const response = await request(app)
      .post(`/tenants/${tenant.id}/suspend`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.deletedAt).not.toBeNull();
  });

  it('should activate a suspended tenant', async () => {
    const tenant = await prisma.tenant.create({
      data: { name: 'TenantToActivate', deletedAt: new Date() },
    });

    const response = await request(app)
      .post(`/tenants/${tenant.id}/activate`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.deletedAt).toBeNull();
  });
});
