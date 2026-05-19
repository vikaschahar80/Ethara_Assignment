const router = require('express').Router();
const { getUsers } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getUsers);

module.exports = router;
