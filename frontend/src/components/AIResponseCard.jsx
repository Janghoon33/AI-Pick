import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles, AlertCircle, Copy, Check, Ban } from 'lucide-react';

const SERVICE_COLORS = {
  openai: '#10a37f',
  anthropic: '#d28954',
  google: '#4285f4',
  groq: '#f55036',
  cohere: '#39594d',
  deepseek: '#4d6bfe',
  mistral: '#ff7000',
  openrouter: '#6366f1',
};

const AIResponseCard = ({
  service,
  onRemove,
  response,
  loading,
  hasApiKey
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isQuotaExceeded = response?.quotaExceeded;
  const hasError = response?.error;

  const accentColor = SERVICE_COLORS[service.id] || '#6366f1';

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    if (!response?.answer) return;
    try {
      await navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div
      className={`py-6 transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Service header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: accentColor }}
          >
            {service.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-text text-sm">{service.name}</span>
            <span className="text-xs text-neutral-500 ml-2">{service.model}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Copy button */}
          {!hasError && response && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-neutral-500 hover:text-text hover:bg-white/[0.06] rounded-md transition-colors"
              title="복사"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
          {/* Remove button */}
          <button
            onClick={onRemove}
            className="p-1.5 text-neutral-500 hover:text-text hover:bg-white/[0.06] rounded-md transition-colors"
            aria-label={`${service.name} 제거`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="pl-11">
        {loading ? (
          <div className="flex items-center gap-3 text-neutral-500">
            <div
              className="w-5 h-5 border-2 border-white/10 rounded-full animate-spin flex-shrink-0"
              style={{ borderTopColor: accentColor }}
            />
            <span className="text-sm">답변 생성 중...</span>
          </div>
        ) : response ? (
          <>
            <div className={`text-base leading-relaxed ${hasError ? 'text-red-400 whitespace-pre-wrap' : 'prose prose-dark max-w-none'}`}>
              {hasError ? response.answer : (
                <ReactMarkdown>{response.answer}</ReactMarkdown>
              )}
            </div>
            {isQuotaExceeded && (
              <div className="flex items-center gap-2 text-xs text-neutral-500 mt-3">
                <Ban className="w-3.5 h-3.5" />
                <span>API 사용량 소진</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-neutral-500 text-sm">
            {!hasApiKey ? (
              <span className="flex items-center gap-2 text-orange-400">
                <AlertCircle className="w-4 h-4" />
                API 키를 등록해주세요
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                질문하고 답변을 기다리세요
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponseCard;
