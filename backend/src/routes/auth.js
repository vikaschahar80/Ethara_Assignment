const router = require('express').Router();
const { signup, login, me, signupValidation, loginValidation } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.post('/signup', signupValidation, validate, signup);
router.post('/login', loginValidation, validate, login);
router.get('/me', authenticate, me);

module.exports = router;
