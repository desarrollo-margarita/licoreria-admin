import React, { useState, useEffect } from 'react';
import { 
  Sliders, DollarSign, ShieldAlert, Cpu, 
  Save, RefreshCw, CheckCircle2
} from 'lucide-react';
import Button from '../../ui/Button';
import { fetchGlobalConfig, saveGlobalConfig } from '../../../lib/storageService';

export default function ControlGlobalTab({ onConfigSaved }) {
  const [bcvRate, setBcvRate] = useState('65.50');
  const [minPosVersion, setMinPosVersion] = useState('1.0.0');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('Sistema en mantenimiento preventivo. Volvemos en breve.');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  const loadConfig = async () => {
    setFetching(true);
    try {
      const cfg = await fetchGlobalConfig();
      if (cfg) {
        setBcvRate((cfg.bcvRate || 65.50).toString());
        setMinPosVersion(cfg.minPosVersion || '1.0.0');
        setMaintenanceMode(!!cfg.maintenanceMode);
        setMaintenanceMessage(cfg.maintenanceMessage || '');
      }
    } catch (err) {
      console.warn('Error loading global config:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    try {
      await saveGlobalConfig({
        bcvRate: parseFloat(bcvRate) || 65.50,
        minPosVersion,
        maintenanceMode,
        maintenanceMessage
      });

      setSuccessMsg('¡Parámetros globales actualizados y sincronizados en la red!');
      if (onConfigSaved) {
        onConfigSaved({ bcvRate: parseFloat(bcvRate) || 65.50, minPosVersion, maintenanceMode, maintenanceMessage });
      }
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Error guardando configuración');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Parámetros Globales & Control OTA</h3>
            <p className="text-xs text-slate-400">
              Control centralizado de tasas cambiarias, políticas de versiones y modo mantenimiento para todas las cajas POS.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadConfig}
          className="border-slate-700 hover:bg-slate-800 text-slate-300 text-xs flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetching ? 'animate-spin' : ''}`} />
          Recargar
        </Button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Centralized BCV Rate */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Sincronizador Central de Tasa BCV Oficial
            </span>
            <span className="text-xs text-slate-400">Bs. / USD</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tasa Oficial de Cambio (VES por 1 USD)</label>
              <div className="relative">
                <span className="text-slate-500 font-bold text-sm absolute left-3 top-2.5">Bs.</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={bcvRate}
                  onChange={(e) => setBcvRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-3 py-2.5 text-base font-bold font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-300">💡 Impacto en el Ecosistema:</p>
              <p className="text-slate-400 text-[11px]">
                Esta tasa se replica a todos los comercios activos. Si una caja no tiene conexión con la API del BCV, usará este valor como respaldo oficial.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Version Control (OTA) */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Requisitos de Versión de la Aplicación POS
            </span>
            <span className="text-xs text-slate-400">Control de Actualizaciones</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Versión Mínima Requerida</label>
              <input
                type="text"
                placeholder="1.0.0"
                value={minPosVersion}
                onChange={(e) => setMinPosVersion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-950/60 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-indigo-300">🔒 Control Forzado de Actualización:</p>
              <p className="text-slate-400 text-[11px]">
                Las cajas con una versión inferior a <span className="font-mono text-white font-bold">{minPosVersion}</span> recibirán un aviso para actualizar el software antes de operar.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Global Maintenance Mode */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Modo Mantenimiento Global & Broadcast
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${maintenanceMode ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-slate-800 text-slate-400'}`}>
              {maintenanceMode ? 'ACTIVO' : 'INACTIVO'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-white/5">
            <div>
              <p className="font-semibold text-white text-sm">Activar Modo Mantenimiento en la Red</p>
              <p className="text-xs text-slate-400">
                Pausa la sincronización remota y muestra el banner de mantenimiento en las cajas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-12 h-6.5 rounded-full transition-colors relative flex items-center p-0.5 ${
                maintenanceMode ? 'bg-rose-600' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  maintenanceMode ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {maintenanceMode && (
            <div>
              <label className="block text-xs font-semibold text-rose-400 mb-1">
                Mensaje de Alerta a Mostrar en Pantallas POS *
              </label>
              <textarea
                rows={2}
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                className="w-full bg-slate-950 border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Guardando Parámetros...' : 'Publicar y Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
