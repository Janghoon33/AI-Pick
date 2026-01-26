// routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

// GET /api/services - 사용 가능한 AI 서비스 목록 조회 (공개)
router.get('/services', aiController.getServices);

// POST /api/ask - AI에게 질문하기 (인증 필요)
router.post('/ask', authMiddleware, aiController.askQuestion);

module.exports = router;
