import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [process.env.PRISMA_LOG || 'info'],
});

prisma.$on('beforeExit', async () => {
  console.log('Prisma client is disconnecting');
});

export default prisma;
