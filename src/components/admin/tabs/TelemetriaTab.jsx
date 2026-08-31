import React, { useState, useEffect } from 'react';
import { 
  Radio, Laptop, Monitor, RefreshCw, 
  Search, Clock, XCircle
} from 'lucide-react';
import { fetchAllTelemetryDevices } from '../../../lib/storageService';
import Button from '../../ui/Button';

export default function TelemetriaTab({ subscriptions = [], onManageDevices }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'ONLINE' | 'RECENT' | 'OFFLINE'

  const loadTelemetry = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTelemetryDevices();
      setDevices(data);
    } catch (err) {
      console.warn('Error loading telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
    const interval = setInterval(loadTelemetry, 30000); // Polling cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const now = new Date();

  // Enlazar con el nombre de cada comercio
  const businessMap = {};
  subscriptions.forEach(s => {
    if (s.licenseKey) businessMap[s.licenseKey] = s;
  });

  const enrichedDevices = devices.map(d => {
    const biz = businessMap[d.licenseKey];
    const lastSeen = d.lastSeenAt ? new Date(d.lastSeenAt) : new Date(0);
    const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));

    let status = 'OFFLINE';
    if (diffMinutes <= 30) {
      status = 'ONLINE';
    } else if (diffMinutes <= 1440) { // 24 horas
      status = 'RECENT';
    }

    return {
      ...d,
      businessName: biz?.businessName || 'Comercio Desconocido',
      rifDoc: biz?.rifDoc || '',
      planType: biz?.planType || 'ANUAL',
      diffMinutes,
      status
    };
  });

  const onlineCount = enrichedDevices.filter(d => d.status === 'ONLINE').length;
  const recentCount = enrichedDevices.filter(d => d.status === 'RECENT').length;
  const offlineCount = enrichedDevices.filter(d => d.status === 'OFFLINE').length;

  const filteredDevices = enrichedDevices.filter(d => {
    const matchesSearch = 
      (d.businessName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.licenseKey || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.machineName || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.deviceId || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === 'ALL' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Cajas POS</span>
            <Laptop className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white mt-2">{devices.length}</p>
          <p className="text-xs text-slate-400 mt-1">Dispositivos vinculados</p>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online Ahora
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400 mt-2">{onlineCount}</p>
          <p className="text-xs text-slate-400 mt-1">Activas en los últimos 30 min</p>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Activas Hoy</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400 mt-2">{recentCount}</p>
          <p className="text-xs text-slate-400 mt-1">Última conexión &lt; 24h</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Inactivas / Offline</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-black font-mono text-slate-300 mt-2">{offlineCount}</p>
          <p className="text-xs text-slate-400 mt-1">&gt; 24h sin actividad</p>
        </div>
      </div>

      {/* Control Bar & Search */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Radar de Cajas y Telemetría en Vivo</h3>
              <p className="text-xs text-slate-400">Monitoreo en tiempo real del hardware y versiones de software POS.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={loadTelemetry}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por comercio, máquina, ID de hardware o licencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {['ALL', 'ONLINE', 'RECENT', 'OFFLINE'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status === 'ALL' ? 'Todos' : status === 'ONLINE' ? 'En Línea' : status === 'RECENT' ? 'Recientes' : 'Offline'}
              </button>
            ))}
          </div>
        </div>

        {/* Devices Table */}
        <div className="mt-4 overflow-x-auto">
          {filteredDevices.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Monitor className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No se encontraron dispositivos enlazados con ese criterio.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Comercio / Licencia</th>
                  <th className="py-3 px-3">Nombre de Equipo</th>
                  <th className="py-3 px-3">Sistema / SO</th>
                  <th className="py-3 px-3">Versión App</th>
                  <th className="py-3 px-3">Última Actividad</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDevices.map((d) => (
                  <tr key={`${d.licenseKey}-${d.deviceId}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      {d.status === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Online
                        </span>
                      ) : d.status === 'RECENT' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30">
                          Reciente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                          Offline
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-bold text-white">{d.businessName}</p>
                      <p className="text-[10px] font-mono text-slate-400">{d.licenseKey}</p>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-200">{d.machineName}</p>
                      <p className="text-[10px] font-mono text-slate-500 truncate max-w-[140px]" title={d.deviceId}>
                        ID: {d.deviceId}
                      </p>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {d.osInfo || 'Windows POS'}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                        v{d.appVersion || '1.0.0'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-400">
                      {d.lastSeenAt ? new Date(d.lastSeenAt).toLocaleString('es-VE') : 'Nunca'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {onManageDevices && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const b = businessMap[d.licenseKey];
                            if (b) onManageDevices(b);
                          }}
                          className="border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] py-1 px-2.5"
                        >
                          Gestionar
                        </Button>
                      )}
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
