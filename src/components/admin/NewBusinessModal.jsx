import React, { useState, useEffect } from 'react';
import { 
  Store, Key, User, Phone, Mail, FileText, DollarSign, Monitor, 
  Sparkles, AlertTriangle, Database
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Modal from '../ui/Modal';
import { registerBusiness } from '../../lib/storageService';
import { getAllNodes } from '../../lib/supabaseClient';

export default function NewBusinessModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('');
  const [rif, setRif] = useState('');
  const [phone, setPhone] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [planType, setPlanType] = useState('ANUAL');
  const [nodeId, setNodeId] = useState('node-default');
  const [nodesList, setNodesList] = useState([]);
  const [fee, setFee] = useState('80.00');
  const [boxes, setBoxes] = useState('2');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const allNodes = getAllNodes();
      setNodesList(allNodes);
      const defaultNode = allNodes.find(n => n.isDefault) || allNodes[0];
      if (defaultNode) setNodeId(defaultNode.id);
    }
  }, [isOpen]);

  const handlePlanChange = (e) => {
    const val = e.target.value;
    setPlanType(val);
    if (val === 'TRIENAL') {
      setFee('150.00');
      setBoxes('3');
    } else if (val === 'ANUAL') {
      setFee('80.00');
      setBoxes('2');
    } else if (val === 'MENSUAL') {
      setFee('50.00');
      setBoxes('1');
    } else if (val === 'DEMO') {
      setFee('0.00');
      setBoxes('1');
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log('Confetti trigger', e);
    }
  };

  const resetForm = () => {
    setName('');
    setRif('');
    setPhone('');
    setContact('');
    setEmail('');
    setPlanType('ANUAL');
    setFee('80.00');
    setBoxes('2');
    setNotes('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const result = await registerBusiness({
        name,
        rif,
        phone,
        contact,
        email,
        planType,
        fee,
        boxes,
        notes,
        nodeId
      });

      triggerConfetti();
      setLoading(false);

      onCreated(`¡Comercio "${name}" registrado exitosamente en Supabase! Clave de licencia: ${result.licenseKey}`);
      resetForm();
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Error al registrar el comercio.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Comercio Cliente"
      subtitle="Genera una nueva clave de licencia y activa su suscripción POS"
      icon={Store}
      maxWidth="max-w-2xl"
    >
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-6 flex items-start gap-2.5 shadow-lg animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold">Error de Registro</div>
            <div className="text-[11px] leading-relaxed opacity-95">{errorMsg}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Datos Principales */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nombre */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-cyan-400" /> Nombre del Comercio / Empresa *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="ej. Inversiones & Comercio La Floresta C.A."
                required
                className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-medium transition-all shadow-inner"
              />
            </div>

            {/* RIF */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-400" /> RIF o Documento Fiscal *
              </label>
              <input
                type="text"
                value={rif}
                onChange={e => setRif(e.target.value)}
                placeholder="ej. J-12345678-9 o V-12345678"
                required
                className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 uppercase outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all shadow-inner"
              />
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Teléfono WhatsApp (Cobranza)
              </label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="ej. 04141234567"
                className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all shadow-inner"
              />
            </div>

            {/* Contact Person */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-orange-400" /> Dueño o Persona de Contacto
              </label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="ej. Alejandro Colmenares"
                className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-medium transition-all shadow-inner"
              />
            </div>

          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> Correo Electrónico (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="contacto@empresa.com"
              className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-medium transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Configuración del Plan y Licencia */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/10 space-y-4 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Plan y Parámetros de Licencia
            </span>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-white/10">
              Genera Clave Única
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tipo de Plan Comercial
              </label>
              <select
                value={planType}
                onChange={handlePlanChange}
                className="w-full bg-[#0e0722] border border-white/15 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer transition-colors shadow-sm"
              >
                <option value="ANUAL">Plan Anual Pro ($80.00 / año · 2 Cajas Incluidas) - RECOMENDADO</option>
                <option value="TRIENAL">Plan Trienal Multi-Caja ($150.00 / 3 Años · 3 Cajas)</option>
                <option value="MENSUAL">Plan Emprendedor ($50.00 / año · 1 Caja)</option>
                <option value="DEMO">Prueba Gratuita Demo (15 Días · 1 Caja)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Clúster / Nodo Supabase
              </label>
              <select
                value={nodeId}
                onChange={e => setNodeId(e.target.value)}
                className="w-full bg-[#0e0722] border border-white/15 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer transition-colors shadow-sm font-mono"
              >
                {nodesList.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} {n.isDefault ? '(Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Tarifa USD ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={fee}
                onChange={e => setFee(e.target.value)}
                className="w-full bg-[#0e0722] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-400 font-mono outline-none focus:border-emerald-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-cyan-400" /> Cajas Autorizadas (PCs)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={boxes}
                onChange={e => setBoxes(e.target.value)}
                className="w-full bg-[#0e0722] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-black text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/25 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Key className="w-4 h-4" />
            <span>{loading ? 'REGISTRANDO...' : 'REGISTRAR Y GENERAR LICENCIA'}</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
