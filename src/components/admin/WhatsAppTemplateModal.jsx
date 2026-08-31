import React, { useState, useEffect } from 'react';
import { 
  X, MessageCircle, Copy, Check, Send, Sparkles, Bell, 
  AlertTriangle, KeyRound, Headphones, FileText, CheckCircle2 
} from 'lucide-react';
import { formatDate, getDaysRemaining } from '../../lib/licenseUtils';

export default function WhatsAppTemplateModal({ isOpen, business, onClose, onSent }) {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState('REMINDER');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (business) {
      applyTemplate(selectedTemplateKey);
    }
  }, [business, selectedTemplateKey, isOpen]);

  if (!isOpen || !business) return null;

  const daysLeft = getDaysRemaining(new Date(business.expirationDate));
  const cleanPhone = (business.phone || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('0') ? '58' + cleanPhone.substring(1) : cleanPhone;
  const contactName = business.contactPerson || business.businessName;
  const expDateFormatted = formatDate(new Date(business.expirationDate));
  const feeFormatted = `$${parseFloat(business.monthlyFeeUsd || 80).toFixed(2)}`;

  const templates = [
    {
      key: 'REMINDER',
      title: 'Aviso Preventivo de Vencimiento',
      icon: Bell,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      description: 'Recordatorio cortés faltando pocos días',
      generate: () => `Hola ${contactName} 👋 Te saludamos del equipo de *VentroX POS* 🚀

Te escribimos para recordarte amablemente que la suscripción de tu sistema para *${business.businessName}* vencerá el *${expDateFormatted}* (${daysLeft > 0 ? `quedan ${daysLeft} días` : 'hoy'}).

🏷️ *Clave de Licencia:* \`${business.licenseKey}\`
📦 *Plan:* ${business.planType} (${business.maxBoxes} Caja/s)
💵 *Monto de Renovación:* ${feeFormatted}

Para mantener tu punto de venta 100% operativo sin interrupciones, ¿deseas coordinar el pago de tu renovación hoy? Disponemos de Pago Móvil, Zelle y Binance. 📲✨`
    },
    {
      key: 'EXPIRED',
      title: 'Aviso de Licencia Vencida / Corte',
      icon: AlertTriangle,
      iconColor: 'text-red-400 bg-red-500/15 border-red-500/30',
      description: 'Notificación de suspensión preventiva',
      generate: () => `Hola ${contactName}, buen día. Te contactamos del soporte central de *VentroX POS* ⚠️

Te informamos que la licencia de tu sistema para *${business.businessName}* ha llegado a su fecha límite de vigencia (*${expDateFormatted}*).

🔒 *Estado:* Suscripción por renovar
🔑 *Clave:* \`${business.licenseKey}\`
💵 *Monto:* ${feeFormatted}

Para reactivar de inmediato la facturación y sincronización de inventario en tus cajas, por favor envíanos el comprobante de tu pago por esta vía. ¡Estamos a tu completa orden!`
    },
    {
      key: 'PAID_CONFIRM',
      title: 'Confirmación de Pago y Renovación',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      description: 'Agradecimiento de pago y confirmación',
      generate: () => `¡Hola ${contactName}! 🎉

Hemos recibido y validado con éxito el pago de tu suscripción para *${business.businessName}*. 

✅ *Tu licencia ha sido extendida y está 100% ACTIVA.*
📅 *Nueva fecha de vigencia:* ${expDateFormatted}
🔑 *Clave de Licencia:* \`${business.licenseKey}\`
🖥️ *Cajas autorizadas:* ${business.maxBoxes}

Muchas gracias por seguir confiando en *VentroX POS* para el control de tu negocio. ¡Seguimos trabajando para darte el mejor sistema! 🚀📈`
    },
    {
      key: 'WELCOME_KEY',
      title: 'Bienvenida y Entrega de Clave',
      icon: KeyRound,
      iconColor: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30',
      description: 'Datos de activación para nuevo cliente',
      generate: () => `¡Bienvenido a *VentroX POS*, ${contactName}! 🚀🏬

Tu comercio *${business.businessName}* ha sido registrado exitosamente en nuestra plataforma de Punto de Venta.

Tus credenciales de activación son:
🔑 *Clave de Licencia:* \`${business.licenseKey}\`
📄 *RIF / Documento:* ${business.rifDoc}
📦 *Plan Asignado:* ${business.planType}
🖥️ *Cajas Autorizadas:* ${business.maxBoxes}
📅 *Vigencia Inicial:* hasta el ${expDateFormatted}

Para activar el sistema en tu computadora, abre VentroX POS, ingresa tu clave y haz clic en *Activar Licencia*. ¡Cuentas con nuestro soporte ante cualquier duda!`
    },
    {
      key: 'SUPPORT',
      title: 'Asistencia y Soporte Técnico',
      icon: Headphones,
      iconColor: 'text-purple-400 bg-purple-500/15 border-purple-500/30',
      description: 'Contacto de soporte y mantenimiento',
      generate: () => `Hola ${contactName} 👋 Te saludamos del área técnica de *VentroX POS*.

Nos comunicamos contigo para verificar cómo está funcionando el sistema en *${business.businessName}* y atender cualquier requerimiento de configuración, impresoras térmicas o nuevas funciones.

¿Deseas programar una sesión de soporte o actualización remota? Quedamos muy atentos. 💻🛠️`
    }
  ];

  const applyTemplate = (key) => {
    const t = templates.find(item => item.key === key) || templates[0];
    setCustomMessage(t.generate());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!waPhone) {
      alert('Este comercio no tiene un número telefónico válido registrado.');
      return;
    }
    const encoded = encodeURIComponent(customMessage);
    const url = `https://wa.me/${waPhone}?text=${encoded}`;
    window.open(url, '_blank');
    if (onSent) onSent('Mensaje de WhatsApp abierto.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl bg-gradient-to-b from-[#1a0f36] to-[#0d061e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Glow ambient light */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                Centro de Mensajería WhatsApp
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PLANTILLAS DINÁMICAS
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Destinatario: <strong className="text-white">{contactName}</strong> ({business.phone || 'Sin teléfono'}) · {business.businessName}
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

        {/* Main 2-Column Grid (Template Selectors + Live Editor) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-y-auto min-h-[300px]">
          
          {/* Left Column: Template Options */}
          <div className="md:col-span-5 space-y-2.5">
            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-1">
              Selecciona una Plantilla:
            </label>

            {templates.map(t => {
              const Icon = t.icon;
              const isSelected = selectedTemplateKey === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setSelectedTemplateKey(t.key);
                    applyTemplate(t.key);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 group ${
                    isSelected 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-400/60 shadow-md shadow-cyan-500/10' 
                      : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-950'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${t.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-cyan-300' : 'text-white group-hover:text-slate-200'}`}>
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                      {t.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Live Message Preview & Editor */}
          <div className="md:col-span-7 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Mensaje a Enviar (Personalizable):
              </label>
              <button
                type="button"
                onClick={() => applyTemplate(selectedTemplateKey)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Restaurar texto</span>
              </button>
            </div>

            <textarea
              rows={11}
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              className="w-full flex-1 bg-slate-950/90 border border-white/15 rounded-2xl p-4 text-xs sm:text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans leading-relaxed resize-none shadow-inner"
              placeholder="Escribe el mensaje..."
            />

            <p className="text-[11px] text-slate-500 font-medium">
              Puedes editar directamente cualquier dato o texto antes de enviarlo por WhatsApp.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-slate-400">
            {waPhone ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Número listo: +{waPhone}
              </span>
            ) : (
              <span className="text-amber-400 font-medium">
                ⚠️ Sin número de WhatsApp válido
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 transition-all flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-initial"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              disabled={!waPhone}
              className="px-6 py-2.5 rounded-full font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
            >
              <Send className="w-4 h-4" />
              <span>ABRIR EN WHATSAPP</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
