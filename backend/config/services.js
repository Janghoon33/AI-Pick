// config/services.js
const AIModels = require('../models/AIModels');

const services = {
  // ========== 유료 API ==========
  openai: new AIModels(
    'openai',
    'GPT-4o mini',
    'https://api.openai.com/v1/chat/completions',
    'gpt-4o-mini'
  ),
  anthropic: new AIModels(
    'anthropic',
    'Claude 3.5 Sonnet',
    'https://api.anthropic.com/v1/messages',
    'claude-3-5-sonnet-20241022'
  ),

  // ========== 무료 API ==========
  google: new AIModels(
    'google',
    'Gemini 2.5 Flash',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent',
    'gemini-2.5-flash-preview-05-20'
  ),
  groq: new AIModels(
    'groq',
    'Llama 4 Scout',
    'https://api.groq.com/openai/v1/chat/completions',
    'meta-llama/llama-4-scout-17b-16e-instruct'
  ),
  cohere: new AIModels(
    'cohere',
    'Command A',
    'https://api.cohere.com/v2/chat',
    'command-a-03-2025'
  ),
  deepseek: new AIModels(
    'deepseek',
    'DeepSeek V3',
    'https://api.deepseek.com/chat/completions',
    'deepseek-chat'
  ),
  mistral: new AIModels(
    'mistral',
    'Mistral Large',
    'https://api.mistral.ai/v1/chat/completions',
    'mistral-large-latest'
  ),
  openrouter: new AIModels(
    'openrouter',
    'OpenRouter Auto',
    'https://openrouter.ai/api/v1/chat/completions',
    'openrouter/auto'
  )
};

module.exports = services;