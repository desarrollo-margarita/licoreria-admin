import React, { useState, useEffect } from 'react';
import { 
  X, DollarSign, Calendar, CreditCard, Hash, Trash2, Plus, 
  FileText, Download, Copy, Check, ExternalLink, Receipt, Store, AlertCircle, Cloud
} from 'lucide-react';
import { fetchBusinessPayments, deletePayment } from '../../lib/storageService';
import { SUPABASE_SCHEMA_SQL } from '../../lib/supabaseClient';
import { formatDate } from '../../lib/licenseUtils';

export default function PaymentHistoryModal({ 
  isOpen, 
  business, 
  onClose, 
  onOpenRecordPayment,
  onPaymentDeleted 
}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && business) {
      loadPayments();
    }
  }, [isOpen, business]);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    setTableMissing(false);
    
    const res = await fetchBusinessPayments(
      business.licenseKey, 
      business.businessId || business.id
    );

    if (res.success) {
      setPayments(res.data || []);
      if (res.tableMissing) {
        setTableMissing(true);
      }
    } else {
      setError(res.error || 'Error al consultar historial de pagos');
    }
    setLoading(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!isOpen || !business) return null;

  const totalLtv = payments.reduce((acc, p) => acc + (parseFloat(p.amount_usd) || 0), 0);

  const handleDelete = async (paymentId) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro de pago?')) return;
    try {
      await deletePayment(paymentId);
      loadPayments();
      if (onPaymentDeleted) onPaymentDeleted('Pago eliminado.');
    } catch (err) {
      alert('Error eliminando pago: ' + err.message);
    }
  };

  const getMethodBadge = (method) => {
    const map = {
      'ZELLE': { label: 'Zelle (USD)', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
      'PAGO_MOVIL': { label: 'Pago Móvil (Bs)', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
      'BINANCE': { label: 'Binance (USDT)', bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
      'EFECTIVO_USD': { label: 'Efectivo ($)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      'EFECTIVO_BS': { label: 'Efectivo (Bs)', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
      'TRANSFERENCIA_BS': { label: 'Transf. Bancaria (Bs)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
      'TRANSFERENCIA_USD': { label: 'Wire / Transf ($)', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30' }
    };
    const current = map[method] || { label: method, bg: 'bg-slate-800 text-slate-300 border-white/10' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${current.bg}`}>
        {current.label}
      </span>
    );
  };

  const generateReceiptText = (pay) => {
    return `🧾 *COMPROBANTE DE PAGO · VENTROX POS* 🧾
----------------------------------------
🏬 *Comercio:* ${business.businessName}
📄 *RIF:* ${business.rifDoc}
🔑 *Licencia:* ${business.licenseKey}
📅 *Fecha:* ${new Date(pay.payment_date).toLocaleDateString()}
💵 *Monto:* $${parseFloat(pay.amount_usd || 0).toFixed(2)} USD ${pay.amount_ves ? `(Bs. ${parseFloat(pay.amount_ves).toFixed(2)})` : ''}
💳 *Método:* ${pay.payment_method}
🔢 *Referencia:* ${pay.reference_code || 'N/A'}
⏳ *Extensión:* ${pay.period_extended_days ? `+${pay.period_extended_days} días` : 'N/A'}
----------------------------------------
✅ *Estado:* Pago Procesado y Verificado
Gracias por confiar en *VentroX POS* 🚀`;
  };

  const handleCopyReceipt = (pay) => {
    const txt = generateReceiptText(pay);
    navigator.clipboard.writeText(txt);
    setCopiedReceipt(true);
    setTimeout(() => setCopiedReceipt(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-3xl bg-gradient-to-b from-[#1a0f36] to-[#0d061e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Historial de Cobros y Pagos
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

        {/* LTV & Metrics Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-shrink-0">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">Total Cobrado (LTV)</p>
              <p className="text-2xl font-black text-emerald-400 font-mono">${totalLtv.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
              $
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase">N° de Pagos</p>
              <p className="text-2xl font-black text-white font-mono">{payments.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                if (onOpenRecordPayment) onOpenRecordPayment(business);
              }}
              className="w-full h-full py-2.5 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>REGISTRAR NUEVO PAGO</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-[220px] space-y-3">
          {tableMissing && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Cloud className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Tabla de pagos lista para habilitar en Supabase</p>
                  <p className="text-[11px] text-cyan-300/80 mt-0.5">
                    Ejecuta el script SQL en el SQL Editor de tu proyecto Supabase para activar la persistencia del historial de cobros.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all flex-shrink-0"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Cargando pagos registrados...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={loadPayments}
                className="px-3 py-1 rounded-lg bg-red-500/20 text-red-200 hover:bg-red-500/30 text-xs font-bold"
              >
                Reintentar
              </button>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/50 rounded-2xl border border-white/5 space-y-3">
              <Receipt className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">No hay pagos registrados para este cliente</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Haz clic en <strong>"REGISTRAR NUEVO PAGO"</strong> para ingresar el primer cobro y emitir comprobantes de pago.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {payments.map((pay) => (
                <div 
                  key={pay.id} 
                  className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-base font-black text-emerald-400 font-mono">
                        ${parseFloat(pay.amount_usd || 0).toFixed(2)} USD
                      </span>
                      {pay.amount_ves > 0 && (
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          (Bs. {parseFloat(pay.amount_ves).toFixed(2)})
                        </span>
                      )}
                      {getMethodBadge(pay.payment_method)}
                      {pay.period_extended_days > 0 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          +{pay.period_extended_days} días
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(pay.payment_date).toLocaleDateString()}
                      </span>
                      {pay.reference_code && (
                        <span className="font-mono text-purple-300 font-bold">
                          Ref: {pay.reference_code}
                        </span>
                      )}
                      {pay.notes && (
                        <span className="italic text-slate-400 truncate max-w-xs">
                          "{pay.notes}"
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
                    {onOpenDigitalReceipt && (
                      <button
                        type="button"
                        onClick={() => onOpenDigitalReceipt(pay, business)}
                        className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Ver e Imprimir Recibo Digital PDF"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Recibo PDF</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyReceipt(pay)}
                      className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white/[0.06] hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Copiar comprobante para WhatsApp"
                    >
                      {copiedReceipt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedReceipt ? 'Copiado' : 'Texto'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(pay.id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      title="Eliminar este pago"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-4 flex items-center justify-between flex-shrink-0 text-xs text-slate-400">
          <span>{payments.length} registro(s) encontrados</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full font-bold bg-white/[0.07] hover:bg-white/[0.14] text-white border border-white/15 transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
