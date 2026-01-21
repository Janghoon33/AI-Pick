// controllers/aiController.js
const services = require('../config/services');
const User = require('../models/User');

class AIController {
  // 사용 가능한 서비스 목록 조회
  static getServices(req, res) {
    try {
      const serviceList = Object.keys(services).map(key => ({
        id: key,
        name: services[key].name,
        model: services[key].model
      }));

      res.json(serviceList);
    } catch (error) {
      console.error('서비스 목록 조회 오류:', error);
      res.status(500).json({
        error: '서비스 목록을 가져오는 중 오류가 발생했습니다.'
      });
    }
  }

  // AI에게 질문 요청
  static async askQuestion(req, res) {
    const { service, question } = req.body;

    if (!service || !question) {
      return res.status(400).json({
        error: '서비스와 질문을 모두 입력해주세요.'
      });
    }

    const aiService = services[service];
    if (!aiService) {
      return res.status(400).json({
        error: '지원하지 않는 서비스입니다.'
      });
    }

    try {
      const user = await User.findByPk(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
      }

      const apiKey = user.getApiKey(service);
      if (!apiKey) {
        return res.status(400).json({
          error: `${aiService.name}의 API 키가 등록되지 않았습니다. 설정에서 API 키를 등록해주세요.`
        });
      }

      // AI 서비스 호출
      const response = await AIController._callAIService(aiService, question, apiKey);

      // 응답 파싱
      const answer = aiService.extractAnswer(response);
      const tokens = aiService.extractTokens(response);

      res.json({
        service: aiService.name,
        answer,
        tokens
      });

    } catch (error) {
      // 상세 에러 로깅 (디버깅용)
      console.error(`[AI 호출 오류] ${service}:`, error.message);
      
      res.status(500).json({
        error: error.message || 'AI 서비스 요청 중 오류가 발생했습니다.',
        service: aiService.name
      });
    }
  }

  // 실제 AI 서비스 호출 (private 메서드)
  static async _callAIService(aiService, question, apiKey) {
    const endpoint = aiService.getEndpoint(apiKey);
    const headers = aiService.createHeaders(apiKey);
    const body = aiService.createRequestBody(question);


    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        // 구글 API의 경우 상세 에러 내용이 JSON 바디에 포함되어 옴
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          throw new Error(`HTTP ${response.status}: ${errorText || '알 수 없는 에러'}`);
        }

        // 상세 에러 메시지 추출
        const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status} 오류`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // 네트워크 레벨 에러나 파싱 에러 처리
      throw error;
    }
  }
}

module.exports = AIController;