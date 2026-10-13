import React, { useState } from 'react';
import { 
  X, RefreshCw, DollarSign, Radio, CheckCircle2, 
  AlertTriangle, Zap, ShieldCheck 
} from 'lucide-react';
import { fetchCurrentBcvRate, syncBcvRateToAllNodes } from '../../lib/bcvRateService';

export default function BcvRateModal({ isOpen, onClose, currentRateInfo, onRateUpdated }) {
  const [rateInput, setRateInput] = useState(
    currentRateInfo?.rate ? currentRateInfo.rate.toString() : '65.50'
  );
  const [sourceDetected, setSourceDetected] = useState(currentRateInfo?.source || 'Por defecto');
  const [isConsulting, setIsConsulting] = useState(false);
  const [isPropagating, setIsPropagating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleConsultLive = async () => {
    setIsConsulting(true);
    setFeedback(null);
    try {
      const res = await fetchCurrentBcvRate();
      if (res.success && res.rate > 0) {
        setRateInput(res.rate.toString());
        setSourceDetected(res.source);
        setFeedback({
          type: 'success',
          msg: `¡Tasa oficial consultada con éxito desde ${res.source}!`
        });
      } else {
        setFeedback({
          type: 'error',
          msg: res.error || 'No se pudo obtener la tasa desde los proveedores oficiales.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: `Error en la consulta: ${err.message}`
      });
    } finally {
      setIsConsulting(false);
    }
  };

  const handlePropagate = async (e) => {
    e.preventDefault();
    const num = parseFloat(rateInput);
    if (!num || num <= 0) {
      setFeedback({ type: 'error', msg: 'Ingresa un valor numérico válido mayor a 0.' });
      return;
    }

    setIsPropagating(true);
    setFeedback(null);

    try {
      const res = await syncBcvRateToAllNodes(num, sourceDetected || 'Manual / SuperAdmin');
      setFeedback({
        type: 'success',
        msg: `¡Tasa de Bs. ${num.toFixed(4)} propagada en tiempo real a ${res.updatedCount} clúster(es)! Las terminales Windows POS conectadas la recibirán al instante.`
      });
      if (onRateUpdated) {
        onRateUpdated(res);
      }
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: `Error al propagar la tasa: ${err.message}`
      });
    } finally {
      setIsPropagating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1a0f36]/95 to-[#0d061e]/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden space-y-6">
        
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                Control Central de Tasa BCV
              </h3>
              <p className="text-[11px] text-cyan-300/80">
                Sincronización multi-proveedor y propagación Realtime
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn ${
              feedback.type === 'success'
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/15 border border-red-500/30 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            )}
            <span className="leading-relaxed">{feedback.msg}</span>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 sm:p-5 space-y-3 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Tasa Oficial Activa en Plataforma
            </span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
              USD / VES
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono tracking-tight">
              Bs. {parseFloat(rateInput || 0).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">por 1.00 $</span>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span>Fuente: <strong className="text-slate-200">{sourceDetected}</strong></span>
            <span>Redundancia: <strong className="text-cyan-400">4 Proveedores</strong></span>
          </div>
        </div>

        {/* Action Form */}
        <form onSubmit={handlePropagate} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Valor de la Tasa (Editar o Auto-consultar):
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-500 font-bold text-sm">Bs.</span>
              <input
                type="number"
                step="0.0001"
                required
                value={rateInput}
                onChange={(e) => {
                  setRateInput(e.target.value);
                  setSourceDetected('Manual / Personalizada');
                }}
                className="w-full bg-slate-950 border border-white/15 focus:border-cyan-400 rounded-2xl pl-11 pr-4 py-3 text-base font-bold font-mono text-emerald-400 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleConsultLive}
              disabled={isConsulting}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-cyan-400 ${isConsulting ? 'animate-spin' : ''}`} />
              <span>{isConsulting ? 'Consultando...' : 'Consultar APIs Oficiales'}</span>
            </button>

            <button
              type="submit"
              disabled={isPropagating}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{isPropagating ? 'Transmitiendo...' : 'Propagar a Terminales'}</span>
            </button>
          </div>
        </form>

        {/* Architecture Note */}
        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] text-slate-400 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Propagación en Tiempo Real (Supabase Realtime)
          </div>
          <p>
            Al presionar "Propagar a Terminales", la tasa se actualiza en todos los clústeres y se transmite por WebSockets a las computadoras de caja con VentroX Windows POS al instante.
          </p>
        </div>

      </div>
    </div>
  );
}
