const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validateBody, registerSchema, loginSchema } = require('../middleware/validate');

// Public Auth Endpoints
router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected endpoint to fetch current user profile
router.get('/me', authMiddleware, authController.me);

module.exports = router;
