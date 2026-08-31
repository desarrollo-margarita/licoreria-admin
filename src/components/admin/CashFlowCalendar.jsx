import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, DollarSign, TrendingUp, 
  ChevronLeft, ChevronRight, Clock, CheckCircle2, MessageCircle
} from 'lucide-react';
import Button from '../ui/Button';

export default function CashFlowCalendar({ subscriptions = [], onRecordPayment, onWhatsApp }) {
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0);

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
    });

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

  return (
    <div className="space-y-6">
      {/* Forecast Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Next 7 Days */}
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Próximos 7 Días
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/20">
              {next7Days.count} {next7Days.count === 1 ? 'licencia' : 'licencias'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ${next7Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Vencimientos inmediatos por renovar esta semana.</p>
        </div>

        {/* Next 15 Days */}
        <div className="bg-slate-900/80 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Próximos 15 Días
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-semibold border border-indigo-500/20">
              {next15Days.count} {next15Days.count === 1 ? 'licencia' : 'licencias'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              ${next15Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Proyección de cobro quincenal acumulada.</p>
        </div>

        {/* Next 30 Days */}
        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Próximos 30 Días
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20">
              {next30Days.count} {next30Days.count === 1 ? 'licencia' : 'licencias'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              ${next30Days.totalUsd.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">USD esperados</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Flujo mensual proyectado de renovaciones.</p>
        </div>
      </div>

      {/* Month Navigator & Calendar List */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white capitalize">{currentMonthName}</h3>
              <p className="text-xs text-slate-400">
                {monthExpirations.length} vencimientos previstos · Total estimado: <span className="text-emerald-400 font-bold font-mono">${totalMonthExpected.toFixed(2)} USD</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonthOffset(prev => prev - 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
              title="Mes Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedMonthOffset(0)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-white/5"
            >
              Mes Actual
            </button>
            <button
              onClick={() => setSelectedMonthOffset(prev => prev + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-white/5"
              title="Mes Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expirations List */}
        <div className="mt-5">
          {monthExpirations.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No hay renovaciones programadas para este mes.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {monthExpirations.map((sub) => {
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
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {sub.planType}
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
