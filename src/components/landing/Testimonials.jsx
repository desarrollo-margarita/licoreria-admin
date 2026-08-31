import React from 'react';
import { Star, CheckCircle, ShieldCheck, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Alejandro Colmenares',
    role: 'Dueño / Administrador',
    business: 'Supermercado & Víveres La Floresta',
    city: 'Caracas, Miranda',
    rating: 5,
    highlight: 'El cobro multimoneda nos ahorró 3 cajeros los fines de semana',
    quote: 'Antes teníamos colas inmensas porque los cajeros tenían que calcular el vuelto a mano con calculadora. VentroX nos dice exactamente cuántos dólares y bolívares dar de vuelto a la tasa BCV al segundo. No se cuelga nunca.',
    boxes: '3 Cajas Conectadas'
  },
  {
    name: 'Marcos Viloria',
    role: 'Gerente General',
    business: 'Ferretería & Repuestos El Triunfo',
    city: 'Maracaibo, Zulia',
    rating: 5,
    highlight: '100% Offline: Si se va la luz o el internet seguimos facturando',
    quote: 'En Maracaibo los bajones y fallas de internet son constantes. Otros sistemas en la nube nos dejaban varados. Con VentroX seguimos cobrando con la impresora térmica sin importar si hay conexión.',
    boxes: '2 Cajas + Oficina'
  },
  {
    name: 'Dayana Mendoza',
    role: 'Propietaria',
    business: 'Minimarket & Bodegón Express',
    city: 'Valencia, Carabobo',
    rating: 5,
    highlight: 'Control de bultos, unidades sueltas y cuadre perfecto',
    quote: 'La venta por bultos y por unidades individuales por fin está cuadrada. El sistema descuenta del inventario exacto y exporta el libro de ventas listo para enviárselo a nuestro contador.',
    boxes: '1 Caja Principal'
  }
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="w-full py-6 sm:py-7 px-6 sm:px-10 lg:px-16 xl:px-24 relative flex flex-col items-center justify-center">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto relative z-10 flex flex-col items-center">
        
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30 mx-auto shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Casos de Éxito en Venezuela
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-2">
            Comercios que Multiplicaron su <span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Velocidad</span>
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto text-center leading-relaxed">
            Negocios y empresas en Venezuela que eliminaron los descuadres de caja y atienden el doble de rápido con VentroX POS.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-6 w-full">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="relative bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 hover:border-cyan-500/40 rounded-[28px] backdrop-blur-xl p-6 sm:p-10 lg:p-12 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 shadow-2xl overflow-hidden"
            >
              {/* Quote Mark Watermark */}
              <div className="absolute top-8 right-10 text-white/[0.04] group-hover:text-cyan-400/[0.1] transition-colors pointer-events-none">
                <Quote className="w-14 h-14" />
              </div>

              <div className="relative z-10">
                {/* Rating Stars Chip */}
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-amber-400/30 mb-8 shadow-sm">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] text-amber-300 font-bold ml-1">5.0 / 5.0</span>
                </div>

                {/* Highlight */}
                <h3 className="text-lg font-black text-white mb-4 group-hover:text-cyan-300 transition-colors leading-snug tracking-tight">
                  "{t.highlight}"
                </h3>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed italic mb-10 font-normal">
                  "{t.quote}"
                </p>
              </div>

              {/* Author & Business info */}
              <div className="pt-7 border-t border-white/[0.08] flex items-center justify-between relative z-10">
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    {t.name}
                    <CheckCircle className="w-4 h-4 text-cyan-400 inline" />
                  </div>
                  <div className="text-xs text-slate-300 font-medium">{t.business}</div>
                  <div className="text-[11px] text-slate-400">{t.city}</div>
                </div>

                <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/15 px-3.5 py-1.5 rounded-full border border-cyan-500/30 whitespace-nowrap shadow-sm">
                  {t.boxes}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Social Proof Bar */}
        <div className="mt-14 p-6 sm:p-10 lg:p-12 bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 rounded-[28px] backdrop-blur-xl shadow-2xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center w-full">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-cyan-400 font-mono tracking-tight">+250</div>
            <div className="text-xs sm:text-sm text-slate-300 font-bold">Comercios y Negocios</div>
            <div className="text-[11px] text-slate-500">Activos en toda Venezuela</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-orange-400 font-mono tracking-tight">0 Seg</div>
            <div className="text-xs sm:text-sm text-slate-300 font-bold">Dependencia de Internet</div>
            <div className="text-[11px] text-slate-500">100% Operativo Offline</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-pink-400 font-mono tracking-tight">100%</div>
            <div className="text-xs sm:text-sm text-slate-300 font-bold">Precisión Tasa BCV</div>
            <div className="text-[11px] text-slate-500">Sincronización en vivo</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-black text-emerald-400 font-mono tracking-tight">&lt; 2 Seg</div>
            <div className="text-xs sm:text-sm text-slate-300 font-bold">Tiempo de Cobro</div>
            <div className="text-[11px] text-slate-500">Ticket térmico inmediato</div>
          </div>
        </div>

      </div>
    </section>
  );
}
