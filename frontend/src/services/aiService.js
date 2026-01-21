// services/aiService.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class AIServiceAPI {
  // 토큰 가져오기
  static getToken() {
    return localStorage.getItem('token');
  }

  // 인증 헤더 생성
  static getAuthHeaders() {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * 사용 가능한 AI 서비스 목록 가져오기
   */
  static async getAvailableServices() {
    try {
      const response = await fetch(`${API_BASE_URL}/services`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: 서비스 목록을 가져올 수 없습니다.`);
      }

      return await response.json();
    } catch (error) {
      console.error('서비스 목록 조회 실패:', error);
      throw error;
    }
  }

  /**
   * AI에게 질문하기
   * @param {string} serviceId - 서비스 ID (openai, anthropic, google, cohere)
   * @param {string} question - 질문 내용
   */
  static async askQuestion(serviceId, question) {
    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({
          service: serviceId,
          question
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
      }

      return data;
    } catch (error) {
      console.error(`${serviceId} 질문 실패:`, error);
      throw error;
    }
  }
}

export default AIServiceAPI;
