import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const ServiceSelector = ({ services, activeServices, onSelect, apiKeyStatus }) => {
  return (
    <div className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-neutral-200 z-40 overflow-hidden">
      <div className="p-2">
        {services.map((service) => {
          const isActive = activeServices.find(s => s.id === service.id);
          const hasApiKey = apiKeyStatus?.[service.id];

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              disabled={isActive}
              className="w-full px-3 py-2 rounded-lg text-left transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100"
            >
              <div>
                <p className="font-medium text-sm text-text">{service.name}</p>
                <p className="text-xs text-neutral-500">{service.model}</p>
              </div>
              
              {hasApiKey ? (
                <span className="flex items-center gap-1.5 text-xs text-green-600">
                  <Check className="w-3.5 h-3.5" />
                  Registered
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs text-orange-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Not Registered
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 bg-neutral-100 border-t border-neutral-200">
        <p className="text-xs text-neutral-500 text-center">
          Register API keys in the user menu.
        </p>
      </div>
    </div>
  );
};

export default ServiceSelector;
