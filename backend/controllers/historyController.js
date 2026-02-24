// controllers/historyController.js
const QueryHistory = require('../models/QueryHistory');

const PAGE_SIZE = 20;

const historyController = {
    // GET /api/history?page=1
    async getHistory(req, res) {
        try {
            const page = Math.max(1, parseInt(req.query.page) || 1);
            const offset = (page - 1) * PAGE_SIZE;

            const { count, rows } = await QueryHistory.findAndCountAll({
                where: { userId: req.user.userId },
                order: [['created_at', 'DESC']],
                limit: PAGE_SIZE,
                offset
            });

            res.json({
                items: rows,
                total: count,
                page,
                totalPages: Math.ceil(count / PAGE_SIZE)
            });
        } catch (error) {
            console.error('[히스토리 조회 오류]:', error.message);
            res.status(500).json({ error: '히스토리를 불러오는 중 오류가 발생했습니다.' });
        }
    },

    // GET /api/history/session/:sessionId - 세션 전체 대화 조회
    async getSession(req, res) {
        try {
            const { sessionId } = req.params;
            const entries = await QueryHistory.findAll({
                where: { userId: req.user.userId, sessionId },
                order: [['created_at', 'ASC']]
            });
            res.json(entries);
        } catch (error) {
            console.error('[세션 조회 오류]:', error.message);
            res.status(500).json({ error: '세션을 불러오는 중 오류가 발생했습니다.' });
        }
    },

    // DELETE /api/history/:id
    async deleteHistory(req, res) {
        try {
            const { id } = req.params;
            const deleted = await QueryHistory.destroy({
                where: { id, userId: req.user.userId }
            });

            if (!deleted) {
                return res.status(404).json({ error: '히스토리 항목을 찾을 수 없습니다.' });
            }

            res.json({ success: true });
        } catch (error) {
            console.error('[히스토리 삭제 오류]:', error.message);
            res.status(500).json({ error: '히스토리 삭제 중 오류가 발생했습니다.' });
        }
    }
};

module.exports = historyController;
