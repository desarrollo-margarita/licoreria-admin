import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-xl',
  className = ''
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl transition-opacity duration-300 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Card with Luxury Glassmorphism */}
      <div
        className={`relative bg-gradient-to-b from-[#180d38] to-[#0d061f] border border-white/10 border-t-white/20 rounded-[28px] w-full ${maxWidth} p-7 sm:p-9 shadow-2xl shadow-purple-950/60 z-10 max-h-[92vh] overflow-y-auto transform transition-all duration-300 animate-fadeIn ${className}`}
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-b from-cyan-500/15 via-purple-500/10 to-transparent blur-xl pointer-events-none rounded-t-[28px]" />

        {title && (
          <div className="flex items-start justify-between pb-5 mb-6 border-b border-white/[0.08] relative z-10">
            <div className="flex items-center gap-3.5">
              {Icon && (
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md">
                  <Icon className="w-6 h-6" />
                </div>
              )}
              <div>
                <h3 className="font-black text-white text-lg sm:text-xl tracking-tight">{title}</h3>
                {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-normal">{subtitle}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.06] transition-all cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
