// components/ApiKeyManager.jsx
import React, { useState } from 'react';
import { X, Key, Check, Trash2, Save, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SERVICE_INFO = {
  openai: {
    name: 'OpenAI',
    placeholder: 'sk-...',
    url: 'https://platform.openai.com/api-keys',
    guide: [
      'OpenAI 플랫폼에 로그인',
      '좌측 메뉴에서 "API keys" 클릭',
      '"Create new secret key" 버튼 클릭',
      '생성된 키를 복사하여 붙여넣기'
    ],
    note: '무료 크레딧 소진 후 결제 수단 등록 필요'
  },
  anthropic: {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    url: 'https://console.anthropic.com/settings/keys',
    guide: [
      'Anthropic Console에 로그인',
      'Settings → API Keys 이동',
      '"Create Key" 버튼 클릭',
      '생성된 키를 복사하여 붙여넣기'
    ],
    note: '초기 무료 크레딧 $5 제공'
  },
  google: {
    name: 'Google AI',
    placeholder: 'AIza...',
    url: 'https://aistudio.google.com/app/apikey',
    guide: [
      'Google AI Studio에 로그인',
      '"Get API key" 버튼 클릭',
      '"Create API key" 선택',
      '생성된 키를 복사하여 붙여넣기'
    ],
    note: '무료 사용량 제공 (분당 요청 수 제한)'
  },
  groq: {
    name: 'Groq',
    placeholder: 'gsk_...',
    url: 'https://console.groq.com/keys',
    guide: [
      'Groq Console에 로그인 (Google/GitHub 계정)',
      '좌측 메뉴에서 "API Keys" 클릭',
      '"Create API Key" 버튼 클릭',
      '생성된 키를 복사하여 붙여넣기'
    ],
    note: '무료 사용 가능 (분당 요청 수 제한)'
  },
  cohere: {
    name: 'Cohere',
    placeholder: '...',
    url: 'https://dashboard.cohere.com/api-keys',
    guide: [
      'Cohere Dashboard에 로그인 (Google/GitHub 계정)',
      '좌측 메뉴에서 "API Keys" 클릭',
      '"+ New Trial Key" 버튼 클릭',
      '생성된 키를 복사하여 붙여넣기'
    ],
    note: '무료 Trial 키 제공 (월 1000 요청)'
  }
};

function ApiKeyManager({ isOpen, onClose }) {
  const { user, saveApiKey, deleteApiKey } = useAuth();
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    groq: '',
    cohere: ''
  });
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [expandedGuide, setExpandedGuide] = useState(null);

  if (!isOpen) return null;

  const toggleGuide = (service) => {
    setExpandedGuide(expandedGuide === service ? null : service);
  };

  const handleSave = async (service) => {
    if (!apiKeys[service].trim()) return;

    setSaving(prev => ({ ...prev, [service]: true }));
    setMessage({ type: '', text: '' });

    try {
      await saveApiKey(service, apiKeys[service]);
      setApiKeys(prev => ({ ...prev, [service]: '' }));
      setExpandedGuide(null);  // 가이드 탭 닫기
      setMessage({ type: 'success', text: `${SERVICE_INFO[service].name} API 키가 저장되었습니다.` });
    } catch (error) {
      setMessage({ type: 'error', text: '저장에 실패했습니다.' });
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
      setMessage({ type: 'error', text: '삭제에 실패했습니다.' });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">API 키 관리</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - 스크롤 가능 */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {Object.entries(SERVICE_INFO).map(([service, info]) => (
            <div key={service} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">{info.name}</span>
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-600 transition-colors"
                    title="API 키 발급 페이지로 이동"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {user?.apiKeyStatus?.[service] && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    등록됨
                  </span>
                )}
              </div>

              {/* 가이드 토글 버튼 */}
              <button
                onClick={() => toggleGuide(service)}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-teal-600 mb-3 transition-colors"
              >
                {expandedGuide === service ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                API 키 발급 방법
              </button>

              {/* 가이드 내용 */}
              {expandedGuide === service && (
                <div className="mb-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <ol className="list-decimal list-inside space-y-1 text-gray-600">
                    {info.guide.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                  {info.note && (
                    <p className="mt-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                      💡 {info.note}
                    </p>
                  )}
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-teal-500 hover:text-teal-600 font-medium"
                  >
                    발급 페이지로 이동
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys[service]}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [service]: e.target.value }))}
                  placeholder={user?.apiKeyStatus?.[service] ? '새 API 키로 변경' : info.placeholder}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500"
                />
                <button
                  onClick={() => handleSave(service)}
                  disabled={!apiKeys[service].trim() || saving[service]}
                  className="px-3 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                {user?.apiKeyStatus?.[service] && (
                  <button
                    onClick={() => handleDelete(service)}
                    disabled={saving[service]}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-teal-50 rounded-lg">
            <p className="text-xs text-teal-700">
              🔒 API 키는 암호화되어 안전하게 저장됩니다.
            </p>
            <p className="text-xs text-teal-600 mt-1">
              각 서비스의 "API 키 발급 방법"을 클릭하면 상세한 안내를 볼 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApiKeyManager;
