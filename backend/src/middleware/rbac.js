const prisma = require('../utils/prisma');

/**
 * Require global ADMIN role
 */
const requireGlobalAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Global admin access required' });
  }
  next();
};

/**
 * Checks that user is a member of the project (attaches membership to req)
 * req.params.projectId must be set
 */
const requireProjectMember = async (req, res, next) => {
  try {
    const { projectId, id } = req.params;
    const pid = projectId || id;

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: pid, userId: req.user.id } },
    });

    // Global admins bypass project membership check
    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Requires project-level ADMIN role (or global ADMIN)
 * Must be used after requireProjectMember
 */
const requireProjectAdmin = async (req, res, next) => {
  if (req.user.role === 'ADMIN') return next(); // global admin bypasses
  if (!req.membership || req.membership.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Project admin access required' });
  }
  next();
};

module.exports = { requireGlobalAdmin, requireProjectMember, requireProjectAdmin };
