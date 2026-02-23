import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const ServiceSelector = ({ services, activeServices, onSelect, apiKeyStatus }) => {
  return (
    <div className="absolute bottom-full mb-2 w-64 bg-[#0f1019] rounded-xl shadow-lg border border-white/[0.08] z-40 overflow-hidden">
      <div className="p-2">
        {services.map((service) => {
          const isActive = activeServices.find(s => s.id === service.id);
          const hasApiKey = apiKeyStatus?.[service.id];

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              disabled={isActive}
              className="w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/[0.06]"
            >
              <div>
                <p className="font-medium text-sm text-text">{service.name}</p>
                <p className="text-xs text-neutral-500">{service.model}</p>
              </div>

              {hasApiKey ? (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <Check className="w-3.5 h-3.5" />
                  등록됨
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-orange-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  미등록
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 bg-white/[0.02] border-t border-white/[0.08]">
        <p className="text-xs text-neutral-500 text-center">
          사용자 메뉴에서 API 키를 등록하세요.
        </p>
      </div>
    </div>
  );
};

export default ServiceSelector;
