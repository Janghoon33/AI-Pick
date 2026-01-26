// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 공개 라우트
router.post('/google', authController.googleLogin);

// 인증 필요 라우트
router.get('/me', authMiddleware, authController.getMe);
router.post('/api-keys', authMiddleware, authController.saveApiKey);
router.delete('/api-keys/:service', authMiddleware, authController.deleteApiKey);
router.get('/api-keys/status', authMiddleware, authController.getApiKeyStatus);

module.exports = router;
