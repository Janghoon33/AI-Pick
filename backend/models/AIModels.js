// models/AIModels.js
class AIModels {
  constructor(id, name, endpoint, model, apiKeyHeader = 'Authorization') {
    this.id = id;
    this.name = name;
    this.endpoint = endpoint;
    this.model = model;
    this.apiKeyHeader = apiKeyHeader;
  }

  // 각 서비스별 요청 본문 생성
  createRequestBody(message) {
    switch (this.id) {
      case 'openai':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      case 'anthropic':
        return {
          model: this.model,
          max_tokens: 1000,
          messages: [{ role: 'user', content: message }]
        };

      case 'google':
        return {
          contents: [{
            parts: [{ text: message }]
          }]
        };

      case 'groq':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      case 'cohere':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }]
        };

      case 'deepseek':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      case 'mistral':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      case 'openrouter':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      case 'together':
        return {
          model: this.model,
          messages: [{ role: 'user', content: message }],
          max_tokens: 1000
        };

      default:
        throw new Error(`지원하지 않는 서비스: ${this.id}`);
    }
  }

  // 각 서비스별 헤더 생성
  createHeaders(apiKey) {
    const headers = {
      'Content-Type': 'application/json'
    };

    switch (this.id) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;

      case 'groq':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'cohere':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      // Google은 URL에 API 키 포함
      case 'google':
        break;

      case 'deepseek':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'mistral':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'openrouter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = 'https://ai-pick.app';
        break;

      case 'together':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  // 각 서비스별 엔드포인트 생성
  getEndpoint(apiKey) {
    if (this.id === 'google') {
      return `${this.endpoint}?key=${apiKey}`;
    }
    return this.endpoint;
  }

  // 응답에서 답변 추출
  extractAnswer(response) {
    switch (this.id) {
      case 'openai':
        return response.choices?.[0]?.message?.content || '응답 없음';

      case 'anthropic':
        return response.content?.[0]?.text || '응답 없음';

      case 'google':
        return response.candidates?.[0]?.content?.parts?.[0]?.text || '응답 없음';

      case 'groq':
        return response.choices?.[0]?.message?.content || '응답 없음';

      case 'cohere':
        return response.message?.content?.[0]?.text || '응답 없음';

      case 'deepseek':
        return response.choices?.[0]?.message?.content || '응답 없음';

      case 'mistral':
        return response.choices?.[0]?.message?.content || '응답 없음';

      case 'openrouter':
        return response.choices?.[0]?.message?.content || '응답 없음';

      case 'together':
        return response.choices?.[0]?.message?.content || '응답 없음';

      default:
        return '응답 없음';
    }
  }

  // 토큰 정보 추출
  extractTokens(response) {
    switch (this.id) {
      case 'openai':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      case 'anthropic':
        return {
          input: response.usage?.input_tokens || 0,
          output: response.usage?.output_tokens || 0,
          total: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
        };

      case 'google':
        return {
          input: response.usageMetadata?.promptTokenCount || 0,
          output: response.usageMetadata?.candidatesTokenCount || 0,
          total: response.usageMetadata?.totalTokenCount || 0
        };

      case 'groq':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      case 'cohere':
        return {
          input: response.usage?.tokens?.input_tokens || 0,
          output: response.usage?.tokens?.output_tokens || 0,
          total: (response.usage?.tokens?.input_tokens || 0) + (response.usage?.tokens?.output_tokens || 0)
        };

      case 'deepseek':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      case 'mistral':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      case 'openrouter':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      case 'together':
        return {
          input: response.usage?.prompt_tokens || 0,
          output: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        };

      default:
        return { input: 0, output: 0, total: 0 };
    }
  }
}

module.exports = AIModels;