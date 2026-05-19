const router = require('express').Router();
const { updateTask, deleteTask, getAllUserTasks, taskValidation } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(authenticate);

router.get('/', getAllUserTasks);
router.put('/:id', taskValidation, validate, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
