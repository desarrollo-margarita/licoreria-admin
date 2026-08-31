import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, Plus, Search, CheckCircle2, Clock, 
  AlertTriangle, RefreshCw, Send
} from 'lucide-react';
import Button from '../../ui/Button';
import { fetchSupportTickets, createSupportTicket, updateSupportTicketStatus, deleteSupportTicket } from '../../../lib/storageService';
import SupportTicketModal from '../SupportTicketModal';

export default function SoporteTab({ businesses = [] }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ABIERTO' | 'EN_PROCESO' | 'RESUELTO'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
    } catch (err) {
      console.warn('Error loading support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleCreateNew = () => {
    setSelectedTicket(null);
    setIsModalOpen(true);
  };

  const handleEditTicket = (t) => {
    setSelectedTicket(t);
    setIsModalOpen(true);
  };

  const handleSaveTicket = async (ticketData) => {
    if (ticketData.id) {
      await updateSupportTicketStatus(ticketData.id, {
        status: ticketData.status,
        resolutionNotes: ticketData.resolutionNotes,
        assignedTo: ticketData.assignedTo
      });
    } else {
      await createSupportTicket(ticketData);
    }
    loadTickets();
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('¿Seguro que deseas eliminar este ticket?')) {
      await deleteSupportTicket(id);
      loadTickets();
    }
  };

  const handleWhatsAppChat = (ticket, e) => {
    e.stopPropagation();
    const rawPhone = ticket.contactPhone ? ticket.contactPhone.replace(/[^0-9]/g, '') : '';
    const phoneParam = rawPhone ? `phone=${rawPhone}&` : '';
    const message = `👋 *Hola ${ticket.businessName}*\n` +
      `Te escribe Soporte Técnico VentroX respecto a tu ticket: *"${ticket.title}"*.\n` +
      `¿Cómo podemos ayudarte en este momento?`;
    window.open(`https://api.whatsapp.com/send?${phoneParam}text=${encodeURIComponent(message)}`, '_blank');
  };

  const openCount = tickets.filter(t => t.status === 'ABIERTO').length;
  const inProgressCount = tickets.filter(t => t.status === 'EN_PROCESO').length;
  const resolvedCount = tickets.filter(t => t.status === 'RESUELTO').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.licenseKey || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-rose-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Tickets Abiertos</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-400 mt-2">{openCount}</p>
          <p className="text-xs text-slate-400 mt-1">Requieren atención inmediata</p>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">En Proceso</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400 mt-2">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-1">En revisión por soporte</p>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Resueltos</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-2">{resolvedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Incidencias solucionadas</p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Mesa de Ayuda & Tickets de Soporte</h3>
              <p className="text-xs text-slate-400">Canal centralizado de atención técnica e incidencias de comercios.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadTickets}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo Ticket
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por título, comercio, licencia o descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'ABIERTO', label: 'Abiertos' },
              { id: 'EN_PROCESO', label: 'En Proceso' },
              { id: 'RESUELTO', label: 'Resueltos' }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === st.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div className="mt-4 space-y-3">
          {filteredTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <LifeBuoy className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No hay tickets registrados con este filtro.</p>
            </div>
          ) : (
            filteredTickets.map((t) => {
              const isResolved = t.status === 'RESUELTO';
              const isOpen = t.status === 'ABIERTO';
              const isUrgent = t.priority === 'ALTA';

              return (
                <div
                  key={t.id}
                  onClick={() => handleEditTicket(t)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isOpen 
                      ? 'bg-slate-950/70 border-rose-500/30 hover:border-rose-500/60' 
                      : isResolved 
                      ? 'bg-slate-950/40 border-white/5 opacity-75 hover:opacity-100' 
                      : 'bg-slate-950/70 border-amber-500/30 hover:border-amber-500/60'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isOpen 
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' 
                          : isResolved 
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}>
                        {t.status}
                      </span>

                      {isUrgent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                          URGENTE
                        </span>
                      )}

                      <h4 className="font-bold text-white text-sm truncate">{t.title}</h4>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1">
                      {t.description || 'Sin descripción adicional'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                      <span>🏢 {t.businessName}</span>
                      <span>🔑 {t.licenseKey}</span>
                      <span>📅 {new Date(t.createdAt).toLocaleDateString('es-VE')}</span>
                      <span>👤 {t.assignedTo}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {t.contactPhone && (
                      <button
                        onClick={(e) => handleWhatsAppChat(t, e)}
                        className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Atender por WhatsApp"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTicket(t)}
                      className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs py-1.5 px-3"
                    >
                      Ver / Atender
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Ticket Modal */}
      <SupportTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ticket={selectedTicket}
        businesses={businesses}
        onSave={handleSaveTicket}
        onDelete={handleDeleteTicket}
      />
    </div>
  );
}
