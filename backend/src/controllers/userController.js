const prisma = require('../utils/prisma');

const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers };
