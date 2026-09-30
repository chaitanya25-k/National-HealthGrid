import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import { AlertCircle, X, ChevronRight } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { recentToast, clearToast, setIsOpen } = useNotifications();

  if (!recentToast) return null;

  const isCritical = recentToast.severity === 'CRITICAL';

  return (
    <div
      role="status"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-full transition-all duration-300 transform translate-y-0"
    >
      <div
        className={`p-4 rounded-xl shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
          isCritical
            ? 'bg-red-950/90 text-white border-red-700 shadow-red-950/50'
            : 'bg-neutral-900/95 text-white border-neutral-700 shadow-neutral-950/50'
        }`}
      >
        <div
          className={`p-2 rounded-lg shrink-0 ${
            isCritical ? 'bg-red-800 text-red-100' : 'bg-emerald-800 text-emerald-100'
          }`}
        >
          <AlertCircle className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                isCritical ? 'text-red-300' : 'text-emerald-400'
              }`}
            >
              {recentToast.severity} Alert · {recentToast.resource}
            </span>
            <button
              onClick={clearToast}
              aria-label="Dismiss alert toast"
              className="text-gray-400 hover:text-white p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-xs font-bold text-white truncate leading-tight">
            {recentToast.title}
          </h3>
          <p className="text-[11px] text-gray-300 line-clamp-2 mt-1 leading-snug">
            {recentToast.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between pt-1">
            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">
              {recentToast.facility_name}
            </span>
            <button
              onClick={() => {
                clearToast();
                setIsOpen(true);
              }}
              className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
            >
              <span>Review Alert</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
