// components/AIResponseCard.jsx
import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Copy, Check, Ban } from 'lucide-react';

const AIResponseCard = ({
  service,
  onRemove,
  response,
  loading,
  index,
  hasApiKey
}) => {
  const [copied, setCopied] = useState(false);
  const isQuotaExceeded = response?.quotaExceeded;

  const handleCopy = async () => {
    if (!response?.answer) return;

    try {
      await navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  return (
    <div
      className={`backdrop-blur-xl rounded-2xl shadow-xl border overflow-hidden animate-slide-up ${
        isQuotaExceeded
          ? 'bg-gray-100 border-gray-300'
          : 'bg-white/70 border-teal-100/50'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* 카드 헤더 */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        isQuotaExceeded
          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
          : 'bg-gradient-to-r from-teal-500 to-emerald-500'
      }`}>
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            {isQuotaExceeded ? <Ban className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            {service.name}
          </h3>
          <p className={`text-sm mt-1 ${isQuotaExceeded ? 'text-gray-200' : 'text-teal-100'}`}>
            {service.model}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 사용량 초과 배너 */}
      {isQuotaExceeded && (
        <div className="px-6 py-3 bg-gray-200 border-b border-gray-300 flex items-center gap-2">
          <Ban className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700 font-medium">
            API 사용량을 모두 소진했습니다. 크레딧을 충전해주세요.
          </span>
        </div>
      )}

      {/* API 키 상태 */}
      {!hasApiKey && (
        <div className="px-6 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-orange-700">
            API 키가 등록되지 않았습니다. 사용자 메뉴에서 등록해주세요.
          </span>
        </div>
      )}

      {/* 응답 영역 */}
      <div className="px-6 py-6 min-h-[200px] max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-500 rounded-full animate-spin mb-4"></div>
            <p className="text-teal-600 text-sm">답변 생성 중...</p>
          </div>
        ) : response ? (
          <div>
            {/* 복사 버튼 */}
            {!response.error && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                  title="답변 복사"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      복사됨
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      복사
                    </>
                  )}
                </button>
              </div>
            )}

            <div className={`text-sm leading-relaxed ${response.error ? 'text-red-600' : 'text-gray-700'} whitespace-pre-wrap`}>
              {response.answer}
            </div>
          </div>
        ) : (
          <div className="text-center text-teal-400/60 py-12">
            {hasApiKey
              ? "질문을 입력하고 '질문하기'를 눌러주세요"
              : "먼저 API 키를 등록해주세요"
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponseCard;
