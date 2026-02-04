import React, { useState } from 'react';
import { X, Key, Check, Trash2, Save, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// This could be fetched from a config file or an API endpoint in a real-world app
const SERVICE_INFO = {
  openai: { name: 'OpenAI', placeholder: 'sk-...', url: 'https://platform.openai.com/api-keys', guide: ['Login to OpenAI Platform', 'Find "API keys" in the left menu', 'Click "Create new secret key"', 'Copy and paste the generated key'], note: 'Payment method required after free credits are used' },
  anthropic: { name: 'Anthropic', placeholder: 'sk-ant-...', url: 'https://console.anthropic.com/settings/keys', guide: ['Login to Anthropic Console', 'Go to Settings → API Keys', 'Click "Create Key"', 'Copy and paste the generated key'], note: 'Initial $5 free credit provided' },
  google: { name: 'Google AI', placeholder: 'AIza...', url: 'https://aistudio.google.com/app/apikey', guide: ['Login to Google AI Studio', 'Click "Get API key"', 'Select "Create API key"', 'Copy and paste the generated key'], note: 'Free usage tier available (with rate limits)' },
  groq: { name: 'Groq', placeholder: 'gsk_...', url: 'https://console.groq.com/keys', guide: ['Login to Groq Console', 'Find "API Keys" in the left menu', 'Click "Create API Key"', 'Copy and paste the generated key'], note: 'Free to use (with rate limits)' },
  cohere: { name: 'Cohere', placeholder: '...', url: 'https://dashboard.cohere.com/api-keys', guide: ['Login to Cohere Dashboard', 'Find "API Keys" in the left menu', 'Click "+ New Trial Key"', 'Copy and paste the generated key'], note: 'Free trial key provides 1000 requests/month' }
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
      setMessage({ type: 'success', text: `${SERVICE_INFO[service].name} API key has been saved.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save key.' });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
    }
  };

  const handleDelete = async (service) => {
    if (!confirm(`Are you sure you want to delete the API key for ${SERVICE_INFO[service].name}?`)) return;

    setSaving(prev => ({ ...prev, [service]: true }));
    setMessage({ type: '', text: '' });

    try {
      await deleteApiKey(service);
      setMessage({ type: 'success', text: `${SERVICE_INFO[service].name} API key has been deleted.` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete key.' });
    } finally {
      setSaving(prev => ({ ...prev, [service]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <header className="px-6 py-4 flex items-center justify-between flex-shrink-0 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-text">API Key Management</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <main className="p-6 space-y-4 overflow-y-auto flex-1">
          {message.text && (
            <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          {Object.entries(SERVICE_INFO).map(([service, info]) => (
            <div key={service} className="border border-neutral-200 rounded-xl p-4 transition-all hover:border-neutral-300">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text">{info.name}</span>
                  <a href={info.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors" title="Go to API key page">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                {user?.apiKeyStatus?.[service] && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <Check className="w-4 h-4" />
                    Registered
                  </span>
                )}
              </div>

              <button onClick={() => toggleGuide(service)} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-primary mb-3 transition-colors">
                {expandedGuide === service ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                How to get API key
              </button>

              {expandedGuide === service && (
                <div className="mb-4 p-3 bg-neutral-100 rounded-lg text-sm space-y-2">
                  <ol className="list-decimal list-inside space-y-1 text-neutral-600">
                    {info.guide.map((step, index) => <li key={index}>{step}</li>)}
                  </ol>
                  {info.note && <p className="mt-2 text-xs text-amber-700">💡 {info.note}</p>}
                  <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-primary hover:text-primary-dark font-medium">
                    Go to page <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKeys[service]}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [service]: e.target.value }))}
                  placeholder={user?.apiKeyStatus?.[service] ? 'Enter new key to replace' : info.placeholder}
                  className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
                <button
                  onClick={() => handleSave(service)}
                  disabled={!apiKeys[service].trim() || saving[service]}
                  className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Save API Key"
                >
                  <Save className="w-4 h-4" />
                </button>
                {user?.apiKeyStatus?.[service] && (
                  <button
                    onClick={() => handleDelete(service)}
                    disabled={saving[service]}
                    className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Delete API Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="mt-4 p-3 bg-neutral-100 rounded-lg">
            <p className="text-xs text-neutral-600">
              🔒 API keys are encrypted and stored securely in your browser's local storage. They are not sent to our server.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApiKeyManager;
