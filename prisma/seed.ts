import prisma from '../src/config/database.js';

async function main() {
  const superAdmin = await prisma.superAdmin.create({
    data: {
      email: 'admin@example.com',
    },
  });

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Tenant1',
    },
  });

  const role = await prisma.role.create({
    data: {
      name: 'Manager'
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      tenantId: tenant.id,
      role: {
        connect: { id: role.id }
      }
    },
  });

  await prisma.task.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      description: 'Deliver package X',
      status: 'Pending'
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
