import React from 'react';
import { Send } from 'lucide-react';

const SearchInput = ({ value, onChange, onSubmit, disabled }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="AI들에게 질문해보세요..."
        className="w-full pl-4 pr-16 py-4 bg-white border border-neutral-200 rounded-xl shadow-sm resize-none text-base text-text placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
        rows={1}
        style={{ minHeight: '56px', maxHeight: '200px' }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark disabled:bg-neutral-200 disabled:cursor-not-allowed transition-colors"
        aria-label="질문하기"
      >
        <Send className="w-5 h-5" />
      </button>
    </div>
  );
};

export default SearchInput;