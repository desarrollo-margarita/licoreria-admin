import React from 'react';
import { Store, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function KpiHeader({ 
  totalBusinesses, 
  mrrTotal, 
  activeCount, 
  expiringCount, 
  totalRevenueCollected = 0,
  statusFilter = 'ALL',
  onStatusFilterChange,
  onSelectTab
}) {
  const cards = [
    {
      id: 'ALL',
      title: 'Comercios Registrados',
      value: totalBusinesses,
      icon: Store,
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      glow: 'from-cyan-500/20 to-blue-600/10',
      activeRing: 'ring-2 ring-cyan-400 border-cyan-400/80 bg-cyan-500/10 shadow-xl shadow-cyan-500/20 scale-[1.01]',
      valueColor: 'text-white',
      subtext: 'Clientes en plataforma',
      badge: 'Total Global',
      isActive: statusFilter === 'ALL',
      actionHint: 'Ver todos',
      onClick: () => onStatusFilterChange && onStatusFilterChange('ALL')
    },
    {
      id: 'MRR',
      title: 'Facturación Mensual (MRR)',
      value: `$${mrrTotal.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      glow: 'from-emerald-500/20 to-teal-600/10',
      activeRing: 'ring-2 ring-emerald-400 border-emerald-400/80 bg-emerald-500/10 shadow-xl shadow-emerald-500/20 scale-[1.01]',
      valueColor: 'text-emerald-400 font-mono',
      subtext: 'Recurrente proyectado',
      badge: 'USD / Mes',
      isActive: false,
      actionHint: 'Ver activos',
      onClick: () => onStatusFilterChange && onStatusFilterChange('ACTIVE')
    },
    {
      id: 'LTV',
      title: 'Total Cobrado (LTV Global)',
      value: `$${totalRevenueCollected.toFixed(2)}`,
      icon: DollarSign,
      iconBg: 'bg-teal-500/15 border-teal-500/30 text-teal-300',
      glow: 'from-teal-500/20 to-emerald-600/10',
      activeRing: 'ring-2 ring-teal-400 border-teal-400/80 bg-teal-500/10 shadow-xl shadow-teal-500/20 scale-[1.01]',
      valueColor: 'text-teal-300 font-mono',
      subtext: 'Cobros reales registrados',
      badge: 'Cash In',
      isActive: false,
      actionHint: 'Ir a Finanzas →',
      onClick: () => onSelectTab && onSelectTab('finances')
    },
    {
      id: 'ACTIVE',
      title: 'Licencias Activas',
      value: activeCount,
      icon: CheckCircle2,
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      glow: 'from-purple-500/20 to-pink-600/10',
      activeRing: 'ring-2 ring-purple-400 border-purple-400/80 bg-purple-500/10 shadow-xl shadow-purple-500/20 scale-[1.01]',
      valueColor: 'text-white',
      subtext: 'Suscripciones al día',
      badge: '100% Operativas',
      isActive: statusFilter === 'ACTIVE',
      actionHint: 'Filtrar activas',
      onClick: () => onStatusFilterChange && onStatusFilterChange(statusFilter === 'ACTIVE' ? 'ALL' : 'ACTIVE')
    },
    {
      id: 'EXPIRING',
      title: 'Por Vencer (7 Días)',
      value: expiringCount,
      icon: Clock,
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      glow: 'from-amber-500/20 to-orange-600/10',
      activeRing: 'ring-2 ring-amber-400 border-amber-400/80 bg-amber-500/10 shadow-xl shadow-amber-500/20 scale-[1.01]',
      valueColor: expiringCount > 0 ? 'text-amber-400' : 'text-slate-400',
      subtext: 'Requieren gestión de cobro',
      badge: expiringCount > 0 ? '¡Atención!' : 'Todo al Día',
      isActive: statusFilter === 'EXPIRING',
      actionHint: 'Filtrar por vencer',
      onClick: () => onStatusFilterChange && onStatusFilterChange(statusFilter === 'EXPIRING' ? 'ALL' : 'EXPIRING')
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 w-full">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            onClick={card.onClick}
            title={`Haz clic para ${card.actionHint}`}
            className={`relative border rounded-3xl backdrop-blur-xl shadow-2xl p-6 sm:p-7 min-h-[175px] flex flex-col justify-between group transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 select-none ${
              card.isActive
                ? card.activeRing
                : 'bg-gradient-to-b from-[#1a0f36]/80 to-[#0d061e]/90 border-white/10 hover:border-cyan-500/40'
            }`}
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
                <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border tracking-wider transition-colors ${
                  card.isActive 
                    ? 'bg-white text-slate-950 border-white shadow-sm'
                    : 'bg-slate-950/80 border-white/10 text-slate-300'
                }`}>
                  {card.isActive ? '✓ Filtrado' : card.badge}
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

            {/* Subtext and Action Hint */}
            <div className="pt-3 mt-3 pb-1 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400 font-medium relative z-10">
              <span className="truncate">{card.subtext}</span>
              <span className={`shrink-0 ml-1 font-bold ${card.isActive ? 'text-cyan-300 font-black' : 'text-slate-500 group-hover:text-cyan-400'} transition-colors`}>
                {card.isActive ? 'Activo' : 'Filtrar →'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
