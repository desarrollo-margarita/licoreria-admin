import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

const faqs = [
  {
    q: '¿El sistema funciona si se va la luz o el internet?',
    a: '¡Sí, 100%! VentroX se ejecuta directamente en la computadora de tu negocio con almacenamiento local ultrarrápido. Puedes seguir facturando, cobrando, imprimiendo tickets y controlando inventarios sin internet.'
  },
  {
    q: '¿Cómo funciona la tasa del Banco Central de Venezuela (BCV)?',
    a: 'VentroX consulta y sincroniza automáticamente la tasa oficial del BCV cuando tienes internet. Si estás offline o deseas ingresar una tasa personalizada, te permite cambiarla en 1 solo clic y todos los precios se actualizan al instante.'
  },
  {
    q: '¿Cuántas computadoras o cajas puedo conectar en mi negocio?',
    a: 'Depende de tu plan: el Plan Emprendedor incluye 1 caja, el Plan Anual Pro incluye 2 cajas (ej. 2 Cajas de cobro o 1 Caja + 1 Computadora de Oficina para el dueño) y el Plan Trienal incluye 3 cajas. Puedes agregar cajas adicionales en cualquier momento.'
  },
  {
    q: '¿Qué impresoras térmicas de tickets soporta VentroX?',
    a: 'Soporta cualquier impresora térmica estándar de 58mm u 80mm ESC/POS conectada por cable USB o Bluetooth en Windows (Epson, POS-58, POS-80, Bixolon, Xprinter, Netum, etc.).'
  },
  {
    q: '¿Cómo recibo la clave de activación después del pago?',
    a: 'Al realizar el pago por Pago Móvil, Zelle o Binance, te enviamos de inmediato tu Clave Única de Licencia por WhatsApp. La ingresas en la sección Ajustes de VentroX y el sistema queda activado de por vida según tu plan.'
  }
];

export default function FaqSection() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggleFaq = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-6 sm:py-7 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/15 text-purple-300 text-xs font-bold border border-purple-500/30 mx-auto shadow-lg shadow-purple-500/10">
            <HelpCircle className="w-4 h-4 text-purple-400" /> Respuestas Claras y Directas
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-2">
            Preguntas <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">Frecuentes</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto text-center leading-relaxed">
            Resolvemos tus dudas sobre la instalación, funcionamiento sin internet y activación de licencias en VentroX POS.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5 w-full">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden shadow-lg ${
                  isOpen
                    ? 'bg-slate-900/90 border-purple-500/40 shadow-purple-500/5'
                    : 'bg-slate-900/50 border-white/[0.08] hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-8 sm:p-9 text-left font-bold text-white text-base sm:text-lg flex items-center justify-between gap-4 cursor-pointer hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-purple-500/20 text-purple-300 rotate-180' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-8 pb-8 sm:px-9 sm:pb-9 text-sm sm:text-base text-slate-300 leading-relaxed border-t border-white/[0.06] pt-6">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div className="mt-14 p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/15 rounded-[28px] backdrop-blur-xl shadow-2xl text-center flex flex-col sm:flex-row items-center justify-between gap-8 w-full">
          <div className="text-center sm:text-left space-y-2">
            <h4 className="text-xl sm:text-2xl font-bold text-white">¿Tienes alguna otra duda sobre tu negocio?</h4>
            <p className="text-xs sm:text-sm text-slate-400">Escríbenos directamente por WhatsApp y te asesoramos al instante.</p>
          </div>
          <a
            href="https://wa.me/584248486105?text=Hola%20VentroX%2C%20tengo%20una%20consulta%20antes%20de%20adquirir%20el%20sistema"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-9 py-4 rounded-full font-black text-xs sm:text-sm bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:opacity-95 transition-all flex-shrink-0"
          >
            <span>Consultar por WhatsApp</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

      </div>
    </section>
  );
}
