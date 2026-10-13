import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, DollarSign, TrendingUp, 
  ChevronLeft, ChevronRight, Clock, CheckCircle2, MessageCircle,
  Filter, X, Sparkles
} from 'lucide-react';
import Button from '../ui/Button';

const formatPlanName = (p) => {
  const norm = (p || '').toUpperCase();
  if (norm === 'TRIENAL' || norm === 'ANUAL_MAX') return 'Anual Max';
  if (norm === 'ANUAL' || norm === 'ANUAL_PRO') return 'Anual Pro';
  if (norm === 'MENSUAL' || norm === 'EMPRENDEDOR') return 'Emprendedor';
  if (norm === 'DEMO') return 'Demo';
  return p;
};

export default function CashFlowCalendar({ subscriptions = [], onRecordPayment, onWhatsApp }) {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);
  const [activeKpiFilter, setActiveKpiFilter] = useState(null); // null | '7' | '15' | '30'

  const now = new Date();
  const currentMonthDate = new Date(now.getFullYear(), now.getMonth() + selectedMonthOffset, 1);
  const currentMonthName = currentMonthDate.toLocaleDateString('es-VE', { month: 'long', year: 'numeric' });

  // Calcular proyecciones 7d, 15d, 30d
  const getUpcomingStats = (daysWindow) => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() + daysWindow);

    const matches = subscriptions.filter(sub => {
      if (!sub.expirationDate) return false;
      const exp = new Date(sub.expirationDate);
      return exp >= now && exp <= limitDate;
    }).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

    const totalUsd = matches.reduce((acc, s) => acc + (parseFloat(s.monthlyFeeUsd) || 0), 0);
    return { count: matches.length, totalUsd, items: matches };
  };

  const next7Days = getUpcomingStats(7);
  const next15Days = getUpcomingStats(15);
  const next30Days = getUpcomingStats(30);

  // Vencimientos del mes seleccionado
  const monthExpirations = subscriptions.filter(sub => {
    if (!sub.expirationDate) return false;
    const exp = new Date(sub.expirationDate);
    return exp.getMonth() === currentMonthDate.getMonth() && exp.getFullYear() === currentMonthDate.getFullYear();
  }).sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

  const totalMonthExpected = monthExpirations.reduce((acc, s) => acc + (parseFloat(s.monthlyFeeUsd) || 0), 0);

  // Determinar lista activa según el filtro KPI
  const displayedList = activeKpiFilter === '7'
    ? next7Days.items
    : activeKpiFilter === '15'
    ? next15Days.items
    : activeKpiFilter === '30'
    ? next30Days.items
    : monthExpirations;

  const displayedTotalExpected = activeKpiFilter === '7'
    ? next7Days.totalUsd
    : activeKpiFilter === '15'
    ? next15Days.totalUsd
    : activeKpiFilter === '30'
    ? next30Days.totalUsd
    : totalMonthExpected;

  const handleKpiClick = (filterDays) => {
    setActiveKpiFilter(prev => prev === filterDays ? null : filterDays);
  };

  return (
    <div className="space-y-6">
      {/* Forecast Metric Cards (Actúan como Filtros) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next 7 Days */}
        <div 
          onClick={() => handleKpiClick('7')}
          className={`border rounded-2xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 select-none ${
            activeKpiFilter === '7'
              ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/60 shadow-xl shadow-amber-500/20 scale-[1.01]'
              : 'bg-slate-900/80 border-amber-500/30 hover:border-amber-400/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Próximos 7 Días
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
              activeKpiFilter === '7'
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/20'
            }`}>
              {activeKpiFilter === '7' ? '✓ Filtrado' : `${next7Days.count} ${next7Days.count === 1 ? 'licencia' : 'licencias'}`}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ${next7Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Vencimientos inmediatos por renovar esta semana.</p>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-bold">
            <span className={activeKpiFilter === '7' ? 'text-amber-300 font-black' : 'text-slate-400'}>
              {activeKpiFilter === '7' ? 'Mostrando esta lista abajo' : 'Haz clic para ver licencias'}
            </span>
            <span className={activeKpiFilter === '7' ? 'text-amber-300 underline' : 'text-amber-400/80'}>
              {activeKpiFilter === '7' ? 'Desactivar ✕' : 'Filtrar →'}
            </span>
          </div>
        </div>

        {/* Next 15 Days */}
        <div 
          onClick={() => handleKpiClick('15')}
          className={`border rounded-2xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 select-none ${
            activeKpiFilter === '15'
              ? 'bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-400/60 shadow-xl shadow-indigo-500/20 scale-[1.01]'
              : 'bg-slate-900/80 border-indigo-500/30 hover:border-indigo-400/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Próximos 15 Días
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
              activeKpiFilter === '15'
                ? 'bg-indigo-400 text-slate-950 border-indigo-300 shadow-sm'
                : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20'
            }`}>
              {activeKpiFilter === '15' ? '✓ Filtrado' : `${next15Days.count} ${next15Days.count === 1 ? 'licencia' : 'licencias'}`}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ${next15Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Proyección de cobro quincenal acumulada.</p>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-bold">
            <span className={activeKpiFilter === '15' ? 'text-indigo-300 font-black' : 'text-slate-400'}>
              {activeKpiFilter === '15' ? 'Mostrando esta lista abajo' : 'Haz clic para ver licencias'}
            </span>
            <span className={activeKpiFilter === '15' ? 'text-indigo-300 underline' : 'text-indigo-400/80'}>
              {activeKpiFilter === '15' ? 'Desactivar ✕' : 'Filtrar →'}
            </span>
          </div>
        </div>

        {/* Next 30 Days */}
        <div 
          onClick={() => handleKpiClick('30')}
          className={`border rounded-2xl p-5 relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 select-none ${
            activeKpiFilter === '30'
              ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/60 shadow-xl shadow-emerald-500/20 scale-[1.01]'
              : 'bg-slate-900/80 border-emerald-500/30 hover:border-emerald-400/60 hover:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Próximos 30 Días
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border transition-colors ${
              activeKpiFilter === '30'
                ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-sm'
                : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20'
            }`}>
              {activeKpiFilter === '30' ? '✓ Filtrado' : `${next30Days.count} ${next30Days.count === 1 ? 'licencia' : 'licencias'}`}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${next30Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Flujo mensual proyectado de renovaciones.</p>
          <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-bold">
            <span className={activeKpiFilter === '30' ? 'text-emerald-300 font-black' : 'text-slate-400'}>
              {activeKpiFilter === '30' ? 'Mostrando esta lista abajo' : 'Haz clic para ver licencias'}
            </span>
            <span className={activeKpiFilter === '30' ? 'text-emerald-300 underline' : 'text-emerald-400/80'}>
              {activeKpiFilter === '30' ? 'Desactivar ✕' : 'Filtrar →'}
            </span>
          </div>
        </div>
      </div>

      {/* Month Navigator & Calendar List */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6">
        {/* Active Filter Banner */}
        {activeKpiFilter && (
          <div className="mb-5 p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-500/15 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-fadeIn shadow-lg">
            <div className="flex items-center gap-2.5 text-indigo-200">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white">
                  Filtro activo: Vencimientos de los Próximos {activeKpiFilter} Días
                </span>
                <p className="text-[11px] text-indigo-300/80">
                  Mostrando {displayedList.length} {displayedList.length === 1 ? 'licencia' : 'licencias'} con vencimiento programado en esta ventana de tiempo.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveKpiFilter(null)}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 text-xs border border-white/15"
            >
              <X className="w-3.5 h-3.5" /> Quitar Filtro (Ver Mes Completo)
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
                <span>{activeKpiFilter ? `Vencimientos (Próximos ${activeKpiFilter} Días)` : currentMonthName}</span>
                {activeKpiFilter && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Filtrado
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                {displayedList.length} {displayedList.length === 1 ? 'vencimiento previsto' : 'vencimientos previstos'} · Total estimado: <span className="text-emerald-400 font-bold font-mono">${displayedTotalExpected.toFixed(2)} USD</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveKpiFilter(null);
                setSelectedMonthOffset(prev => prev - 1);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5 cursor-pointer"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveKpiFilter(null);
                setSelectedMonthOffset(0);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5 cursor-pointer"
            >
              Mes Actual
            </button>
            <button
              onClick={() => {
                setActiveKpiFilter(null);
                setSelectedMonthOffset(prev => prev + 1);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5 cursor-pointer"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expirations List */}
        <div className="mt-5">
          {displayedList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">
                {activeKpiFilter 
                  ? `No hay licencias programadas para vencer en los próximos ${activeKpiFilter} días.`
                  : 'No hay renovaciones programadas para este mes.'}
              </p>
              {activeKpiFilter && (
                <button
                  onClick={() => setActiveKpiFilter(null)}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-xs font-bold transition-all cursor-pointer"
                >
                  Restablecer vista mensual
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedList.map((sub) => {
                const expDate = new Date(sub.expirationDate);
                const isOverdue = expDate < now;
                const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={sub.id || sub.licenseKey}
                    className="p-4 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Day Pill */}
                      <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center shrink-0 ${
                        isOverdue 
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                          : daysLeft <= 5 
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                          : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      }`}>
                        <span className="text-[10px] uppercase font-bold">{expDate.toLocaleDateString('es-VE', { month: 'short' })}</span>
                        <span className="text-base font-black leading-none">{expDate.getDate()}</span>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{sub.businessName}</h4>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {formatPlanName(sub.planType)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {sub.licenseKey} · RIF: {sub.rifDoc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-bold font-mono text-emerald-400">
                          ${(parseFloat(sub.monthlyFeeUsd) || 0).toFixed(2)} USD
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {isOverdue 
                            ? `Venció hace ${Math.abs(daysLeft)} días` 
                            : daysLeft === 0 
                            ? 'Vence hoy' 
                            : `Vence en ${daysLeft} días`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {onWhatsApp && (
                          <button
                            onClick={() => onWhatsApp(sub)}
                            className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                            title="Cobro por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        {onRecordPayment && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onRecordPayment(sub)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-1.5 px-3"
                          >
                            Cobrar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
