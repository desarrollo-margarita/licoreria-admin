import React, { useState, useEffect } from 'react';
import { 
  Save, Trash2, Send
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

export default function SupportTicketModal({ isOpen, onClose, ticket, businesses = [], onSave, onDelete }) {
  const [businessId, setBusinessId] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIA');
  const [status, setStatus] = useState('ABIERTO');
  const [assignedTo, setAssignedTo] = useState('Soporte');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setBusinessId(ticket.businessId || '');
      setLicenseKey(ticket.licenseKey || '');
      setBusinessName(ticket.businessName || '');
      setContactPhone(ticket.contactPhone || '');
      setTitle(ticket.title || '');
      setDescription(ticket.description || '');
      setPriority(ticket.priority || 'MEDIA');
      setStatus(ticket.status || 'ABIERTO');
      setAssignedTo(ticket.assignedTo || 'Soporte');
      setResolutionNotes(ticket.resolutionNotes || '');
    } else {
      setBusinessId('');
      setLicenseKey('');
      setBusinessName('');
      setContactPhone('');
      setTitle('');
      setDescription('');
      setPriority('MEDIA');
      setStatus('ABIERTO');
      setAssignedTo('Soporte');
      setResolutionNotes('');
    }
  }, [ticket, isOpen]);

  const handleSelectBusiness = (bKey) => {
    setLicenseKey(bKey);
    const selected = businesses.find(b => b.licenseKey === bKey);
    if (selected) {
      setBusinessId(selected.businessId || selected.id);
      setBusinessName(selected.businessName);
      setContactPhone(selected.phone || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSave({
        id: ticket?.id,
        businessId,
        licenseKey,
        businessName: businessName || 'Comercio General',
        contactPhone,
        title,
        description,
        priority,
        status,
        assignedTo,
        resolutionNotes
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppHelp = () => {
    const rawPhone = contactPhone ? contactPhone.replace(/[^0-9]/g, '') : '';
    const phoneParam = rawPhone ? `phone=${rawPhone}&` : '';
    const message = `👋 *Hola ${businessName}*\n` +
      `Te escribe el equipo de Soporte Técnico de VentroX POS.\n` +
      `Estamos atendiendo tu reporte: *"${title}"* (Ticket #${ticket?.id || 'Nuevo'}).\n` +
      `¿En qué momento tienes disponibilidad para ayudarte a solucionarlo?`;
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket ? `Ticket #${ticket.id}` : 'Nuevo Ticket de Soporte'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Business */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Comercio Afectado</label>
          <select
            value={licenseKey}
            onChange={(e) => handleSelectBusiness(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Selecciona un comercio (Opcional)</option>
            {businesses.map((b) => (
              <option key={b.licenseKey} value={b.licenseKey}>
                {b.businessName} ({b.licenseKey})
              </option>
            ))}
          </select>
        </div>

        {/* Contact Phone & Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono de Contacto</label>
            <input
              type="text"
              placeholder="0414-1234567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Prioridad</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta (Urgente)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Título del Problema / Solicitud *</label>
          <input
            type="text"
            required
            placeholder="Ej. Error al imprimir factura fiscal / Sincronización lenta"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Detallada</label>
          <textarea
            rows={3}
            placeholder="Detalles del problema, equipo afectado o pasos para reproducir el fallo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status & Assigned To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ABIERTO">🔴 Abierto (Pendiente)</option>
              <option value="EN_PROCESO">🟡 En Proceso</option>
              <option value="RESUELTO">🟢 Resuelto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Asignado a</label>
            <input
              type="text"
              placeholder="Ej. Soporte Técnico / Carlos"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Resolution Notes */}
        {status === 'RESUELTO' && (
          <div className="pt-2">
            <label className="block text-xs font-semibold text-emerald-400 mb-1">Notas de Solución</label>
            <textarea
              rows={2}
              placeholder="¿Cómo se solucionó el incidente?"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
          {ticket && onDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onDelete(ticket.id)}
              className="border-rose-500/30 hover:bg-rose-500/15 text-rose-400 text-xs py-2 px-3"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {contactPhone && (
            <Button
              type="button"
              variant="outline"
              onClick={handleWhatsAppHelp}
              className="flex-1 border-emerald-500/40 hover:bg-emerald-500/10 text-emerald-400 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Contactar por WhatsApp
            </Button>
          )}

          <Button
            type="submit"
            variant="primary"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-2"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando...' : 'Guardar Ticket'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
