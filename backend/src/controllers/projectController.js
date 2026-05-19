const { body } = require('express-validator');
const prisma = require('../utils/prisma');

// ─── Validation ───────────────────────────────────────────────────────────────
const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
];

const memberValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('role').optional().isIn(['ADMIN', 'MEMBER']),
];

// ─── Get all projects for current user ────────────────────────────────────────
const getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'ADMIN') {
      projects = await prisma.project.findMany({
        include: {
          owner: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      const memberships = await prisma.projectMember.findMany({
        where: { userId: req.user.id },
        include: {
          project: {
            include: {
              owner: { select: { id: true, name: true, email: true } },
              members: { include: { user: { select: { id: true, name: true, email: true } } } },
              _count: { select: { tasks: true } },
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
      projects = memberships.map((m) => ({ ...m.project, myRole: m.role }));
    }
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// ─── Get single project ───────────────────────────────────────────────────────
const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { joinedAt: 'asc' },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// ─── Create project ───────────────────────────────────────────────────────────
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// ─── Update project ───────────────────────────────────────────────────────────
const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// ─── Delete project ───────────────────────────────────────────────────────────
const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

// ─── Add member ───────────────────────────────────────────────────────────────
const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId: user.id } },
    });
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId: user.id, role: role || 'MEMBER' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
};

// ─── Remove member ────────────────────────────────────────────────────────────
const removeMember = async (req, res, next) => {
  try {
    const { id: projectId, userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot remove yourself' });
    }
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember, projectValidation, memberValidation,
};
