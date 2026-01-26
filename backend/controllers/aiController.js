// controllers/aiController.js
const aiService = require('../service/aiService');

const aiController = {
    // 사용 가능한 서비스 목록 조회
    getServices(req, res) {
        try {
            const serviceList = aiService.getServices();

            res.json(serviceList);
        } catch (error) {
            console.error('서비스 목록 조회 오류:', error);
            res.status(500).json({
                error: '서비스 목록을 가져오는 중 오류가 발생했습니다.'
            });
        }
    },

    // AI에게 질문 요청
    async askQuestion(req, res) {
        try {
            const { service, question } = req.body;

            if (!service || !question) {
                return res.status(400).json({
                    error: '서비스와 질문을 모두 입력해주세요.'
                });
            }

            const result = await aiService.askQuestion(req.user.userId, service, question);

            res.json(result);
        } catch (error) {
            console.error(`[AI 호출 오류]:`, error.message);
            const status = error.status || 500;
            res.status(status).json({
                error: error.message || 'AI 서비스 요청 중 오류가 발생했습니다.'
            });
        }
    }
};

module.exports = aiController;
