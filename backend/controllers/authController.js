// controllers/authController.js
const authService = require('../service/authService');

const authController = {
    // Google 로그인
    async googleLogin(req, res) {
        try {
            const { credential } = req.body;

            if (!credential) {
                return res.status(400).json({
                    error: 'Google credential이 필요합니다.'
                });
            }

            const result = await authService.googleLogin(credential);

            res.json(result);
        } catch (error) {
            console.error('Google 로그인 오류:', error);
            const status = error.status || 401;
            res.status(status).json({
                error: error.message || '인증에 실패했습니다.'
            });
        }
    },

    // 현재 사용자 정보
    async getMe(req, res) {
        try {
            const result = await authService.getUserById(req.user.userId);

            res.json(result);
        } catch (error) {
            console.error('사용자 정보 조회 오류:', error);
            const status = error.status || 500;
            res.status(status).json({
                error: error.message || '서버 오류가 발생했습니다.'
            });
        }
    },

    // API 키 저장
    async saveApiKey(req, res) {
        try {
            const { service, apiKey } = req.body;

            if (!service || !apiKey) {
                return res.status(400).json({
                    error: '서비스와 API 키를 입력해주세요.'
                });
            }

            const result = await authService.saveApiKey(req.user.userId, service, apiKey);

            res.json(result);
        } catch (error) {
            console.error('API 키 저장 오류:', error);
            const status = error.status || 500;
            res.status(status).json({
                error: error.message || 'API 키 저장에 실패했습니다.'
            });
        }
    },

    // API 키 삭제
    async deleteApiKey(req, res) {
        try {
            const { service } = req.params;

            const result = await authService.deleteApiKey(req.user.userId, service);

            res.json(result);
        } catch (error) {
            console.error('API 키 삭제 오류:', error);
            const status = error.status || 500;
            res.status(status).json({
                error: error.message || 'API 키 삭제에 실패했습니다.'
            });
        }
    },

    // API 키 상태 조회
    async getApiKeyStatus(req, res) {
        try {
            const result = await authService.getApiKeyStatus(req.user.userId);

            res.json(result);
        } catch (error) {
            console.error('API 키 상태 조회 오류:', error);
            const status = error.status || 500;
            res.status(status).json({
                error: error.message || '서버 오류가 발생했습니다.'
            });
        }
    }
};

module.exports = authController;
