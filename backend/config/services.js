// config/services.js
const AIModels = require('../models/AIModels');

const services = {
  openai: new AIModels(
    'openai',
    'OpenAI GPT-4o mini',
    'https://api.openai.com/v1/chat/completions',
    'gpt-4o-mini'
  ),
  anthropic: new AIModels(
    'anthropic',
    'Claude',
    'https://api.anthropic.com/v1/messages',
    'claude-3-5-sonnet-20241022'
  ),
  google: new AIModels(
    'google',
    'Gemini 3 Flash',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent',
    'gemini-3-flash-preview'
  ),
  groq: new AIModels(
    'groq',
    'Groq (Llama 3.3)',
    'https://api.groq.com/openai/v1/chat/completions',
    'llama-3.3-70b-versatile'
  ),
  cohere: new AIModels(
    'cohere',
    'Cohere (Command A)',
    'https://api.cohere.com/v2/chat',
    'command-a-03-2025'  // 최신 모델, 무료 Trial 가능
  )
};

module.exports = services;