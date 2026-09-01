import React, { useState } from 'react';
import { Check, Zap, Plus, Minus, Sparkles, Crown, Rocket } from 'lucide-react';

export default function InteractivePricing() {
  const [extraBoxes, setExtraBoxes] = useState(0);

  const plans = [
    {
      key: 'MENSUAL',
      name: 'Emprendedor',
      basePrice: 50,
      periodLabel: '/ año',
      billingNote: 'Equivale a solo $4.17/mes · 1 Caja',
      includedBoxes: 1,
      extraBoxPrice: 15,
      accent: 'slate',
      icon: Zap,
      desc: 'Ideal para tiendas, minimarkets, bodegas o comercios pequeños que inician con 1 caja.',
      features: [
        '1 Caja / Punto de Venta Principal (1 Año)',
        'Tasa BCV Oficial en Tiempo Real',
        'Cobro Multimoneda (USD / Bs. / Zelle)',
        'Impresión Térmica ESC/POS USB y Bluetooth',
        '100% Funcional Offline (Base de Datos Local)',
        'Soporte Técnico por WhatsApp',
      ],
      ctaLabel: 'CONTRATAR EMPRENDEDOR',
      ctaClass: 'bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/15 hover:border-white/30 shadow-lg',
    },
    {
      key: 'ANUAL',
      name: 'Anual Pro',
      basePrice: 80,
      periodLabel: '/ año',
      billingNote: 'Equivale a $6.67/mes · Ahorra 44%',
      includedBoxes: 2,
      extraBoxPrice: 20,
      accent: 'orange',
      icon: Crown,
      popular: true,
      desc: 'Para comercios consolidados con 2 cajas de cobro o 1 Caja de facturación + 1 PC de oficina.',
      features: [
        '2 Cajas / PCs Autorizadas Incluidas',
        'Todo lo del Plan Emprendedor',
        'Libro de Ventas SENIAT (Excel / PDF)',
        'Control Comisiones y Permisos por PIN',
        'Respaldo Automático Nube Supabase',
        'Soporte Prioritario por WhatsApp',
      ],
      ctaLabel: 'ADQUIRIR PLAN PRO',
      ctaClass: 'bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white font-black shadow-2xl shadow-pink-500/40 hover:opacity-90',
    },
    {
      key: 'TRIENAL',
      name: 'Trienal Multi-Caja',
      basePrice: 150,
      periodLabel: '/ 3 años',
      billingNote: 'Solo $4.16/mes · 3 Cajas incluidas',
      includedBoxes: 3,
      extraBoxPrice: 35,
      accent: 'cyan',
      icon: Rocket,
      desc: 'Máximo ahorro para negocios de alto volumen: 36 meses de cobertura con 3 cajas.',
      features: [
        '3 Cajas / PCs Autorizadas',
        'Cobertura Total por 36 Meses (3 Años)',
        'Capacitación Cajeros y Dueño Incluida',
        'Soporte VIP 24/7 Directo',
        'Actualizaciones Gratuitas de Por Vida',
        'Migración Datos desde Excel Incluida',
      ],
      ctaLabel: 'ADQUIRIR TRIENAL',
      ctaClass: 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black shadow-xl shadow-cyan-500/30',
    },
  ];

  const getWaLink = (plan, extra = 0) => {
    const price = plan.basePrice + (extra * plan.extraBoxPrice);
    const boxes = plan.includedBoxes + extra;
    const msg = encodeURIComponent(
      `Hola VentroX POS, deseo contratar el Plan ${plan.name} ($${price} por ${boxes} Cajas). ¿Cuáles son los métodos de pago?`
    );
    return `https://wa.me/584248486105?text=${msg}`;
  };

  const accentStyles = {
    slate: {
      badge: 'bg-slate-800 text-slate-300 border border-slate-700',
      check: 'text-emerald-400',
      priceColor: 'text-white',
      iconBg: 'bg-slate-800/90 text-slate-300 border border-white/10',
    },
    orange: {
      badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/40',
      check: 'text-orange-400',
      priceColor: 'text-white',
      iconBg: 'bg-gradient-to-br from-orange-500/30 to-pink-500/30 text-orange-300 border border-orange-500/40',
    },
    cyan: {
      badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
      check: 'text-cyan-400',
      priceColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    },
  };

  return (
    <section id="planes" className="w-full py-6 sm:py-7 px-6 sm:px-10 lg:px-16 xl:px-24 relative overflow-hidden flex flex-col items-center justify-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/8 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[1500px] mx-auto relative z-10 flex flex-col items-center">
        
        {/* Centered Section Header */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-6 space-y-3">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold border border-orange-500/20 mx-auto shadow-lg shadow-orange-500/10">
            <Zap className="w-4 h-4" /> Precios Transparentes · Sin Comisiones Ocultas
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-tight text-center mt-2">
            Elige el Plan que <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-amber-400 bg-clip-text text-transparent">Impulse tu Negocio</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed text-center">
            Pagas una tarifa fija y disfrutas de actualizaciones, soporte continuo y cero comisiones por venta.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-8 items-stretch mb-7 w-full">
          {plans.map((plan) => {
            const style = accentStyles[plan.accent];
            const Icon = plan.icon;
            const isPop = plan.popular;

            return (
              <div
                key={plan.key}
                className={`relative ${
                  isPop 
                    ? 'bg-gradient-to-b from-[#26124c]/95 to-[#12082a]/95 border border-orange-500/50 hover:border-orange-500 shadow-2xl shadow-orange-500/20' 
                    : 'bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 hover:border-cyan-500/40 shadow-xl'
                } rounded-2xl backdrop-blur-xl p-5 sm:p-6 lg:p-7 flex flex-col justify-between h-full group transition-all duration-300 hover:-translate-y-1 overflow-hidden`}
              >
                {isPop && (
                  <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 py-1.5 px-4 text-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" /> RECOMENDADO · MÁS POPULAR (AHORRA 44%)
                    </span>
                  </div>
                )}

                <div className={isPop ? 'pt-4 relative z-10' : 'relative z-10'}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${style.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider ${style.badge}`}>
                        {plan.includedBoxes} {plan.includedBoxes === 1 ? 'Caja Incluida' : 'Cajas Incluidas'}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight mb-1">{plan.name}</h3>
                    
                    <div className="flex items-baseline gap-1 my-2">
                      <span className="text-xl text-slate-400 font-bold">$</span>
                      <span className={`text-4xl sm:text-5xl font-black tracking-tight ${style.priceColor}`}>
                        {plan.basePrice}
                      </span>
                      <span className="text-slate-400 text-xs font-semibold">{plan.periodLabel}</span>
                    </div>

                    <div className="inline-block text-[11px] font-bold text-slate-300 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                      {plan.billingNote}
                    </div>
                  </div>

                  {/* Features in compact dark chips */}
                  <div className="space-y-2 mb-5 pb-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200 bg-slate-950/40 py-2 px-3 rounded-lg border border-white/[0.04]">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                          plan.accent === 'orange' ? 'bg-orange-500/20 text-orange-400' : plan.accent === 'cyan' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          <Check className="w-2.5 h-2.5" />
                        </div>
                        <span className={`leading-snug text-xs ${i === 0 && isPop ? 'font-black text-white' : 'font-medium'}`}>
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href={getWaLink(plan)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full py-3 rounded-full text-xs sm:text-sm font-black tracking-wide text-center transition-all duration-200 block relative z-10 ${plan.ctaClass}`}
                >
                  {plan.ctaLabel} (${plan.basePrice})
                </a>
              </div>
            );
          })}
        </div>

        {/* Box Calculator */}
        <div className="max-w-4xl mx-auto p-5 sm:p-7 bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 rounded-2xl backdrop-blur-xl shadow-2xl w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-widest">
                Calculadora de Terminales
              </span>
              <h3 className="text-2xl font-black text-white">¿Necesitas cajas adicionales?</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Agrega puntos de cobro extra a tu plan fácilmente.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setExtraBoxes(Math.max(0, extraBoxes - 1))}
                disabled={extraBoxes === 0}
                className="w-12 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer transition-colors"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-center min-w-[60px]">
                <div className="text-2xl font-black text-white">{extraBoxes}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Extra</div>
              </div>
              <button
                onClick={() => setExtraBoxes(extraBoxes + 1)}
                className="w-12 h-12 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center font-bold cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {extraBoxes > 0 && (
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-xs text-slate-400 mb-2">Costo adicional por {extraBoxes} {extraBoxes === 1 ? 'caja extra' : 'cajas extra'}:</p>
              <div className="text-3xl font-black text-cyan-400 mb-5">
                Desde +${extraBoxes * 10} <span className="text-xs font-medium text-slate-400">según plan</span>
              </div>
              <a
                href={`https://wa.me/584248486105?text=${encodeURIComponent(`Hola VentroX, necesito información sobre ${extraBoxes} cajas adicionales para mi plan.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-4 px-9 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-500/30 transition-all"
              >
                SOLICITAR COTIZACIÓN POR WHATSAPP
              </a>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
