import React from 'react';
import { ArrowUp, Plus, X } from 'lucide-react';

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

const SearchInput = ({
  value,
  onChange,
  onSubmit,
  disabled,
  activeServices,
  maxCount,
  onRemoveService,
  onToggleSelector,
  selectorDisabled,
  selectorContent,
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Model chips row — matches HTML mockup */}
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {activeServices.map((service) => (
          <div
            key={service.id}
            className="flex items-center gap-[7px] py-[7px] pl-[14px] pr-[8px] rounded-full text-[13px] font-medium"
            style={{
              background: 'rgba(99,102,241,0.12)',
              border: '1px solid rgba(99,102,241,0.4)',
              color: '#f1f5f9',
            }}
          >
            <span
              className="w-[7px] h-[7px] rounded-full flex-shrink-0"
              style={{ backgroundColor: SERVICE_COLORS[service.id] || '#6366f1' }}
            />
            {service.name}
            <button
              onClick={() => onRemoveService(service.id)}
              className="ml-0.5 p-0.5 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* + 모델 추가 chip */}
        {activeServices.length < maxCount && (
          <div className="relative">
            <button
              onClick={onToggleSelector}
              disabled={selectorDisabled}
              className="flex items-center gap-[7px] py-[7px] px-[14px] rounded-full text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#64748b',
              }}
            >
              <span className="w-[7px] h-[7px] rounded-full bg-neutral-500 flex-shrink-0" />
              + 모델 추가
            </button>
            {selectorContent}
          </div>
        )}
      </div>

      {/* Input box — matches HTML mockup */}
      <div
        className="flex items-end gap-3 p-4 rounded-2xl transition-all focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="무엇이든 질문해보세요... AI들이 동시에 답변합니다"
          className="flex-1 bg-transparent border-none outline-none text-text text-[15px] leading-relaxed resize-none placeholder-neutral-500"
          rows={1}
          style={{ minHeight: '48px', maxHeight: '200px' }}
        />
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-white text-lg transition-all hover:scale-105 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
          aria-label="질문하기"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
