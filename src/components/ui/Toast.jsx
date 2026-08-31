import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({
  message,
  type = 'success', // 'success', 'error', 'info'
  onClose,
  duration = 3500
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    success: {
      bg: 'bg-emerald-500 text-slate-950',
      icon: CheckCircle2,
    },
    error: {
      bg: 'bg-red-500 text-white',
      icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-600 text-white',
      icon: Info,
    },
  };

  const current = typeConfig[type] || typeConfig.success;
  const IconComponent = current.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs shadow-2xl ${current.bg} border border-white/20`}>
        <IconComponent className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 p-0.5 rounded hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
