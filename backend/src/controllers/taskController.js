const { body } = require('express-validator');
const prisma = require('../utils/prisma');

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['TODO', 'IN_PROGRESS', 'DONE']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('assigneeId').optional(),
];

// ─── Get tasks for a project ──────────────────────────────────────────────────
const getProjectTasks = async (req, res, next) => {
  try {
    const { status, priority, assigneeId } = req.query;
    const where = { projectId: req.params.projectId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// ─── Create task ──────────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.projectId,
        assigneeId: assigneeId || null,
        createdById: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// ─── Update task ──────────────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can only update if they are the assignee; Admins and project admins can update all
    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    const canEdit =
      req.user.role === 'ADMIN' ||
      (membership && membership.role === 'ADMIN') ||
      task.assigneeId === req.user.id ||
      task.createdById === req.user.id;

    if (!canEdit) return res.status(403).json({ error: 'Not authorized to update this task' });

    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    });
    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
};

// ─── Delete task ──────────────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: task.projectId, userId: req.user.id } },
    });
    const canDelete =
      req.user.role === 'ADMIN' ||
      (membership && membership.role === 'ADMIN') ||
      task.createdById === req.user.id;

    if (!canDelete) return res.status(403).json({ error: 'Not authorized to delete this task' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Get all tasks (for /tasks page) ─────────────────────────────────────────
const getAllUserTasks = async (req, res, next) => {
  try {
    const { status, priority } = req.query;
    let where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (req.user.role !== 'ADMIN') {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        select: { projectId: true },
      });
      const projectIds = memberships.map((m) => m.projectId);
      where.projectId = { in: projectIds };
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectTasks, createTask, updateTask, deleteTask, getAllUserTasks, taskValidation };
