import React, { useState, useEffect } from 'react';
import { 
  Sliders, Sparkles, 
  Layers, Printer, Warehouse, FileSpreadsheet, Utensils, 
  MessageSquare, UserCheck, DollarSign, Save
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { updateBusinessModules, updateBusinessDistributor } from '../../lib/storageService';

const AVAILABLE_MODULES = [
  {
    key: 'cashea',
    name: 'Integración Cashea & BNPL',
    desc: 'Permite procesar ventas a cuotas y conciliación con Cashea.',
    icon: Sparkles,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20'
  },
  {
    key: 'fiscal_printer',
    name: 'Facturación e Impresora Fiscal',
    desc: 'Protocolo de impresión fiscal (The Factory HKA, Bixolon, Epson).',
    icon: Printer,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20'
  },
  {
    key: 'multi_warehouse',
    name: 'Múltiples Almacenes y Depósitos',
    desc: 'Transferencias internas de stock entre piso de venta y bodegas.',
    icon: Warehouse,
    color: 'text-indigo-400',
    bg: 'bg-indigo-400/10 border-indigo-400/20'
  },
  {
    key: 'kardex',
    name: 'Kardex Avanzado y Costeo Ponderado',
    desc: 'Auditoría detallada de entradas, salidas y margen de utilidad.',
    icon: Layers,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/20'
  },
  {
    key: 'restaurant_tables',
    name: 'Comandas, Mesas y Barra',
    desc: 'Gestión de cuentas abiertas para consumo en barra o mesas.',
    icon: Utensils,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10 border-rose-400/20'
  },
  {
    key: 'pdf_reports',
    name: 'Reportes Financieros & Exportación',
    desc: 'Generación de libros de ventas y reportes contables en PDF/Excel.',
    icon: FileSpreadsheet,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20'
  },
  {
    key: 'whatsapp_receipts',
    name: 'Envío de Facturas por WhatsApp',
    desc: 'Permite al cajero enviar ticket digital al WhatsApp del comprador.',
    icon: MessageSquare,
    color: 'text-teal-400',
    bg: 'bg-teal-400/10 border-teal-400/20'
  }
];

export default function FeatureFlagsModal({ isOpen, onClose, business, onSaved }) {
  const [modules, setModules] = useState({});
  const [distributorName, setDistributorName] = useState('');
  const [distributorCommission, setDistributorCommission] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (business) {
      setModules(business.modulesConfig || {
        cashea: true,
        fiscal_printer: true,
        multi_warehouse: true,
        kardex: true,
        restaurant_tables: false,
        pdf_reports: true,
        whatsapp_receipts: true
      });
      setDistributorName(business.distributorName || '');
      setDistributorCommission((business.distributorCommission || 0).toString());
      setError('');
    }
  }, [business]);

  if (!business) return null;

  const handleToggleModule = (key) => {
    setModules(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateBusinessModules(business.businessId, business.licenseKey, modules);
      await updateBusinessDistributor(business.businessId, business.licenseKey, distributorName, distributorCommission);

      if (onSaved) {
        onSaved({
          ...business,
          modulesConfig: modules,
          distributorName,
          distributorCommission: parseFloat(distributorCommission) || 0
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Módulos & Aliado Comercial">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Header Info */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-base">{business.businessName}</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{business.licenseKey} · {business.rifDoc}</p>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Plan {business.planType || 'ANUAL'}
          </span>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Modules / Feature Flags Switches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Módulos Habilitados en el POS
            </span>
            <span className="text-[11px] text-slate-400">
              {Object.values(modules).filter(Boolean).length} de {AVAILABLE_MODULES.length} activos
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {AVAILABLE_MODULES.map((mod) => {
              const Icon = mod.icon;
              const isEnabled = !!modules[mod.key];

              return (
                <div
                  key={mod.key}
                  onClick={() => handleToggleModule(mod.key)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isEnabled 
                      ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-500/60 shadow-sm' 
                      : 'bg-slate-950/40 border-white/5 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg border shrink-0 ${mod.bg} ${mod.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{mod.name}</p>
                      <p className="text-xs text-slate-400 line-clamp-1">{mod.desc}</p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    className={`w-11 h-6 shrink-0 rounded-full transition-colors relative flex items-center p-0.5 ${
                      isEnabled ? 'bg-indigo-600' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distributor / Partner Assignment */}
        <div className="border-t border-white/10 pt-4 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            Aliado / Distribuidor Asignado
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nombre del Aliado / Técnico</label>
              <input
                type="text"
                placeholder="Ej. Soporte Margarita / Carlos F."
                value={distributorName}
                onChange={(e) => setDistributorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Comisión por Renovación (USD)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={distributorCommission}
                  onChange={(e) => setDistributorCommission(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-300"
            disabled={loading}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Módulos'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
