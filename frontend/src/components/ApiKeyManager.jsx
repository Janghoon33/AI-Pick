import React, { useState } from 'react';
import { X, Key, Check, Trash2, Save, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// API 서비스별 정보 (한글)
const SERVICE_INFO = {
  // === 유료 API ===
  openai: { name: 'OpenAI', placeholder: 'sk-...', url: 'https://platform.openai.com/api-keys', guide: ['OpenAI 플랫폼에 로그인', '왼쪽 메뉴에서 "API keys" 클릭', '"Create new secret key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '무료 크레딧 소진 후 결제 수단 필요' },
  anthropic: { name: 'Anthropic', placeholder: 'sk-ant-...', url: 'https://console.anthropic.com/settings/keys', guide: ['Anthropic 콘솔에 로그인', 'Settings → API Keys로 이동', '"Create Key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '가입 시 $5 무료 크레딧 제공' },

  // === 무료 티어 API ===
  google: { name: 'Google AI (Gemini)', placeholder: 'AIza...', url: 'https://aistudio.google.com/app/apikey', guide: ['Google AI Studio에 로그인', '"Get API key" 클릭', '"Create API key" 선택', '생성된 키를 복사하여 붙여넣기'], note: '🆓 하루 100만 토큰 무료' },
  groq: { name: 'Groq', placeholder: 'gsk_...', url: 'https://console.groq.com/keys', guide: ['Groq 콘솔에 로그인', '왼쪽 메뉴에서 "API Keys" 클릭', '"Create API Key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '🆓 하루 14,400 요청 무료, 가장 빠른 응답' },
  cohere: { name: 'Cohere', placeholder: '...', url: 'https://dashboard.cohere.com/api-keys', guide: ['Cohere 대시보드에 로그인', '왼쪽 메뉴에서 "API Keys" 클릭', '"+ New Trial Key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '🆓 무료 Trial 키 제공' },
  deepseek: { name: 'DeepSeek', placeholder: 'sk-...', url: 'https://platform.deepseek.com/api_keys', guide: ['DeepSeek 플랫폼에 가입/로그인', 'API Keys 섹션으로 이동', '"Create new API key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '🆓 가입 시 무료 크레딧, GPT-4급 성능' },
  mistral: { name: 'Mistral AI', placeholder: '...', url: 'https://console.mistral.ai/api-keys/', guide: ['Mistral 콘솔에 가입/로그인', 'API Keys 섹션으로 이동', '"Create new key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '🆓 월 10억 토큰 무료 (Experiment 플랜)' },
  openrouter: { name: 'OpenRouter', placeholder: 'sk-or-...', url: 'https://openrouter.ai/keys', guide: ['OpenRouter에 가입/로그인', 'Keys 섹션으로 이동', '"Create Key" 클릭', '생성된 키를 복사하여 붙여넣기'], note: '🆓 18개 이상 무료 모델, 카드 등록 불필요' }
};

function ApiKeyManager({ isOpen, onClose }) {
  const { user, saveApiKey, deleteApiKey } = useAuth();
  const [apiKeys, setApiKeys] = useState(Object.keys(SERVICE_INFO).reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedGuide, setExpandedGuide] = useState(null);

  if (!isOpen) return null;

  const toggleGuide = (service) => setExpandedGuide(expandedGuide === service ? null : service);

  const handleSave = async (service) => {
    if (!apiKeys[service].trim()) return;

    setSaving(prev => ({ ...prev, [service]: true }));
    setMessage({ type: '', text: '' });

    try {
      await saveApiKey(service, apiKeys[service]);
      setApiKeys(prev => ({ ...prev, [service]: '' }));
      setExpandedGuide(null);
      setMessage({ type: 'success', text: `${SERVICE_INFO[service].name} API 키가 저장되었습니다.` });
    } catch (error) {
      setMessage({ type: 'error', text: '키 저장에 실패했습니다.' });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`${SERVICE_INFO[service].name} API 키를 삭제하시겠습니까?`)) return;

    setSaving(prev => ({ ...prev, [service]: true }));
    setMessage({ type: '', text: '' });

    try {
      await deleteApiKey(service);
      setMessage({ type: 'success', text: `${SERVICE_INFO[service].name} API 키가 삭제되었습니다.` });
    } catch (error) {
      setMessage({ type: 'error', text: '키 삭제에 실패했습니다.' });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f1019] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-white/[0.08]">
        <header className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-accent1" />
            <h2 className="text-xl font-bold text-text">API 키 관리</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-white/[0.06] text-neutral-400 hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto flex-1">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          {Object.entries(SERVICE_INFO).map(([service, info]) => (
            <div key={service} className="border border-white/[0.08] rounded-xl p-4 transition-all hover:border-white/[0.15]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">{info.name}</span>
                  <a href={info.url} target="_blank" rel="noopener noreferrer" className="text-accent1 hover:text-accent2 transition-colors" title="Go to API key page">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {user?.apiKeyStatus?.[service] && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                    <Check className="w-4 h-4" />
                    등록됨
                  </span>
                )}
              </div>

              <button onClick={() => toggleGuide(service)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-accent1 mb-3 transition-colors">
                {expandedGuide === service ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                API 키 발급 방법
              </button>

              {expandedGuide === service && (
                <div className="mb-4 p-3 bg-white/[0.03] rounded-lg text-sm space-y-2 border border-white/[0.06]">
                  <ol className="list-decimal list-inside space-y-1 text-neutral-500">
                    {info.guide.map((step, index) => <li key={index}>{step}</li>)}
                  </ol>
                  {info.note && <p className="mt-2 text-xs text-amber-400">💡 {info.note}</p>}
                  <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-accent1 hover:text-accent2 font-medium">
                    발급 페이지로 이동 <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys[service]}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [service]: e.target.value }))}
                  placeholder={user?.apiKeyStatus?.[service] ? '새 키를 입력하면 교체됩니다' : info.placeholder}
                  className="flex-1 px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm text-text placeholder-neutral-400 focus:outline-none focus:border-indigo-500/40 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                />
                <button
                  onClick={() => handleSave(service)}
                  disabled={!apiKeys[service].trim() || saving[service]}
                  className="p-2.5 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                  aria-label="API 키 저장"
                >
                  <Save className="w-4 h-4" />
                </button>
                {user?.apiKeyStatus?.[service] && (
                  <button
                    onClick={() => handleDelete(service)}
                    disabled={saving[service]}
                    className="p-2.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="API 키 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
            <p className="text-xs text-neutral-500">
              🔒 API 키는 암호화되어 서버에 안전하게 저장됩니다. 키는 AI 서비스 호출 시에만 사용됩니다.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApiKeyManager;
