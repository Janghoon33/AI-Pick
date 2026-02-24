// routes/historyRoutes.js
const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const authMiddleware = require('../middleware/auth');

// GET /api/history - 히스토리 목록 조회 (인증 필요)
router.get('/history', authMiddleware, historyController.getHistory);

// GET /api/history/session/:sessionId - 세션 전체 대화 조회 (인증 필요)
router.get('/history/session/:sessionId', authMiddleware, historyController.getSession);

// DELETE /api/history/:id - 항목 삭제 (인증 필요)
router.delete('/history/:id', authMiddleware, historyController.deleteHistory);

module.exports = router;
