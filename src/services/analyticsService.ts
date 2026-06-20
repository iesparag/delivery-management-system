import prisma from '../config/database';

export const getTaskStatusAnalytics = async (tenantId: number) => {
  const statuses = await prisma.task.groupBy({
    by: ['status'],
    where: { tenantId },
    _count: { status: true },
  });
  return statuses;
};

export const getAgentPerformanceAnalytics = async (tenantId: number) => {
  const performance = await prisma.user.findMany({
    where: { tenantId },
    include: {
      tasks: {
        select: { status: true },
      },
    },
  });

  return performance.map(user => ({
    userId: user.id,
    completedTasks: user.tasks.filter(task => task.status === 'Completed').length,
    totalTasks: user.tasks.length,
  }));
};

export const getTenantActivityAnalytics = async (tenantId: number) => {
  const tasksCreated = await prisma.task.count({ where: { tenantId } });
  const usersActive = await prisma.user.count({ where: { tenantId } });
  return { tasksCreated, usersActive };
};
