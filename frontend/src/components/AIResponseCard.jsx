import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { Sparkles, AlertCircle, Copy, Check, Ban } from 'lucide-react';

const SERVICE_COLORS = {
  openai: { bg: 'rgba(16,163,127,0.15)', text: '#10a37f', hover: 'rgba(16,163,127,0.3)', shadow: 'rgba(16,163,127,0.1)' },
  anthropic: { bg: 'rgba(210,137,84,0.15)', text: '#d28954', hover: 'rgba(210,137,84,0.3)', shadow: 'rgba(210,137,84,0.1)' },
  google: { bg: 'rgba(66,133,244,0.15)', text: '#4285f4', hover: 'rgba(66,133,244,0.3)', shadow: 'rgba(66,133,244,0.1)' },
  groq: { bg: 'rgba(245,80,54,0.15)', text: '#f55036', hover: 'rgba(245,80,54,0.3)', shadow: 'rgba(245,80,54,0.1)' },
  cohere: { bg: 'rgba(57,89,77,0.15)', text: '#39594d', hover: 'rgba(57,89,77,0.3)', shadow: 'rgba(57,89,77,0.1)' },
  deepseek: { bg: 'rgba(77,107,254,0.15)', text: '#4d6bfe', hover: 'rgba(77,107,254,0.3)', shadow: 'rgba(77,107,254,0.1)' },
  mistral: { bg: 'rgba(255,112,0,0.15)', text: '#ff7000', hover: 'rgba(255,112,0,0.3)', shadow: 'rgba(255,112,0,0.1)' },
  openrouter: { bg: 'rgba(99,102,241,0.15)', text: '#6366f1', hover: 'rgba(99,102,241,0.3)', shadow: 'rgba(99,102,241,0.1)' },
};

const DEFAULT_COLOR = { bg: 'rgba(99,102,241,0.15)', text: '#6366f1', hover: 'rgba(99,102,241,0.3)', shadow: 'rgba(99,102,241,0.1)' };

const AIResponseCard = ({
  service,
  onRemove,
  response,
  loading,
  hasApiKey
}) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isQuotaExceeded = response?.quotaExceeded;
  const hasError = response?.error;

  const colors = SERVICE_COLORS[service.id] || DEFAULT_COLOR;

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
      className={`flex flex-col overflow-hidden transition-all duration-300 ease-out h-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isHovered ? colors.hover : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px',
        boxShadow: isHovered ? `0 20px 60px ${colors.shadow}` : 'none',
        transform: isHovered ? 'translateY(-4px)' : undefined,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header */}
      <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-2.5">
          <div
            className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[17px] font-bold flex-shrink-0"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {service.name.charAt(0)}
          </div>
          <div>
            <div className="text-sm font-semibold text-text">{service.name}</div>
            <div className="text-[11px] text-neutral-500 mt-px">{service.model}</div>
          </div>
        </div>
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            backgroundColor: hasError ? '#ef4444' : '#22c55e',
            boxShadow: hasError ? '0 0 8px #ef4444' : '0 0 8px #22c55e',
          }}
        />
      </div>

      {/* Card Body */}
      <div className="px-5 py-5 flex-1 overflow-y-auto" style={{ minHeight: '220px' }}>
        {loading ? (
          <div>
            <div className="shimmer h-3.5 rounded-md w-[80%] mb-2.5" />
            <div className="shimmer h-3.5 rounded-md w-[60%] mb-2.5" />
            <div className="shimmer h-3.5 rounded-md w-[80%] mb-2.5" />
            <div className="shimmer h-3.5 rounded-md w-[45%] mb-2.5" />
            <div className="shimmer h-3.5 rounded-md w-[80%] mb-2.5" />
            <div className="shimmer h-3.5 rounded-md w-[60%] mb-2.5" />
            <p className="text-xs text-neutral-500 mt-4">답변 생성 중...</p>
          </div>
        ) : response ? (
          <div className={`text-sm leading-[1.8] ${hasError ? 'text-red-400 whitespace-pre-wrap' : 'prose prose-dark prose-sm max-w-none'}`}>
            {hasError ? response.answer : (
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{response.answer}</ReactMarkdown>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-500 min-h-[180px]">
            {!hasApiKey ? (
              <span className="flex items-center gap-2 text-orange-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                API 키를 등록해주세요
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4" />
                질문하고 답변을 기다리세요
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 flex items-center justify-between mt-auto" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-4">
          {response && !hasError ? (
            <>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">⚡ {response.duration ? `${response.duration}s` : '—'}</span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">📝 {response.tokens?.total || '—'} 토큰</span>
            </>
          ) : (
            <>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">⚡ —</span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">📝 —</span>
            </>
          )}
          {isQuotaExceeded && (
            <span className="text-[11px] text-neutral-500 flex items-center gap-1">
              <Ban className="w-3 h-3" /> 사용량 소진
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          disabled={!response || hasError}
          className="text-xs px-3 py-1.5 rounded-[7px] border transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: 'none',
            borderColor: 'rgba(255,255,255,0.08)',
            color: '#64748b',
          }}
          onMouseEnter={(e) => {
            if (response && !hasError) {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.color = '#a78bfa';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#64748b';
          }}
        >
          {copied ? '복사됨 ✓' : '복사'}
        </button>
      </div>
    </div>
  );
};

export default AIResponseCard;
