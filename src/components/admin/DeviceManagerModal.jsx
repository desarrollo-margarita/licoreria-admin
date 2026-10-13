import React, { useState, useEffect } from 'react';
import { X, Monitor, RefreshCw, ShieldAlert, CheckCircle2, AlertTriangle, Laptop, Trash2, Clock, Check } from 'lucide-react';
import { resetBusinessDevices, fetchDevicesForLicense, deleteSingleDevice } from '../../lib/storageService';

export default function DeviceManagerModal({ isOpen, business, onClose, onDevicesReset }) {
  const [loading, setLoading] = useState(false);
  const [deviceList, setDeviceList] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadDevices = async () => {
    if (!business?.licenseKey) return;
    setLoadingDevices(true);
    try {
      const data = await fetchDevicesForLicense(business.licenseKey);
      setDeviceList(data);
    } catch (err) {
      console.warn('Error loading devices:', err);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (isOpen && business) {
      loadDevices();
    }
  }, [isOpen, business]);

  if (!isOpen || !business) return null;

  const maxBoxes = parseInt(business.maxBoxes) || 1;
  const connectedCount = deviceList.length > 0 ? deviceList.length : (business.connectedDevices || 0);
  const availableSlots = Math.max(0, maxBoxes - connectedCount);

  const handleResetAll = async () => {
    if (!window.confirm(`¿Estás seguro de liberar todas las cajas de "${business.businessName}"? Esto desconectará todas las computadoras vinculadas para que puedan volver a registrarse.`)) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await resetBusinessDevices(business.licenseKey);
      setSuccessMsg('¡Todas las cajas han sido liberadas exitosamente!');
      setDeviceList([]);
      if (onDevicesReset) {
        onDevicesReset(`Cajas liberadas para "${business.businessName}".`);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al resetear dispositivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSingle = async (deviceId, machineName) => {
    if (!window.confirm(`¿Liberar únicamente la caja "${machineName || deviceId}"?`)) {
      return;
    }

    setDeletingId(deviceId);
    setError(null);

    try {
      await deleteSingleDevice(business.licenseKey, deviceId);
      setDeviceList(prev => prev.filter(d => d.device_id !== deviceId));
      setSuccessMsg(`Caja "${machineName || deviceId}" liberada.`);
      if (onDevicesReset) {
        onDevicesReset(`Caja liberada para "${business.businessName}".`);
      }
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Error al eliminar caja');
    } finally {
      setDeletingId(null);
    }
  };

  const formatLastSeen = (isoStr) => {
    if (!isoStr) return 'Nunca';
    const date = new Date(isoStr);
    const diffMin = Math.floor((new Date() - date) / (1000 * 60));
    if (diffMin < 2) return '🟢 Conectada ahora';
    if (diffMin < 60) return `🟢 Hace ${diffMin} min`;
    if (diffMin < 1440) return `🟡 Hace ${Math.floor(diffMin / 60)}h`;
    return `⚪ Hace ${Math.floor(diffMin / 1440)} días`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-xl bg-gradient-to-b from-[#1a0f36] to-[#0d061e] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Control de Cajas y Terminales
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                {business.businessName} · <span className="font-mono text-cyan-300">{business.licenseKey}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Status Cards - Claros y sin ambigüedad */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta 1: Cupo Total Contratado */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cupo Autorizado
            </span>
            <p className="text-3xl font-black text-white font-mono">
              {maxBoxes} {maxBoxes === 1 ? 'Caja' : 'Cajas'}
            </p>
            <p className="text-[10px] text-cyan-400 font-semibold">
              Según Plan {business.planType || 'ANUAL'}
            </p>
          </div>

          {/* Tarjeta 2: Cajas En Uso y Disponibilidad */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-center space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              En Uso Actualmente
            </span>
            <p className="text-3xl font-black text-cyan-400 font-mono">
              {connectedCount} <span className="text-sm font-semibold text-slate-400">de {maxBoxes}</span>
            </p>
            <p className={`text-[11px] font-bold ${
              availableSlots > 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {availableSlots > 0 
                ? `🟢 Queda ${availableSlots} ${availableSlots === 1 ? 'caja libre' : 'cajas libres'}`
                : '🔴 Cupo lleno (0 cajas disponibles)'
              }
            </p>
          </div>
        </div>

        {/* Lista de Cajas Conectadas */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Laptop className="w-4 h-4 text-cyan-400" />
              Terminales Registrados ({deviceList.length})
            </span>
            <button
              onClick={loadDevices}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loadingDevices ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>

          {loadingDevices ? (
            <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 text-center text-xs text-slate-400">
              Cargando terminales vinculados...
            </div>
          ) : deviceList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/5 text-center space-y-1">
              <p className="text-xs font-semibold text-slate-300">No hay computadoras registradas todavía</p>
              <p className="text-[11px] text-slate-500">
                La primera PC que abra VentroX POS se vinculará automáticamente.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {deviceList.map((dev) => (
                <div
                  key={dev.id || dev.device_id}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-3 hover:border-cyan-500/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {dev.machine_name || 'Caja Registradora'}
                        <span className="ml-2 font-mono text-[10px] text-cyan-300/80 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          {dev.device_id}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{dev.os_info || 'Windows POS'}</span>
                        <span>•</span>
                        <span>v{dev.app_version || '1.0.0'}</span>
                        <span>•</span>
                        <span>{formatLastSeen(dev.last_seen_at)}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(dev.device_id, dev.machine_name)}
                    disabled={deletingId === dev.device_id}
                    title="Desvincular solo esta caja"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {deletingId === dev.device_id ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200/90 leading-relaxed space-y-2">
          <div className="font-bold flex items-center gap-2 text-cyan-300">
            <ShieldAlert className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>¿Cuándo usar la liberación de cajas?</span>
          </div>
          <p className="text-slate-300">
            Si el cliente <strong>cambió de computadora</strong>, formateó el equipo o necesita reasignar una caja vieja a una nueva, puedes eliminar la caja individual arriba con el icono de papelera o usar el botón de abajo para liberar todas a la vez.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-300 hover:text-white border border-white/15 transition-all cursor-pointer flex-1"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            disabled={loading}
            className="px-6 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer flex-[2] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>LIBERAR TODAS LAS CAJAS</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
