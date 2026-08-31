import React, { useState } from 'react';
import { 
  Globe, CheckCircle2, 
  DollarSign, Hash, Send, Copy, Check
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { submitClientExpressPayment } from '../../lib/storageService';

export default function ClientPaymentPortalModal({ isOpen, onClose, businesses = [], bcvRate = 65.50, onPaymentSubmitted }) {
  const [selectedLicense, setSelectedLicense] = useState('');
  const [amountUsd, setAmountUsd] = useState('80');
  const [amountVes, setAmountVes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PAGO_MOVIL');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const matchedBusiness = businesses.find(b => b.licenseKey === selectedLicense);

  const handleSelectLicense = (lic) => {
    setSelectedLicense(lic);
    const b = businesses.find(x => x.licenseKey === lic);
    if (b) {
      const fee = b.monthlyFeeUsd || 80;
      setAmountUsd(fee.toString());
      setAmountVes((fee * bcvRate).toFixed(2));
    }
  };

  const handleUsdChange = (val) => {
    setAmountUsd(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmountVes((parsed * bcvRate).toFixed(2));
    } else {
      setAmountVes('');
    }
  };

  const handleCopyPortalLink = () => {
    const link = `${window.location.origin}/#pagar`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLicense || !referenceCode.trim()) return;

    setLoading(true);
    try {
      await submitClientExpressPayment({
        licenseKey: selectedLicense,
        businessName: matchedBusiness?.businessName || 'Comercio Registrado',
        amountUsd,
        amountVes,
        paymentMethod,
        referenceCode,
        notes
      });
      setSuccess(true);
      if (onPaymentSubmitted) onPaymentSubmitted();
    } catch (err) {
      alert(err.message || 'Error al reportar pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Portal de Reporte de Pago Express">
      <div className="space-y-5">
        {/* Portal Public URL bar */}
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-300 truncate font-mono">
              {window.location.origin}/#pagar
            </p>
          </div>
          <button
            onClick={handleCopyPortalLink}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copiado' : 'Copiar Link'}
          </button>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">¡Comprobante Reportado con Éxito!</h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Tu reporte ha quedado en estado <span className="font-semibold text-amber-400">"Pendiente de Aprobación"</span>. El SuperAdmin verificará la referencia bancaria y extenderá la vigencia en unos instantes.
            </p>
            <Button
              variant="outline"
              onClick={() => { setSuccess(false); onClose(); }}
              className="mt-4 border-slate-700 hover:bg-slate-800 text-slate-200 text-xs"
            >
              Cerrar Ventana
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select License */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Comercio / Clave de Licencia *
              </label>
              <select
                required
                value={selectedLicense}
                onChange={(e) => handleSelectLicense(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Selecciona tu comercio...</option>
                {businesses.map((b) => (
                  <option key={b.licenseKey} value={b.licenseKey}>
                    {b.businessName} — ({b.licenseKey})
                  </option>
                ))}
              </select>
            </div>

            {/* Matched Details */}
            {matchedBusiness && (
              <div className="bg-slate-950/60 border border-white/10 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between font-bold text-white">
                  <span>{matchedBusiness.businessName}</span>
                  <span className="text-emerald-400 font-mono">Plan {matchedBusiness.planType}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Vencimiento Actual:</span>
                  <span>{new Date(matchedBusiness.expirationDate).toLocaleDateString('es-VE')}</span>
                </div>
              </div>
            )}

            {/* Amounts USD / VES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Monto Pagado (USD)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amountUsd}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Equivalente VES (Tasa: {bcvRate})</label>
                <input
                  type="number"
                  step="0.01"
                  value={amountVes}
                  onChange={(e) => setAmountVes(e.target.value)}
                  placeholder="Bs. 0.00"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Method & Ref */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Método de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PAGO_MOVIL">📱 Pago Móvil (VES)</option>
                  <option value="ZELLE">💵 Zelle (USD)</option>
                  <option value="BINANCE">🪙 Binance Pay / USDT</option>
                  <option value="TRANSFERENCIA_VES">🏦 Transferencia Bancaria VES</option>
                  <option value="EFECTIVO_USD">💵 Efectivo USD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nº de Referencia Bancaria *</label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. 12345678"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notas u Observaciones</label>
              <input
                type="text"
                placeholder="Ej. Pago correspondiente al mes de Septiembre"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Bank Accounts Info Box */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-[11px] text-emerald-300/90 space-y-0.5">
              <p className="font-bold text-emerald-400">Datos Oficiales de Cobro VentroX:</p>
              <p>• Pago Móvil: Banesco (0134) · 0414-1234567 · J-50000000-0</p>
              <p>• Zelle: pagos@ventroxpos.com · VentroX Technologies</p>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300 text-xs"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                variant="primary"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                disabled={loading}
              >
                <Send className="w-4 h-4" />
                {loading ? 'Enviando...' : 'Reportar Pago'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
