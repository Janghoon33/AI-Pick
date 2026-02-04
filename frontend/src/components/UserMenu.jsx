import React, { useState, useRef, useEffect } from 'react';
import { User, Key, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function UserMenu({ onOpenApiKeyManager }) {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full text-left transition-colors hover:bg-neutral-100"
      >
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-neutral-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-neutral-500" />
          </div>
        )}
        <span className="text-sm font-medium text-text">
          {user?.name}
        </span>
        <ChevronDown className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-neutral-200">
            <p className="text-sm font-semibold text-text truncate">{user?.name}</p>
            <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
          </div>

          <div className="py-1">
            <button
              onClick={() => { onOpenApiKeyManager(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text hover:bg-neutral-100 transition-colors"
            >
              <Key className="w-4 h-4 text-neutral-500" />
              API 키 관리
            </button>
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
