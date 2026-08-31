import React, { useState } from 'react';
import { 
  Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../ui/Modal';
import { changeBusinessPlan } from '../../lib/storageService';
import { formatDate } from '../../lib/licenseUtils';

export default function ChangePlanModal({
  isOpen,
  onClose,
  business,
  onPlanChanged
}) {
  const currentPlan = business?.planType || 'ANUAL';
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!business) return null;

  const plans = [
    {
      id: 'MENSUAL',
      title: 'Plan Emprendedor',
      period: 'Mensual',
      price: '$12.00 / mes',
      fee: 12.00,
      boxes: '1 Caja (PC)',
      days: 30,
      desc: 'Ideal para pequeños negocios o bodegas individuales.',
      badge: 'Básico'
    },
    {
      id: 'ANUAL',
      title: 'Plan Anual Pro',
      period: 'Anual (1 Año)',
      price: '$80.00 / año',
      fee: 80.00,
      boxes: '2 Cajas (PCs)',
      days: 365,
      desc: 'Licencia anual completa con 2 cajas simultáneas.',
      badge: 'Recomendado'
    },
    {
      id: 'TRIENAL',
      title: 'Plan Trienal Multi-Caja',
      period: 'Trienal (3 Años)',
      price: '$150.00 / 3 años',
      fee: 150.00,
      boxes: '3 Cajas (PCs)',
      days: 1095,
      desc: '3 años de tranquilidad con soporte multi-caja ampliado.',
      badge: 'Máximo Ahorro'
    }
  ];

  const currentPlanObj = plans.find(p => p.id === currentPlan) || plans[1];
  const newPlanObj = plans.find(p => p.id === selectedPlan) || plans[1];

  const calculatedNewExp = new Date();
  calculatedNewExp.setDate(calculatedNewExp.getDate() + newPlanObj.days);

  const handleConfirmChange = async () => {
    if (selectedPlan === currentPlan) {
      onClose();
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await changeBusinessPlan(business.licenseKey, selectedPlan);
      
      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}

      setLoading(false);
      onPlanChanged(`¡Plan de "${business.businessName}" actualizado a ${newPlanObj.title}!`);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Error al cambiar el plan del comercio.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Suscripción del Comercio"
      subtitle={`Un comercio solo puede tener 1 suscripción activa a la vez (${business.businessName})`}
      icon={Sparkles}
      maxWidth="max-w-2xl"
    >
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-6 flex items-start gap-2.5 shadow-lg animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Error al actualizar</div>
            <div className="text-[11px] leading-relaxed opacity-95">{errorMsg}</div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Business Current Status Header */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between shadow-inner">
          <div>
            <div className="text-xs text-slate-400 font-medium">Comercio a Modificar:</div>
            <div className="text-sm font-black text-white">{business.businessName}</div>
            <div className="text-[11px] text-slate-400 font-mono">RIF: {business.rifDoc} · {business.licenseKey}</div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Plan Actual:</div>
            <span className="inline-block mt-0.5 px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
              {currentPlanObj.title}
            </span>
          </div>
        </div>

        {/* 3 Official Subscription Plans Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wide">
            Selecciona la Nueva Suscripción (1 Activa por Negocio):
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              const isCurrent = currentPlan === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-cyan-500/15 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10' 
                      : 'bg-slate-950/70 border-white/10 hover:border-white/20 hover:bg-slate-900/80'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      isSelected 
                        ? 'bg-cyan-400 text-slate-950 border-cyan-300' 
                        : 'bg-slate-900 text-slate-400 border-white/10'
                    }`}>
                      {p.badge}
                    </span>

                    {isCurrent && (
                      <span className="text-[9px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        Actual
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold text-white">{p.title}</h4>
                    <div className="text-base font-black text-emerald-400 font-mono mt-1">
                      {p.price}
                    </div>
                    <div className="text-[11px] text-cyan-300 font-semibold mt-1">
                      {p.boxes}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  {/* Radio Indicator */}
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[11px] font-bold">
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-cyan-400 bg-cyan-400 text-slate-950' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                    <span className={isSelected ? 'text-cyan-300' : 'text-slate-500'}>
                      {isSelected ? 'Seleccionado' : 'Elegir'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Impact Summary & Confirmation Alert */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3 shadow-inner">
          <div className="flex items-start gap-2.5 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>Confirmación de Cambio de Suscripción:</span>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 pl-6.5">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Plan: <strong className="text-slate-400 line-through">{currentPlanObj.title}</strong> ➔ <strong className="text-white">{newPlanObj.title}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Cajas Habilitadas: <strong className="text-cyan-300">{newPlanObj.boxes}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Nueva Vigencia: <strong className="text-emerald-400">Hasta el {formatDate(calculatedNewExp)}</strong> ({newPlanObj.days} días desde hoy)
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmChange}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{loading ? 'ACTUALIZANDO...' : 'CONFIRMAR Y CAMBIAR PLAN'}</span>
          </button>
        </div>

      </div>
    </Modal>
  );
}
