import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Copy, Check, Ban } from 'lucide-react';

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

  // 마운트 시 애니메이션 트리거
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

  const borderColor = isQuotaExceeded ? 'border-neutral-300' : hasError ? 'border-red-400' : 'border-primary';

  return (
    <div className={`bg-white rounded-xl shadow-md border border-neutral-200/80 flex flex-col overflow-hidden border-t-4 ${borderColor} transition-all duration-300 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
      {/* Card Header */}
      <div className="p-4 flex items-start justify-between">
        <div>
          <h3 className="font-bold text-text text-lg">{service.name}</h3>
          <p className="text-sm text-neutral-500">{service.model}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors"
          aria-label={`${service.name} card close`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Area */}
      <div className="px-4 pt-0 pb-4 min-h-[250px] max-h-[500px] overflow-y-auto flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-sm">답변 생성 중...</p>
          </div>
        ) : response ? (
          <div className={`text-base leading-relaxed text-text whitespace-pre-wrap ${hasError ? 'text-red-600' : ''}`}>
            {response.answer}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400">
            {!hasApiKey ? (
              <>
                <AlertCircle className="w-8 h-8 mb-2 text-orange-400" />
                <p className="font-medium text-sm text-orange-500">API 키를 등록해주세요</p>
              </>
            ) : (
              <>
                <Sparkles className="w-8 h-8 mb-2" />
                <p className="font-medium text-sm">질문하고 답변을 기다리세요</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card Footer */}
      {(response || isQuotaExceeded) && (
        <div className="p-4 bg-neutral-100/70 border-t border-neutral-200/80 flex items-center justify-end gap-4">
          {isQuotaExceeded && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 mr-auto">
              <Ban className="w-4 h-4" />
              <span>API 사용량 소진</span>
            </div>
          )}
          {!hasError && response && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 text-xs text-neutral-600 font-medium hover:text-text hover:bg-neutral-200 rounded-md transition-colors"
              title="Copy response"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  복사
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AIResponseCard;
