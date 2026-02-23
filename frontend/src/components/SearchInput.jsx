import React from 'react';
import { Send, Plus } from 'lucide-react';

const SearchInput = ({
  value,
  onChange,
  onSubmit,
  disabled,
  activeCount,
  maxCount,
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
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl focus-within:border-indigo-500/40 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] transition-all">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="AI들에게 질문해보세요..."
        className="w-full px-4 pt-4 pb-2 bg-transparent resize-none text-base text-text placeholder-neutral-400 focus:outline-none"
        rows={1}
        style={{ minHeight: '44px', maxHeight: '200px' }}
      />

      {/* Bottom toolbar row */}
      <div className="flex items-center justify-between px-3 pb-3">
        <div className="flex items-center gap-2">
          {/* Service add button */}
          <div className="relative">
            <button
              onClick={onToggleSelector}
              disabled={selectorDisabled}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-text hover:bg-white/[0.06] rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">AI 서비스</span>
              <span className="text-xs text-neutral-400">{activeCount}/{maxCount}</span>
            </button>
            {selectorContent}
          </div>
        </div>

        {/* Send button */}
        <button
          onClick={onSubmit}
          disabled={disabled}
          className="w-9 h-9 bg-gradient-to-r from-accent1 to-accent2 text-white rounded-lg flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          aria-label="질문하기"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
