import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowLeft, ShieldCheck, LogOut, RefreshCw, AlertTriangle, Cloud, CheckCircle2, Copy, Check,
  User, Lock, Eye, EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient, testSupabaseConnection, SUPABASE_SCHEMA_SQL } from '../../lib/supabaseClient';
import { 
  fetchAllBusinesses, extendBusinessLicense, toggleBusinessStatusInStorage, exportBusinessesToCsv 
} from '../../lib/storageService';
import { getDaysRemaining } from '../../lib/licenseUtils';
import KpiHeader from './KpiHeader';
import ClientGrid from './ClientGrid';
import NewBusinessModal from './NewBusinessModal';
import SupabaseConfigModal from './SupabaseConfigModal';
import ChangePlanModal from './ChangePlanModal';
import EditBusinessModal from './EditBusinessModal';
import RecordPaymentModal from './RecordPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import WhatsAppTemplateModal from './WhatsAppTemplateModal';
import DeviceManagerModal from './DeviceManagerModal';
import Toast from '../ui/Toast';

export default function AdminDashboard({ onBackToLanding }) {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ ok: false, checked: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const [isNewBusinessOpen, setIsNewBusinessOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedBusinessForPlan, setSelectedBusinessForPlan] = useState(null);
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState(null);
  const [selectedBusinessForPayment, setSelectedBusinessForPayment] = useState(null);
  const [selectedBusinessForHistory, setSelectedBusinessForHistory] = useState(null);
  const [selectedBusinessForWhatsApp, setSelectedBusinessForWhatsApp] = useState(null);
  const [selectedBusinessForDevices, setSelectedBusinessForDevices] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkAndFetch();

      // Suscripción Realtime en tiempo real a cambios en Supabase
      const supabase = getSupabaseClient();
      if (supabase) {
        const channel = supabase
          .channel('ventrox-admin-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
            fetchAllBusinesses().then(res => {
              setSubscriptions(res.data || []);
              if (res.totalRevenueCollected !== undefined) setTotalRevenue(res.totalRevenueCollected);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
            fetchAllBusinesses().then(res => {
              setSubscriptions(res.data || []);
              if (res.totalRevenueCollected !== undefined) setTotalRevenue(res.totalRevenueCollected);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
            fetchAllBusinesses().then(res => {
              setSubscriptions(res.data || []);
              if (res.totalRevenueCollected !== undefined) setTotalRevenue(res.totalRevenueCollected);
            });
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_devices' }, () => {
            fetchAllBusinesses().then(res => {
              setSubscriptions(res.data || []);
              if (res.totalRevenueCollected !== undefined) setTotalRevenue(res.totalRevenueCollected);
            });
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const res = login(usernameInput, passwordInput);
    if (!res.success) {
      setAuthError(res.error || 'Credenciales incorrectas');
    } else {
      setAuthError('');
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    showToast('¡Script SQL copiado al portapapeles!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const checkAndFetch = async () => {
    setLoading(true);
    const conn = await testSupabaseConnection();
    setConnectionStatus({ ok: conn.ok, checked: true, message: conn.message });

    const result = await fetchAllBusinesses();
    setSubscriptions(result.data || []);
    if (result.totalRevenueCollected !== undefined) {
      setTotalRevenue(result.totalRevenueCollected);
    }
    setLoading(false);
  };

  const extendDays = async (licenseKey, extraDays) => {
    try {
      await extendBusinessLicense(licenseKey, extraDays);
      showToast(`Licencia extendida +${extraDays} días con éxito.`);
      checkAndFetch();
    } catch (err) {
      showToast('Error al extender suscripción: ' + err.message);
    }
  };

  const toggleStatus = async (licenseKey, currentStatus) => {
    try {
      const newStatus = currentStatus === 'SUSPENDIDA' ? 'ACTIVA' : 'SUSPENDIDA';
      await toggleBusinessStatusInStorage(licenseKey, currentStatus);
      showToast(`Estado cambiado a ${newStatus}.`);
      checkAndFetch();
    } catch (err) {
      showToast('Error al cambiar estado: ' + err.message);
    }
  };

  const copyKey = (key) => {
    try {
      navigator.clipboard.writeText(key);
      showToast('Clave copiada: ' + key);
    } catch {
      showToast('Clave: ' + key);
    }
  };

  // Login Screen (Usuario y Contraseña)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative bg-gradient-to-b from-[#1a0f36]/90 to-[#0d061e]/95 border border-white/15 rounded-3xl backdrop-blur-xl max-w-md w-full p-8 sm:p-10 text-center space-y-6 shadow-2xl z-10">
          
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <img src="/ventrox-logo.png" alt="VentroX" className="w-full h-full object-contain drop-shadow-[0_12px_30px_rgba(0,210,255,0.3)]" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ventro<span className="bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">X</span> SuperAdmin
            </h2>
            <p className="text-xs text-slate-300 max-w-xs mx-auto leading-relaxed">
              Ingresa con tu usuario y contraseña de administrador para gestionar clientes y licencias
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            
            {/* Campo Usuario */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Usuario Administrador
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameInput}
                  onChange={e => {
                    setUsernameInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="ej. admin"
                  required
                  autoFocus
                  className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600 shadow-inner"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-purple-400" /> Contraseña / Clave
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-950/90 border border-white/15 rounded-2xl px-4 py-3 pr-11 text-xs sm:text-sm font-semibold text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all cursor-pointer flex-1"
                onClick={onBackToLanding}
              >
                <ArrowLeft className="w-4 h-4" /> Volver
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex-1"
              >
                <ShieldCheck className="w-4 h-4" /> INGRESAR
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  let mrrTotal = 0;
  let activeCount = 0;
  let expiringCount = 0;

  subscriptions.forEach(sub => {
    const days = getDaysRemaining(new Date(sub.expirationDate));
    const isValid = sub.status !== 'SUSPENDIDA' && days > 0;
    if (isValid) {
      activeCount++;
      mrrTotal += parseFloat(sub.monthlyFeeUsd || 0);
      if (days <= 7) expiringCount++;
    }
  });

  return (
    <div className="min-h-screen w-full text-slate-100 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[600px] h-[300px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none" />

      {/* Top Header - Full Width Luxury Bar */}
      <header className="bg-slate-950/85 border-b border-white/[0.08] px-6 sm:px-10 lg:px-14 xl:px-16 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToLanding}
            className="w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer shadow-sm"
            title="Volver a la Landing Page"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 hidden sm:flex items-center justify-center flex-shrink-0">
              <img src="/ventrox-logo.png" alt="VX" className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(0,210,255,0.2)]" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2.5">
                Ventro<span className="bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">X</span> SuperAdmin
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PORTAL SAAS
                </span>
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`w-2 h-2 rounded-full ${connectionStatus.ok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-[11px] text-slate-400 font-medium">
                  {connectionStatus.ok ? 'Supabase Nube Conectado' : 'Supabase No Conectado'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5">
          <button
            onClick={checkAndFetch}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15 hover:border-white/30 backdrop-blur-md transition-all cursor-pointer"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          <button
            onClick={() => setIsConfigOpen(true)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer ${
              connectionStatus.ok 
                ? 'bg-white/[0.07] hover:bg-white/[0.14] text-slate-200 hover:text-white border border-white/15' 
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 shadow-lg shadow-cyan-500/10'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Configurar Supabase</span>
          </button>

          <button
            onClick={() => setIsNewBusinessOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-black text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NUEVO COMERCIO</span>
          </button>

          <button
            onClick={logout}
            className="w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center transition-colors border border-red-500/20 cursor-pointer shadow-sm flex-shrink-0"
            title="Cerrar sesión SuperAdmin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Full-Width Content Area */}
      <main className="flex-1 w-full max-w-[1750px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-10 space-y-10 relative z-10">
        
        {/* Connection Notice Banner */}
        {connectionStatus.checked && !connectionStatus.ok && (
          <div className="p-6 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl animate-fadeIn">
            <div className="flex items-start gap-4">
              <Cloud className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div className="space-y-1.5">
                <div className="font-black text-base text-white">
                  Conexión a Supabase Nube Requerida
                </div>
                <p className="text-xs sm:text-sm text-cyan-300/90 leading-relaxed max-w-3xl">
                  Para emitir licencias y gestionar las suscripciones de tus clientes en tiempo real, configura la <strong>URL</strong> y la <strong>Anon Key</strong> de tu proyecto Supabase.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={handleCopySql}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
              >
                {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>Copiar SQL Schema</span>
              </button>
              <button
                onClick={() => setIsConfigOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-black text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                Configurar Supabase
              </button>
            </div>
          </div>
        )}

        {/* KPI Metrics Header */}
        <KpiHeader
          totalBusinesses={subscriptions.length}
          mrrTotal={mrrTotal}
          activeCount={activeCount}
          expiringCount={expiringCount}
          totalRevenueCollected={totalRevenue}
        />

        {/* Client Grid with Search & Filters */}
        <ClientGrid
          subscriptions={subscriptions}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExtendDays={extendDays}
          onToggleStatus={toggleStatus}
          onCopyKey={copyKey}
          onChangePlan={(biz) => setSelectedBusinessForPlan(biz)}
          onEditBusiness={(biz) => setSelectedBusinessForEdit(biz)}
          onOpenWhatsApp={(biz) => setSelectedBusinessForWhatsApp(biz)}
          onRecordPayment={(biz) => setSelectedBusinessForPayment(biz)}
          onOpenPaymentHistory={(biz) => setSelectedBusinessForHistory(biz)}
          onOpenDeviceManager={(biz) => setSelectedBusinessForDevices(biz)}
          onExportCsv={(list) => {
            exportBusinessesToCsv(list);
            showToast('¡Archivo CSV descargado con éxito!');
          }}
        />
      </main>

      {/* Toast Notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      {/* Modals */}
      <NewBusinessModal
        isOpen={isNewBusinessOpen}
        onClose={() => setIsNewBusinessOpen(false)}
        onCreated={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSaved={() => {
          showToast('Credenciales guardadas. Verificando conexión...');
          checkAndFetch();
        }}
      />

      <ChangePlanModal
        isOpen={!!selectedBusinessForPlan}
        business={selectedBusinessForPlan}
        onClose={() => setSelectedBusinessForPlan(null)}
        onPlanChanged={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      <EditBusinessModal
        isOpen={!!selectedBusinessForEdit}
        business={selectedBusinessForEdit}
        onClose={() => setSelectedBusinessForEdit(null)}
        onUpdated={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      {/* Modal para Registrar Pago */}
      <RecordPaymentModal
        isOpen={!!selectedBusinessForPayment}
        business={selectedBusinessForPayment}
        onClose={() => setSelectedBusinessForPayment(null)}
        onPaymentRecorded={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      {/* Modal de Historial de Pagos y Comprobante */}
      <PaymentHistoryModal
        isOpen={!!selectedBusinessForHistory}
        business={selectedBusinessForHistory}
        onClose={() => setSelectedBusinessForHistory(null)}
        onOpenRecordPayment={(biz) => {
          setSelectedBusinessForPayment(biz);
        }}
        onPaymentDeleted={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      {/* Modal de Plantillas WhatsApp */}
      <WhatsAppTemplateModal
        isOpen={!!selectedBusinessForWhatsApp}
        business={selectedBusinessForWhatsApp}
        onClose={() => setSelectedBusinessForWhatsApp(null)}
        onSent={(msg) => showToast(msg)}
      />

      {/* Modal de Gestión y Reset de Cajas / Terminales */}
      <DeviceManagerModal
        isOpen={!!selectedBusinessForDevices}
        business={selectedBusinessForDevices}
        onClose={() => setSelectedBusinessForDevices(null)}
        onDevicesReset={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />
    </div>
  );
}
