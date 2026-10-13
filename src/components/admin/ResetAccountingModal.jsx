import React, { useState } from 'react';
import { 
  RotateCcw, ShieldAlert, CheckCircle2, AlertTriangle, 
  Package, Layers, ShoppingCart, DollarSign, Users, Truck, Lock
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { resetBusinessSalesAndAccounting } from '../../lib/storageService';

export default function ResetAccountingModal({ isOpen, business, onClose, onAccountingReset }) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen || !business) return null;

  const targetPhrase = 'RESETEAR';
  const isConfirmed = confirmText.trim().toUpperCase() === targetPhrase || 
                      confirmText.trim().toLowerCase() === (business.businessName || '').trim().toLowerCase();

  const handleReset = async (e) => {
    e.preventDefault();
    if (!isConfirmed) return;

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await resetBusinessSalesAndAccounting(business.licenseKey, business.id);
      setSuccessMsg(`¡Ventas y contabilidad reseteadas con éxito para "${res.businessName}"! Catálogo de productos y combos preservado al 100%.`);
      
      if (onAccountingReset) {
        onAccountingReset(`Ventas y caja reseteadas para "${res.businessName}".`);
      }

      setTimeout(() => {
        setConfirmText('');
        setSuccessMsg(null);
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.message || 'Error al resetear ventas y contabilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setConfirmText('');
    setError(null);
    setSuccessMsg(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Resetear Ventas y Contabilidad"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Header Warning Card */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">
                Reinicio Contable: <span className="text-amber-300">{business.businessName}</span>
              </h4>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/10">
                {business.licenseKey}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Esta acción vacía a cero todas las operaciones de venta, turnos de caja y movimientos contables. 
              <strong> El inventario físico de productos y todos los combos permanecerán 100% intactos.</strong>
            </p>
          </div>
        </div>

        {/* Comparative Summary: What is Deleted vs What is Protected */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Se Elimina (Rojo/Ámbar) */}
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-red-300 uppercase text-[11px] tracking-wide">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Se Reinicia a Cero</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Historial de ventas y renglones
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Turnos y arqueos de caja (cash shifts)
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Cuentas por cobrar y abonos a crédito
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Compras y cuentas por pagar
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Gastos y retiros administrativos
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-red-400 font-bold">•</span> Movimientos de auditoría de venta
              </li>
            </ul>
          </div>

          {/* Se Conserva Intacto (Verde) */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300 uppercase text-[11px] tracking-wide">
              <Package className="w-3.5 h-3.5" />
              <span>Se Conserva 100% Intacto</span>
            </div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Catálogo completo de productos
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Unidades en stock y presentaciones
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Todos los combos creados y recetas
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Categorías y marcas comerciales
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Directorio de clientes y proveedores
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span> Cajas vinculadas, usuarios y PINs
              </li>
            </ul>
          </div>
        </div>

        {/* Notification / Info banner about Online-First Auto-Sync */}
        <div className="p-3 rounded-xl bg-slate-900 border border-white/5 text-[11px] text-slate-400 flex items-center gap-2">
          <span className="text-cyan-400 font-bold">⚡ Sincronización OTA:</span>
          <span>
            Se emitirá una señal en tiempo real a las terminales POS de este comercio para que sincronicen y limpien su base local SQLite automáticamente.
          </span>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Security Confirmation Form */}
        <form onSubmit={handleReset} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Para confirmar, escribe <span className="font-mono text-amber-300 font-bold uppercase">RESETEAR</span> o el nombre exacto del comercio:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Escribe RESETEAR para habilitar..."
              disabled={loading || !!successMsg}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={loading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isConfirmed || loading || !!successMsg}
              className={`flex items-center gap-2 font-bold transition-all ${
                isConfirmed && !loading
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-lg shadow-orange-900/30 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Reseteando datos...' : 'Resetear Ventas y Caja'}</span>
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
