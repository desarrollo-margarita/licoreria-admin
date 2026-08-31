import React from 'react';
import { Store, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function KpiHeader({ totalBusinesses, mrrTotal, activeCount, expiringCount, totalRevenueCollected = 0 }) {
  const cards = [
    {
      title: 'Comercios Registrados',
      value: totalBusinesses,
      icon: Store,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      glow: 'from-cyan-500/20 to-blue-600/10',
      valueColor: 'text-white',
      subtext: 'Clientes en plataforma',
      badge: 'Total Global'
    },
    {
      title: 'Facturación Mensual (MRR)',
      value: `$${mrrTotal.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      glow: 'from-emerald-500/20 to-teal-600/10',
      valueColor: 'text-emerald-400 font-mono',
      subtext: 'Recurrente proyectado',
      badge: 'USD / Mes'
    },
    {
      title: 'Total Cobrado (LTV Global)',
      value: `$${totalRevenueCollected.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      glow: 'from-teal-500/20 to-emerald-600/10',
      valueColor: 'text-teal-300 font-mono',
      subtext: 'Cobros reales registrados',
      badge: 'Cash In'
    },
    {
      title: 'Licencias Activas',
      value: activeCount,
      icon: CheckCircle2,
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      glow: 'from-purple-500/20 to-pink-600/10',
      valueColor: 'text-white',
      subtext: 'Suscripciones al día',
      badge: '100% Operativas'
    },
    {
      title: 'Por Vencer (7 Días)',
      value: expiringCount,
      icon: Clock,
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      glow: 'from-amber-500/20 to-orange-600/10',
      valueColor: expiringCount > 0 ? 'text-amber-400' : 'text-slate-400',
      subtext: 'Requieren gestión de cobro',
      badge: expiringCount > 0 ? '¡Atención!' : 'Todo al Día'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative bg-gradient-to-b from-[#1a0f36]/80 to-[#0d061e]/90 border border-white/10 hover:border-cyan-500/40 rounded-3xl backdrop-blur-xl shadow-2xl p-6 sm:p-7 min-h-[175px] flex flex-col justify-between group transition-all duration-300 overflow-hidden"
          >
            {/* Top lighting overlay */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none rounded-t-3xl" />
            
            {/* Ambient top light flare */}
            <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${card.glow} blur-2xl opacity-40 group-hover:opacity-80 transition-opacity rounded-full pointer-events-none`} />

            <div>
              {/* Header: Icon + Badge */}
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${card.iconBg} border flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-slate-950/80 border border-white/10 text-slate-300 tracking-wider">
                  {card.badge}
                </span>
              </div>

              {/* Metric Value */}
              <div className={`text-3xl sm:text-4xl font-black ${card.valueColor} tracking-tight mb-1 relative z-10`}>
                {card.value}
              </div>

              {/* Title */}
              <h4 className="text-xs sm:text-sm font-bold text-slate-200 tracking-tight relative z-10">
                {card.title}
              </h4>
            </div>

            {/* Subtext with safe bottom padding */}
            <div className="pt-3 mt-3 pb-1 border-t border-white/[0.08] text-[11px] text-slate-400 font-medium truncate relative z-10">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
