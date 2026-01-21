// components/SearchInput.jsx
import React from 'react';
import { Send } from 'lucide-react';

const SearchInput = ({ value, onChange, onSubmit, disabled }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
        <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-teal-100/50 p-2 flex items-end gap-3">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="AI들에게 질문해보세요..."
            className="flex-1 px-6 py-4 bg-transparent border-none outline-none resize-none text-gray-800 placeholder-teal-400/60 text-lg min-h-[60px] max-h-[200px]"
            rows={1}
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
          <button
            onClick={onSubmit}
            disabled={disabled}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" />
            질문하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchInput;