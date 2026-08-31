import React, { useState } from 'react';
import { X, Monitor, RefreshCw, ShieldAlert, CheckCircle2, AlertTriangle, Laptop, Cpu, HardDrive } from 'lucide-react';
import { resetBusinessDevices } from '../../lib/storageService';

export default function DeviceManagerModal({ isOpen, business, onClose, onDevicesReset }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen || !business) return null;

  const maxBoxes = parseInt(business.maxBoxes) || 1;
  const connectedCount = business.connectedDevices || 0;

  const handleReset = async () => {
    if (!window.confirm(`¿Estás seguro de liberar todas las cajas de "${business.businessName}"? Esto permitirá que el cliente active sus nuevas PCs/cajas sin conflicto.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resetBusinessDevices(business.licenseKey);
      setSuccessMsg('¡Todas las cajas y terminales han sido liberadas exitosamente!');
      if (onDevicesReset) {
        onDevicesReset(`Cajas liberadas para "${business.businessName}".`);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al resetear dispositivos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1a0f36] to-[#0d061e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Control de Cajas y Terminales
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {business.businessName} · <span className="font-mono text-cyan-300">{business.licenseKey}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cajas Autorizadas</span>
            <p className="text-3xl font-black text-white font-mono">{maxBoxes}</p>
            <p className="text-[10px] text-cyan-400 font-semibold">Según Plan {business.planType}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Terminales Registrados</span>
            <p className="text-3xl font-black text-cyan-400 font-mono">{connectedCount}</p>
            <p className="text-[10px] text-slate-400 font-semibold">
              {connectedCount >= maxBoxes ? 'Límite alcanzado' : 'Slots disponibles'}
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed space-y-2">
          <div className="font-bold flex items-center gap-2 text-cyan-300">
            <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>¿Cuándo usar la liberación de cajas?</span>
          </div>
          <p>
            Si el cliente <strong>cambió de computadora</strong>, formateó el equipo o reinstaló Windows, su identificador único de hardware cambia.
          </p>
          <p className="text-slate-300">
            Al hacer clic en el botón de abajo, se borrarán los vínculos anteriores en Supabase y el cliente podrá activar nuevamente sus computadoras sin necesidad de una clave nueva.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer flex-1"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-6 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex-[2] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>LIBERAR / RESETEAR CAJAS</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
