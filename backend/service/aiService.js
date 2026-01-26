// service/aiService.js
const services = require('../config/services');
const User = require('../models/User');

const aiService = {
    // 사용 가능한 서비스 목록 조회
    getServices() {
        return Object.keys(services).map(key => ({
            id: key,
            name: services[key].name,
            model: services[key].model
        }));
    },

    // AI에게 질문 요청
    async askQuestion(userId, service, question) {
        const aiServiceConfig = services[service];
        if (!aiServiceConfig) {
            const error = new Error('지원하지 않는 서비스입니다.');
            error.status = 400;
            throw error;
        }

        const user = await User.findByPk(userId);
        if (!user) {
            const error = new Error('사용자를 찾을 수 없습니다.');
            error.status = 404;
            throw error;
        }

        const apiKey = user.getApiKey(service);
        if (!apiKey) {
            const error = new Error(`${aiServiceConfig.name}의 API 키가 등록되지 않았습니다. 설정에서 API 키를 등록해주세요.`);
            error.status = 400;
            throw error;
        }

        const response = await this._callAIService(aiServiceConfig, question, apiKey);
        const answer = aiServiceConfig.extractAnswer(response);
        const tokens = aiServiceConfig.extractTokens(response);

        return {
            service: aiServiceConfig.name,
            answer,
            tokens
        };
    },

    // 실제 AI 서비스 호출 (private)
    async _callAIService(aiServiceConfig, question, apiKey) {
        const endpoint = aiServiceConfig.getEndpoint(apiKey);
        const headers = aiServiceConfig.createHeaders(apiKey);
        const body = aiServiceConfig.createRequestBody(question);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorText);
            } catch (e) {
                throw new Error(`HTTP ${response.status}: ${errorText || '알 수 없는 에러'}`);
            }

            const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status} 오류`;
            throw new Error(errorMessage);
        }

        return await response.json();
    }
};

module.exports = aiService;
