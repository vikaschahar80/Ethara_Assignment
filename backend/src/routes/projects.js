const router = require('express').Router();
const {
  getProjects, getProject, createProject, updateProject, deleteProject,
  addMember, removeMember, projectValidation, memberValidation,
} = require('../controllers/projectController');
const { authenticate } = require('../middleware/auth');
const { requireProjectMember, requireProjectAdmin } = require('../middleware/rbac');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getProjects);
router.post('/', projectValidation, validate, createProject);
router.get('/:id', requireProjectMember, getProject);
router.put('/:id', requireProjectMember, requireProjectAdmin, projectValidation, validate, updateProject);
router.delete('/:id', requireProjectMember, requireProjectAdmin, deleteProject);

// Member management
router.post('/:id/members', requireProjectMember, requireProjectAdmin, memberValidation, validate, addMember);
router.delete('/:id/members/:userId', requireProjectMember, requireProjectAdmin, removeMember);

// Tasks under project
const { getProjectTasks, createTask, taskValidation } = require('../controllers/taskController');
router.get('/:projectId/tasks', requireProjectMember, getProjectTasks);
router.post('/:projectId/tasks', requireProjectMember, taskValidation, validate, createTask);

module.exports = router;
