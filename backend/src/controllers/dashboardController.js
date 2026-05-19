const prisma = require('../utils/prisma');

const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    let projectIds;

    if (req.user.role === 'ADMIN') {
      const allProjects = await prisma.project.findMany({ select: { id: true } });
      projectIds = allProjects.map((p) => p.id);
    } else {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      projectIds = memberships.map((m) => m.projectId);
    }

    const [totalProjects, totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, recentTasks] =
      await Promise.all([
        prisma.project.count(
          req.user.role === 'ADMIN' ? {} : { where: { members: { some: { userId: req.user.id } } } }
        ),
        prisma.task.count({ where: { projectId: { in: projectIds } } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
        prisma.task.findMany({
          where: {
            projectId: { in: projectIds },
            dueDate: { lt: now },
            status: { not: 'DONE' },
          },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        }),
        prisma.task.findMany({
          where: { projectId: { in: projectIds } },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

    res.json({
      stats: {
        totalProjects,
        totalTasks,
        todoTasks,
        inProgressTasks,
        doneTasks,
        overdueCount: overdueTasks.length,
      },
      overdueTasks,
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
