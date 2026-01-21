// routes/authRoutes.js
const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 공개 라우트
router.post('/google', AuthController.googleLogin);

// 인증 필요 라우트
router.get('/me', authMiddleware, AuthController.getMe);
router.post('/api-keys', authMiddleware, AuthController.saveApiKey);
router.delete('/api-keys/:service', authMiddleware, AuthController.deleteApiKey);
router.get('/api-keys/status', authMiddleware, AuthController.getApiKeyStatus);

module.exports = router;
