import React, { useState, useEffect } from 'react';
import { 
  Store, KeyRound, User, Phone, Mail, FileText, DollarSign, Monitor, 
  Sparkles, CheckCircle2, AlertTriangle, Plus, Minus, Save, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../ui/Modal';
import { updateBusinessInfo } from '../../lib/storageService';

export default function EditBusinessModal({ isOpen, onClose, business, onUpdated }) {
  const [businessName, setBusinessName] = useState('');
  const [rifDoc, setRifDoc] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [maxBoxes, setMaxBoxes] = useState(1);
  const [monthlyFeeUsd, setMonthlyFeeUsd] = useState('80.00');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (business) {
      setBusinessName(business.businessName || '');
      setRifDoc(business.rifDoc || '');
      setPhone(business.phone || '');
      setContactPerson(business.contactPerson || '');
      setEmail(business.email || '');
      setMaxBoxes(business.maxBoxes || 1);
      setMonthlyFeeUsd(business.monthlyFeeUsd !== undefined ? String(business.monthlyFeeUsd) : '80.00');
      setNotes(business.notes || '');
      setErrorMsg('');
    }
  }, [business, isOpen]);

  if (!business) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  const handleBoxDelta = (delta) => {
    setMaxBoxes(prev => Math.max(1, Math.min(20, prev + delta)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) {
      setErrorMsg('El nombre comercial del negocio es obligatorio.');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      await updateBusinessInfo(business.licenseKey, {
        businessName,
        rifDoc,
        phone,
        contactPerson,
        email,
        maxBoxes,
        monthlyFeeUsd,
        notes
      });

      triggerConfetti();
      onUpdated(`Comercio "${businessName}" actualizado con éxito.`);
      onClose();
    } catch (err) {
      setErrorMsg('Error actualizando comercio: ' + (err.message || 'Intente de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Datos del Comercio" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Info Banner on Active Plan and Key */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-transparent border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Licencia Asignada</div>
              <div className="font-mono text-xs font-black text-cyan-300 select-all">{business.licenseKey}</div>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Plan {business.planType || 'OFICIAL'}
          </span>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-3 animate-shake">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Business Name */}
          <div className="space-y-2 sm:col-span-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-cyan-400" />
              Nombre Comercial del Negocio *
            </label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Ej: Inversiones & Comercio Express C.A."
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>

          {/* RIF */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-orange-400" />
              RIF / Documento Fiscal
            </label>
            <input
              type="text"
              value={rifDoc}
              onChange={(e) => setRifDoc(e.target.value.toUpperCase())}
              placeholder="Ej: J-12345678-9"
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors uppercase font-mono shadow-inner"
            />
          </div>

          {/* Phone / WhatsApp */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Teléfono / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 04121234567"
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-purple-400" />
              Persona de Contacto / Dueño
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Ej: Carlos Mendoza"
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-pink-400" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@negocio.com"
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
            />
          </div>
        </div>

        {/* Dynamic Boxes and Fee Card */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-5 shadow-lg">
          
          {/* Max Boxes Selector */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <Monitor className="w-4 h-4 text-cyan-400" />
              Cajas Autorizadas (PCs)
            </label>
            <p className="text-[11px] text-slate-400">
              Terminales autorizadas para facturar en simultáneo.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleBoxDelta(-1)}
                disabled={maxBoxes <= 1}
                className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-white cursor-pointer transition-colors border border-white/10"
              >
                <Minus className="w-4 h-4" />
              </button>
              <div className="flex-1 bg-slate-900 border border-white/15 rounded-xl py-2.5 text-center">
                <span className="text-2xl font-black text-white font-mono">{maxBoxes}</span>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">{maxBoxes === 1 ? 'Caja' : 'Cajas'}</span>
              </div>
              <button
                type="button"
                onClick={() => handleBoxDelta(1)}
                disabled={maxBoxes >= 20}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black flex items-center justify-center cursor-pointer transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Custom Fee */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Tarifa Registrada (USD)
            </label>
            <p className="text-[11px] text-slate-400">
              Monto acordado para el cobro del plan / terminales extra.
            </p>
            <div className="relative pt-1">
              <span className="absolute left-4 top-4.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={monthlyFeeUsd}
                onChange={(e) => setMonthlyFeeUsd(e.target.value)}
                className="w-full bg-slate-900 border border-white/15 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-bold font-mono focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300">
            Observaciones o Notas Especiales
          </label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Negocio con 2 sucursales, solicitó 1 caja extra para depósito..."
            className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
          />
        </div>

        {/* Modal Buttons */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-3 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors border border-white/10 cursor-pointer"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-500/25 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{loading ? 'Guardando Cambios...' : 'GUARDAR CAMBIOS'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
