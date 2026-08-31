import React, { useState } from 'react';
import { 
  Cloud, Save, CheckCircle2, AlertTriangle, Copy, Check, 
  ExternalLink, RefreshCw, Database, KeyRound, Link2, Sparkles, ShieldCheck
} from 'lucide-react';
import Modal from '../ui/Modal';
import { 
  getStoredCredentials, saveCredentials, testSupabaseConnection, SUPABASE_SCHEMA_SQL,
  cleanSupabaseUrl, cleanSupabaseKey
} from '../../lib/supabaseClient';

export default function SupabaseConfigModal({ isOpen, onClose, onSaved }) {
  const stored = getStoredCredentials();
  const [url, setUrl] = useState(stored.url);
  const [key, setKey] = useState(stored.key);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleUrlChange = (e) => {
    const raw = e.target.value;
    // Si pega una URL completa de dashboard de Supabase o con /rest/v1, autolimpiar
    if (raw.includes('supabase.com/dashboard/project/') || raw.includes('/rest/v1')) {
      setUrl(cleanSupabaseUrl(raw));
    } else {
      setUrl(raw);
    }
    setTestResult(null);
  };

  const handleTest = async () => {
    const cleanedUrl = cleanSupabaseUrl(url);
    const cleanedKey = cleanSupabaseKey(key);
    if (!cleanedUrl || !cleanedKey) return;
    
    setUrl(cleanedUrl);
    setKey(cleanedKey);
    setTesting(true);
    setTestResult(null);
    const res = await testSupabaseConnection(cleanedUrl, cleanedKey);
    setTestResult(res);
    setTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedUrl = cleanSupabaseUrl(url);
    const cleanedKey = cleanSupabaseKey(key);
    saveCredentials(cleanedUrl, cleanedKey);
    onSaved();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Conexión Nube Supabase"
      subtitle="Sincroniza tus comercios, licencias y suscripciones en tiempo real"
      icon={Database}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: SQL Schema Initializer Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-slate-950/60 to-cyan-900/20 border border-purple-500/25 relative overflow-hidden shadow-inner">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-[11px] font-black flex items-center justify-center border border-purple-500/40">
                  1
                </span>
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Inicializar Tablas en Supabase
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Copia y ejecuta el script en el <strong>SQL Editor</strong> de Supabase para crear las tablas y permisos automáticos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySql}
              className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all flex-shrink-0 shadow-lg shadow-purple-500/10 hover:scale-105 active:scale-95"
            >
              {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-purple-300" />}
              <span>{copiedSql ? '¡SQL Copiado!' : 'Copiar Script SQL'}</span>
            </button>
          </div>
        </div>

        {/* Step 2: Credentials Inputs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[11px] font-black flex items-center justify-center border border-cyan-500/40">
                2
              </span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Ingresa tus Credenciales de API
              </span>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold transition-colors"
            >
              Abrir Dashboard de Supabase <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Project URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-cyan-400" /> URL del Proyecto (Project URL)
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                onBlur={() => setUrl(cleanSupabaseUrl(url))}
                placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                required
                className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-3 text-xs text-cyan-300 placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono transition-all shadow-inner"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Formato: <code>https://&lt;id-proyecto&gt;.supabase.co</code> (se autolimpieza si pegas la URL del dashboard).
            </p>
          </div>

          {/* Anon Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-400" /> Anon Public Key (API Key Pública)
            </label>
            <textarea
              rows={3}
              value={key}
              onChange={e => {
                setKey(e.target.value);
                setTestResult(null);
              }}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              className="w-full bg-[#0a0418] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 font-mono text-[11px] leading-relaxed transition-all shadow-inner resize-none"
            />
            <p className="text-[10px] text-slate-500">
              Clave pública anónima bajo <em>Project API Keys → anon / public</em>.
            </p>
          </div>
        </div>

        {/* Step 3: Test Connection & Feedback */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !url || !key}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Comprobando conexión...' : '⚡ Probar Conexión en Vivo'}</span>
            </button>

            {testResult && testResult.ok && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4" /> Conectado y Verificado
              </span>
            )}
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-2xl border text-xs flex items-start gap-3 animate-fadeIn shadow-lg ${
                testResult.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {testResult.ok ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1.5">
                <div className="font-bold text-sm text-white">
                  {testResult.ok ? '¡Conexión Verificada Exitosamente!' : 'No se pudo conectar a Supabase'}
                </div>
                <div className="text-xs leading-relaxed opacity-90">{testResult.message}</div>
                {testResult.tableMissing && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md"
                    >
                      Copiar Script SQL de Tablas
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-xl shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar y Sincronizar</span>
          </button>
        </div>

      </form>
    </Modal>
  );
}
