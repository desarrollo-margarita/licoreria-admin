import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, RefreshCw, 
  User, FileText
} from 'lucide-react';
import Button from '../../ui/Button';
import { fetchAuditLogs } from '../../../lib/storageService';

export default function AuditoriaTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(150);
      setLogs(data);
    } catch (err) {
      console.warn('Error loading audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    return (
      (l.userName || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.actionType || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.targetBusiness || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Container */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Bitácora de Auditoría & Trazabilidad Inmutable</h3>
              <p className="text-xs text-slate-400">
                Historial cronológico de cambios de suscripción, cobros, licencias y configuraciones.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadLogs}
            className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Logs
          </Button>
        </div>

        {/* Search */}
        <div className="relative pt-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-5" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción (PAGO, LICENCIA, MODULOS), comercio o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Logs Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No se encontraron registros de auditoría.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Fecha & Hora</th>
                  <th className="py-3 px-3">Operador</th>
                  <th className="py-3 px-3">Rol</th>
                  <th className="py-3 px-3">Tipo de Acción</th>
                  <th className="py-3 px-3">Comercio Afectado</th>
                  <th className="py-3 px-3">Detalle / Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.map((l, i) => (
                  <tr key={l.id || i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString('es-VE')}
                    </td>

                    <td className="py-3 px-3 font-semibold text-white">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {l.userName || 'Admin'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase border border-white/5">
                        {l.userRole || 'superadmin'}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        {l.actionType}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-indigo-300">
                      {l.targetBusiness || '—'}
                    </td>

                    <td className="py-3 px-3 text-slate-200">
                      {l.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
