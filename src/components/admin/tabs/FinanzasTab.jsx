import React, { useState } from 'react';
import { 
  CheckCircle2, Clock, 
  Calendar as CalendarIcon, UserCheck, 
  Check, X, ExternalLink
} from 'lucide-react';
import Button from '../../ui/Button';
import CashFlowCalendar from '../CashFlowCalendar';

export default function FinanzasTab({ 
  subscriptions = [], 
  payments = [], 
  onRecordPayment, 
  onWhatsApp,
  onApprovePayment,
  onRejectPayment,
  onOpenClientPortal
}) {
  const [activeSubTab, setActiveSubTab] = useState('calendar'); // 'calendar' | 'pending' | 'distributors'

  // Pagos pendientes de verificación
  const pendingPayments = payments.filter(p => p.status === 'PENDING_VERIFICATION');

  // Cálculo de comisiones por distribuidor / aliado
  const distributorMap = {};
  subscriptions.forEach(sub => {
    if (sub.distributorName) {
      const dist = sub.distributorName;
      if (!distributorMap[dist]) {
        distributorMap[dist] = {
          name: dist,
          clientCount: 0,
          totalCommissionUsd: 0,
          clients: []
        };
      }
      distributorMap[dist].clientCount += 1;
      distributorMap[dist].totalCommissionUsd += parseFloat(sub.distributorCommission || 0);
      distributorMap[dist].clients.push(sub.businessName);
    }
  });

  const distributorList = Object.values(distributorMap);

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            Flujo de Caja & Calendario
          </button>

          <button
            onClick={() => setActiveSubTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeSubTab === 'pending'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Aprobación de Pagos
            {pendingPayments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                {pendingPayments.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('distributors')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'distributors'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Comisiones de Aliados
          </button>
        </div>

        {onOpenClientPortal && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenClientPortal}
            className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Portal de Pago de Clientes
          </Button>
        )}
      </div>

      {/* SubTab 1: Cashflow Calendar */}
      {activeSubTab === 'calendar' && (
        <CashFlowCalendar
          subscriptions={subscriptions}
          onRecordPayment={onRecordPayment}
          onWhatsApp={onWhatsApp}
        />
      )}

      {/* SubTab 2: Pending Payments Approval */}
      {activeSubTab === 'pending' && (
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pagos Reportados por Clientes (Pendientes de Validación)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Comprobantes subidos desde el Portal de Pago Express esperando verificación de transferencia / pago móvil.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {pendingPayments.length} pendientes
            </span>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-500/50" />
              <p className="text-sm font-semibold text-slate-300">¡Al día! No hay pagos pendientes por revisar.</p>
              <p className="text-xs text-slate-500 mt-1">
                Los clientes pueden reportar sus pagos en el enlace público del portal express.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingPayments.map((p) => {
                const b = subscriptions.find(s => s.licenseKey === p.license_key);

                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-amber-500/30 hover:border-amber-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {b?.businessName || p.license_key}
                        </span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {p.license_key}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Método: <span className="text-amber-300 font-semibold">{p.payment_method}</span> · 
                        Ref: <span className="font-mono text-white font-bold bg-slate-800 px-1.5 py-0.2 rounded">{p.reference_code}</span> · 
                        Fecha: {new Date(p.payment_date).toLocaleDateString('es-VE')}
                      </p>
                      {p.notes && (
                        <p className="text-xs text-slate-400 italic">"{p.notes}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-black font-mono text-emerald-400">
                          ${parseFloat(p.amount_usd || 0).toFixed(2)} USD
                        </div>
                        {p.amount_ves > 0 && (
                          <div className="text-xs font-mono text-slate-400">
                            Bs. {parseFloat(p.amount_ves).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onRejectPayment(p.id, p.license_key)}
                          className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors"
                          title="Rechazar Pago"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApprovePayment(p.id, b?.businessId || b?.id, p.license_key)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-1.5 px-3 flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" /> Aprobar & Extender
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SubTab 3: Distributors Summary */}
      {activeSubTab === 'distributors' && (
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                Liquidación y Comisiones de Aliados / Distribuidores
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cálculo de comisiones por cliente asignado a técnicos o promotores comerciales.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {distributorList.length} aliados registrados
            </span>
          </div>

          {distributorList.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <UserCheck className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No has asignado aliados comerciales a tus clientes todavía.</p>
              <p className="text-xs text-slate-500 mt-1">
                Puedes asignar un aliado desde el botón "Módulos & Aliado" en la ficha de cada comercio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {distributorList.map((dist) => (
                <div
                  key={dist.name}
                  className="bg-slate-950/70 border border-emerald-500/20 rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-white text-base">{dist.name}</h4>
                      <p className="text-xs text-slate-400">{dist.clientCount} {dist.clientCount === 1 ? 'comercio asignado' : 'comercios asignados'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                      ${dist.totalCommissionUsd.toFixed(2)} USD
                    </span>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <p className="text-[11px] text-slate-400 font-semibold mb-1">Comercios en Cartera:</p>
                    <div className="flex flex-wrap gap-1">
                      {dist.clients.slice(0, 4).map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {c}
                        </span>
                      ))}
                      {dist.clients.length > 4 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          +{dist.clients.length - 4} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
