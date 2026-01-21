// components/ServiceSelector.jsx
import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const ServiceSelector = ({ services, activeServices, onSelect, apiKeyStatus }) => {
  return (
    <div className="mt-4 bg-white/80 backdrop-blur-xl rounded-xl shadow-xl border border-teal-100/50 p-4 animate-slide-down">
      <div className="grid grid-cols-2 gap-3">
        {services.map((service) => {
          const isActive = activeServices.find(s => s.id === service.id);
          const hasApiKey = apiKeyStatus?.[service.id];

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              disabled={isActive}
              className={`px-4 py-3 rounded-lg text-left transition-all duration-200 border ${
                isActive
                  ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200/50 hover:from-teal-100 hover:to-emerald-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-teal-700">{service.name}</div>
                {hasApiKey ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    등록됨
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                    <AlertCircle className="w-3 h-3" />
                    미등록
                  </span>
                )}
              </div>
              <div className="text-xs text-teal-600/70 mt-1">{service.model}</div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-3 text-center">
        API 키가 등록되지 않은 서비스는 사용자 메뉴에서 등록해주세요
      </p>
    </div>
  );
};

export default ServiceSelector;
