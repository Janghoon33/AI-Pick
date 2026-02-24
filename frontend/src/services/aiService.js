// services/aiService.js
const API_URL = import.meta.env.VITE_API_URL || '';
const API_BASE_URL = `${API_URL}/api`;

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

  /**
   * 여러 서비스에 동시 질문 후 히스토리 저장
   * @param {string[]} serviceIds - 서비스 ID 배열
   * @param {string} question - 질문 내용
   * @returns {Array} - [{serviceId, serviceName, answer, tokens, duration, error}]
   */
  static async askBatch(serviceIds, question, sessionId = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/ask/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        body: JSON.stringify({ services: serviceIds, question, sessionId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
      }

      return data;
    } catch (error) {
      console.error('배치 질문 실패:', error);
      throw error;
    }
  }

  /**
   * 히스토리 목록 조회
   * @param {number} page - 페이지 번호 (1부터 시작)
   */
  static async getHistory(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/history?page=${page}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '히스토리를 불러올 수 없습니다.');
      }

      return data;
    } catch (error) {
      console.error('히스토리 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 세션 전체 대화 조회
   * @param {string} sessionId - 세션 UUID
   */
  static async getSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/history/session/${sessionId}`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '세션을 불러올 수 없습니다.');
      }

      return data;
    } catch (error) {
      console.error('세션 조회 실패:', error);
      throw error;
    }
  }

  /**
   * 히스토리 항목 삭제
   * @param {number} id - 히스토리 항목 ID
   */
  static async deleteHistory(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '삭제 중 오류가 발생했습니다.');
      }

      return data;
    } catch (error) {
      console.error('히스토리 삭제 실패:', error);
      throw error;
    }
  }
}

export default AIServiceAPI;
