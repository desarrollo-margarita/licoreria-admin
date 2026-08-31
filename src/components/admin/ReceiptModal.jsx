import React, { useRef } from 'react';
import { 
  Printer, Share2, CheckCircle2, ShieldCheck, 
  Calendar, Building2, User
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function ReceiptModal({ isOpen, onClose, payment, business, bcvRate = 65.50 }) {
  const receiptRef = useRef(null);

  if (!payment || !business) return null;

  const receiptNumber = payment.receipt_number || payment.receiptNumber || `REC-${new Date(payment.payment_date || Date.now()).getFullYear()}-${(payment.id || Math.floor(1000 + Math.random()*9000)).toString().padStart(4, '0')}`;
  const paymentDate = payment.payment_date ? new Date(payment.payment_date) : new Date();
  const amountUsd = parseFloat(payment.amount_usd || 0);
  const amountVes = parseFloat(payment.amount_ves || (amountUsd * bcvRate) || 0);
  const formattedUsd = amountUsd.toFixed(2);
  const formattedVes = amountVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const paymentMethod = payment.payment_method || 'ZELLE';
  const reference = payment.reference_code || 'SIN REF';
  const extendedDays = payment.period_extended_days || 0;

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const rawPhone = business.phone ? business.phone.replace(/[^0-9]/g, '') : '';
    const phoneParam = rawPhone ? `phone=${rawPhone}&` : '';
    
    const message = `🧾 *COMPROBANTE DE PAGO - VENTROX POS*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *Recibo Nº:* \`${receiptNumber}\`\n` +
      `🏢 *Comercio:* ${business.businessName}\n` +
      `📄 *RIF:* ${business.rifDoc}\n` +
      `📅 *Fecha:* ${paymentDate.toLocaleDateString('es-VE')}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `💵 *Monto en USD:* $${formattedUsd} USD\n` +
      `🇻🇪 *Equivalente VES:* Bs. ${formattedVes} (Tasa: ${bcvRate})\n` +
      `💳 *Método de Pago:* ${paymentMethod}\n` +
      `🔢 *Referencia:* \`${reference}\`\n` +
      (extendedDays > 0 ? `⏳ *Extensión de Servicio:* +${extendedDays} días\n` : '') +
      `🔑 *Licencia:* \`${business.licenseKey}\`\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ *Estado:* Pago Verificado y Asentado con éxito.\n` +
      `_Gracias por confiar en el ecosistema VentroX._`;

    const url = `https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante Digital de Pago">
      <div className="space-y-6">
        {/* Visual Receipt Card (Print Friendly) */}
        <div 
          ref={receiptRef}
          className="bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 text-slate-100 shadow-2xl relative overflow-hidden print:border-black print:text-black print:bg-white"
        >
          {/* Background watermark badge */}
          <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
            <ShieldCheck className="w-64 h-64 text-emerald-400" />
          </div>

          {/* Receipt Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg">
                  VX
                </div>
                <h3 className="text-xl font-bold tracking-tight text-white">VentroX POS</h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">Plataforma SaaS de Facturación & Licencias</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAGO ASENTADO
              </span>
              <p className="text-sm font-mono font-bold text-slate-200 mt-1.5">{receiptNumber}</p>
            </div>
          </div>

          {/* Client & Transaction Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-white/10 text-sm">
            <div className="space-y-2">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" /> Datos del Comercio
              </span>
              <p className="font-bold text-white text-base">{business.businessName}</p>
              <p className="text-slate-300 text-xs">RIF/Doc: <span className="font-mono">{business.rifDoc}</span></p>
              {business.contactPerson && (
                <p className="text-slate-300 text-xs flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> {business.contactPerson}
                </p>
              )}
            </div>

            <div className="space-y-2 sm:text-right">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold flex items-center sm:justify-end gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Detalles de Emisión
              </span>
              <p className="text-slate-200 text-xs">Fecha: {paymentDate.toLocaleDateString('es-VE', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p className="text-slate-200 text-xs">Método: <span className="font-semibold text-emerald-400">{paymentMethod}</span></p>
              <p className="text-slate-200 text-xs">Ref: <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-white/10">{reference}</span></p>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="py-5 border-b border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Canon de Suscripción / Plan ({business.planType || 'ANUAL'}):</span>
              <span className="font-mono text-slate-200">${formattedUsd} USD</span>
            </div>
            {extendedDays > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-400/90">
                <span>Vigencia Extendida:</span>
                <span>+{extendedDays} Días</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Tasa de Cambio Oficial (BCV):</span>
              <span>Bs. {bcvRate.toFixed(2)} / USD</span>
            </div>

            <div className="pt-3 border-t border-dashed border-white/15 flex justify-between items-baseline">
              <span className="text-base font-bold text-white">Total Recibido:</span>
              <div className="text-right">
                <div className="text-2xl font-black font-mono text-emerald-400">${formattedUsd} USD</div>
                <div className="text-xs text-slate-400 font-mono">≈ Bs. {formattedVes} VES</div>
              </div>
            </div>
          </div>

          {/* License & QR Footer */}
          <div className="pt-5 flex items-center justify-between gap-4">
            <div className="space-y-1 text-xs">
              <p className="text-slate-400">Clave de Licencia Enlazada:</p>
              <p className="font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded inline-block">
                {business.licenseKey}
              </p>
              <p className="text-[10px] text-slate-500 mt-2">VentroX Software Solutions · ID de Operación: #{payment.id || 'SYNC'}</p>
            </div>

            {/* Stylized QR Code Placeholder */}
            <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-md flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                <path d="M10 10h30v30h-30zM15 15v20h20v-20zM22 22h6v6h-6zM60 10h30v30h-30zM65 15v20h20v-20zM72 22h6v6h-6zM10 60h30v30h-30zM15 65v20h20v-20zM22 72h6v6h-6zM60 60h10v10h-10zM80 60h10v10h-10zM60 80h10v10h-10zM70 70h10v10h-10zM80 80h10v10h-10z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Imprimir / Guardar PDF
          </Button>

          <Button
            variant="primary"
            onClick={handleShareWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
          >
            <Share2 className="w-4 h-4" />
            Compartir por WhatsApp
          </Button>
        </div>
      </div>
    </Modal>
  );
}
