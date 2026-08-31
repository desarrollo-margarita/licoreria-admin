import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, CreditCard, Hash, FileText, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { recordPayment } from '../../lib/storageService';

export default function RecordPaymentModal({ isOpen, business, onClose, onPaymentRecorded }) {
  const [amountUsd, setAmountUsd] = useState('');
  const [amountVes, setAmountVes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ZELLE');
  const [referenceCode, setReferenceCode] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [extendDays, setExtendDays] = useState(30);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (business) {
      // Sugerir el monto según el plan o tarifa configurada
      const suggested = business.monthlyFeeUsd || 80;
      setAmountUsd(suggested.toString());
      setAmountVes('');
      setReferenceCode('');
      setNotes('');
      setError(null);
      
      if (business.planType === 'MENSUAL') {
        setExtendDays(30);
      } else if (business.planType === 'ANUAL') {
        setExtendDays(365);
      } else if (business.planType === 'TRIENAL') {
        setExtendDays(1095);
      } else {
        setExtendDays(30);
      }
    }
  }, [business, isOpen]);

  if (!isOpen || !business) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await recordPayment({
        businessId: business.businessId || business.id,
        licenseKey: business.licenseKey,
        amountUsd: parseFloat(amountUsd) || 0,
        amountVes: parseFloat(amountVes) || 0,
        paymentMethod,
        referenceCode,
        paymentDate,
        extendDays: parseInt(extendDays, 10) || 0,
        notes
      });

      if (onPaymentRecorded) {
        onPaymentRecorded(`¡Pago de $${amountUsd} registrado exitosamente para "${business.businessName}"!`);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-[#1a0f36] to-[#0d061e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ambient light */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-emerald-500/15 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Registrar Cobro / Pago
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

        <form onSubmit={handleSubmit} className="space-y-4 text-left relative z-10">
          
          {/* Montos ($ y Bs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Monto en USD ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountUsd}
                onChange={e => setAmountUsd(e.target.value)}
                placeholder="ej. 80.00"
                required
                className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <span>🇻🇪</span> Monto en Bs (Opcional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountVes}
                onChange={e => setAmountVes(e.target.value)}
                placeholder="ej. 3200.00"
                className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-mono"
              />
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-cyan-400" /> Método de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            >
              <option value="ZELLE">Zelle (USD)</option>
              <option value="PAGO_MOVIL">Pago Móvil (Bs)</option>
              <option value="BINANCE">Binance Pay (USDT / Crypto)</option>
              <option value="EFECTIVO_USD">Efectivo Divisas ($ USD)</option>
              <option value="EFECTIVO_BS">Efectivo Bolívares (Bs)</option>
              <option value="TRANSFERENCIA_BS">Transferencia Bancaria Nacional (Bs)</option>
              <option value="TRANSFERENCIA_USD">Transferencia Internacional / Wire (USD)</option>
              <option value="OTRO">Otro Método</option>
            </select>
          </div>

          {/* Referencia y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-purple-400" /> N° Referencia / Comprobante
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={e => setReferenceCode(e.target.value)}
                placeholder="ej. #983421 o Zelle John"
                className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-white outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-orange-400" /> Fecha del Pago
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                required
                className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-white outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
          </div>

          {/* Auto-extensión de Licencia */}
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2">
            <label className="text-xs font-black text-cyan-300 flex items-center justify-between">
              <span>Extender Vigencia de Licencia Automáticamente:</span>
            </label>
            <select
              value={extendDays}
              onChange={e => setExtendDays(e.target.value)}
              className="w-full bg-slate-950/90 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
            >
              <option value="0">No extender vigencia (Solo registrar pago)</option>
              <option value="30">+30 Días (1 Mes Adicional)</option>
              <option value="60">+60 Días (2 Meses)</option>
              <option value="90">+90 Días (1 Trimestre)</option>
              <option value="180">+180 Días (1 Semestre)</option>
              <option value="365">+365 Días (1 Año Completo)</option>
              <option value="1095">+1095 Días (3 Años - Plan Trienal)</option>
            </select>
            <p className="text-[11px] text-cyan-400/80 font-medium">
              Al guardar, se sumarán estos días a la fecha de vencimiento actual de la licencia.
            </p>
          </div>

          {/* Notas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Notas u Observaciones
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Detalles sobre el cobro (ej. Pago anticipado por 1 año de renovación)"
              className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer flex-1 text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-full font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex-[2] flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>REGISTRAR COBRO</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
