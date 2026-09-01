import React, { useState, useEffect } from 'react';
import { 
  Plus, RefreshCw, AlertTriangle, Cloud, 
  Copy, Check, User, Lock, Eye, EyeOff,
  Menu, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getSupabaseClient, testSupabaseConnection, SUPABASE_SCHEMA_SQL } from '../../lib/supabaseClient';
import { 
  fetchAllBusinesses, extendBusinessLicense, toggleBusinessStatusInStorage, 
  exportBusinessesToCsv, fetchGlobalConfig, fetchSupportTickets,
  approvePendingPayment, rejectPendingPayment
} from '../../lib/storageService';
import { getDaysRemaining } from '../../lib/licenseUtils';

import AdminSidebar from './AdminSidebar';
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
import ReceiptModal from './ReceiptModal';
import FeatureFlagsModal from './FeatureFlagsModal';
import ClientPaymentPortalModal from './ClientPaymentPortalModal';

// Tabs
import FinanzasTab from './tabs/FinanzasTab';
import TelemetriaTab from './tabs/TelemetriaTab';
import ControlGlobalTab from './tabs/ControlGlobalTab';
import BasesDeDatosTab from './tabs/BasesDeDatosTab';
import SoporteTab from './tabs/SoporteTab';
import AuditoriaTab from './tabs/AuditoriaTab';

import Toast from '../ui/Toast';

export default function AdminDashboard({ onBackToLanding }) {
  const { isAuthenticated, userRole, userName, login, logout, hasPermission } = useAuth();
  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sidebar & Navigation
  const [activeTab, setActiveTab] = useState('businesses');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [subscriptions, setSubscriptions] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [globalConfig, setGlobalConfig] = useState({ bcvRate: 65.50, minPosVersion: '1.0.0' });
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ ok: false, checked: false, message: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Modals state
  const [isNewBusinessOpen, setIsNewBusinessOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isClientPortalOpen, setIsClientPortalOpen] = useState(false);
  const [selectedBusinessForPlan, setSelectedBusinessForPlan] = useState(null);
  const [selectedBusinessForEdit, setSelectedBusinessForEdit] = useState(null);
  const [selectedBusinessForPayment, setSelectedBusinessForPayment] = useState(null);
  const [selectedBusinessForHistory, setSelectedBusinessForHistory] = useState(null);
  const [selectedBusinessForWhatsApp, setSelectedBusinessForWhatsApp] = useState(null);
  const [selectedBusinessForDevices, setSelectedBusinessForDevices] = useState(null);
  const [selectedBusinessForFlags, setSelectedBusinessForFlags] = useState(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [selectedBusinessForReceipt, setSelectedBusinessForReceipt] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      checkAndFetch();

      // Suscripción Realtime a cambios en Supabase
      const supabase = getSupabaseClient();
      if (supabase) {
        const channel = supabase
          .channel('ventrox-admin-realtime')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
            checkAndFetch();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
            checkAndFetch();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
            checkAndFetch();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pos_devices' }, () => {
            checkAndFetch();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
            checkAndFetch();
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

    // Cargar Pagos
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: pays } = await supabase.from('payments').select('*').order('payment_date', { ascending: false });
        if (pays) setAllPayments(pays);
      } catch (e) {
        console.warn(e);
      }
    }

    // Cargar Config Global & Tickets
    try {
      const cfg = await fetchGlobalConfig();
      if (cfg) setGlobalConfig(cfg);
      const tickets = await fetchSupportTickets();
      if (tickets) setSupportTickets(tickets);
    } catch (e) {
      console.warn(e);
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

  const handleApprovePayment = async (paymentId, businessId, licenseKey) => {
    try {
      await approvePendingPayment(paymentId, businessId, licenseKey, 30);
      showToast('¡Pago aprobado y vigencia extendida +30 días!');
      checkAndFetch();
    } catch (err) {
      showToast('Error aprobando pago: ' + err.message);
    }
  };

  const handleRejectPayment = async (paymentId, licenseKey) => {
    const reason = window.prompt('Indica el motivo del rechazo (ej. Referencia bancaria no encontrada):');
    if (reason === null) return;
    try {
      await rejectPendingPayment(paymentId, licenseKey, reason);
      showToast('Pago marcado como rechazado.');
      checkAndFetch();
    } catch (err) {
      showToast('Error rechazando pago: ' + err.message);
    }
  };

  const handleOpenDigitalReceipt = (pay, biz) => {
    setSelectedPaymentForReceipt(pay);
    setSelectedBusinessForReceipt(biz);
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
              Ingresa con tus credenciales de administrador, finanzas o soporte técnico
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
                  placeholder="ej. admin / finanzas / soporte"
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

  const pendingPaymentsCount = allPayments.filter(p => p.status === 'PENDING_VERIFICATION').length;
  const openTicketsCount = supportTickets.filter(t => t.status === 'ABIERTO').length;

  const tabTitleMap = {
    businesses: 'Comercios & Licencias POS',
    finances: 'Centro de Finanzas & Cobranzas',
    telemetry: 'Radar & Telemetría de Cajas',
    control: 'Control Global & Parámetros OTA',
    database: 'Clústeres Supabase & Migrador Asistido',
    support: 'Mesa de Ayuda & Incidencias',
    audit: 'Bitácora de Auditoría'
  };

  return (
    <div className="min-h-screen w-full text-slate-100 flex bg-slate-950 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-10 left-1/3 w-[600px] h-[300px] bg-cyan-500/8 blur-[150px] rounded-full pointer-events-none" />

      {/* Modern Sidebar (Menú Lateral) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onBackToLanding={onBackToLanding}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenClientPortal={() => setIsClientPortalOpen(true)}
        onLogout={logout}
        userRole={userRole}
        userName={userName}
        connectionStatus={connectionStatus}
        subscriptionsCount={subscriptions.length}
        pendingPaymentsCount={pendingPaymentsCount}
        openTicketsCount={openTicketsCount}
        hasPermission={hasPermission}
      />

      {/* Main Content Area (Right Side) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top App Header */}
        <header className="bg-slate-950/80 border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-2xl shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/10"
              title="Abrir Menú Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {tabTitleMap[activeTab] || 'Panel de Administración'}
              </h1>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                Ecosistema VentroX · Gestión centralizada de licencias y operaciones
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={checkAndFetch}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refrescar</span>
            </button>

            {hasPermission('view_businesses') && (
              <button
                onClick={() => setIsNewBusinessOpen(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">NUEVO COMERCIO</span>
                <span className="sm:hidden">+Comercio</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-[1700px] w-full mx-auto">
          
          {/* Connection Notice Banner */}
          {connectionStatus.checked && !connectionStatus.ok && (
            <div className="p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xl animate-fadeIn">
              <div className="flex items-start gap-3.5">
                <Cloud className="w-5 h-5 text-cyan-400 shrink-0 mt-1" />
                <div className="space-y-1">
                  <div className="font-bold text-sm text-white">
                    Conexión a Supabase Nube Requerida
                  </div>
                  <p className="text-xs text-cyan-300/90 leading-relaxed max-w-3xl">
                    Para emitir licencias y gestionar las suscripciones de tus clientes en tiempo real, configura la <strong>URL</strong> y la <strong>Anon Key</strong> de tu proyecto Supabase.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
                <button
                  onClick={handleCopySql}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copiar SQL</span>
                </button>
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
                >
                  Configurar Supabase
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: COMERCIOS & LICENCIAS */}
          {activeTab === 'businesses' && (
            <div className="space-y-8 animate-fadeIn">
              <KpiHeader
                totalBusinesses={subscriptions.length}
                mrrTotal={mrrTotal}
                activeCount={activeCount}
                expiringCount={expiringCount}
                totalRevenueCollected={totalRevenue}
              />

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
                onOpenFeatureFlags={(biz) => setSelectedBusinessForFlags(biz)}
                onExportCsv={(list) => {
                  exportBusinessesToCsv(list);
                  showToast('¡Archivo CSV descargado con éxito!');
                }}
              />
            </div>
          )}

          {/* TAB 2: FINANZAS & COBRANZA */}
          {activeTab === 'finances' && (
            <div className="animate-fadeIn">
              <FinanzasTab
                subscriptions={subscriptions}
                payments={allPayments}
                onRecordPayment={(biz) => setSelectedBusinessForPayment(biz)}
                onWhatsApp={(biz) => setSelectedBusinessForWhatsApp(biz)}
                onApprovePayment={handleApprovePayment}
                onRejectPayment={handleRejectPayment}
                onOpenClientPortal={() => setIsClientPortalOpen(true)}
              />
            </div>
          )}

          {/* TAB 3: TELEMETRÍA & CAJAS POS */}
          {activeTab === 'telemetry' && (
            <div className="animate-fadeIn">
              <TelemetriaTab
                subscriptions={subscriptions}
                onManageDevices={(biz) => setSelectedBusinessForDevices(biz)}
              />
            </div>
          )}

          {/* TAB 4: CONTROL GLOBAL & OTA */}
          {activeTab === 'control' && (
            <div className="animate-fadeIn">
              <ControlGlobalTab
                onConfigSaved={(cfg) => {
                  setGlobalConfig(cfg);
                  showToast('Parámetros globales guardados.');
                }}
              />
            </div>
          )}

          {/* TAB 5: CLÚSTERES DE BASE DE DATOS & MIGRACIÓN */}
          {activeTab === 'database' && (
            <div className="animate-fadeIn">
              <BasesDeDatosTab
                businesses={subscriptions}
                onRefreshAll={checkAndFetch}
              />
            </div>
          )}

          {/* TAB 6: MESA DE AYUDA & SOPORTE */}
          {activeTab === 'support' && (
            <div className="animate-fadeIn">
              <SoporteTab businesses={subscriptions} />
            </div>
          )}

          {/* TAB 6: BITÁCORA DE AUDITORÍA */}
          {activeTab === 'audit' && (
            <div className="animate-fadeIn">
              <AuditoriaTab />
            </div>
          )}

        </main>
      </div>

      {/* Toast Notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      {/* MODALS */}
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

      <RecordPaymentModal
        isOpen={!!selectedBusinessForPayment}
        business={selectedBusinessForPayment}
        onClose={() => setSelectedBusinessForPayment(null)}
        onPaymentRecorded={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      <PaymentHistoryModal
        isOpen={!!selectedBusinessForHistory}
        business={selectedBusinessForHistory}
        onClose={() => setSelectedBusinessForHistory(null)}
        onOpenRecordPayment={(biz) => {
          setSelectedBusinessForPayment(biz);
        }}
        onOpenDigitalReceipt={handleOpenDigitalReceipt}
        onPaymentDeleted={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      <WhatsAppTemplateModal
        isOpen={!!selectedBusinessForWhatsApp}
        business={selectedBusinessForWhatsApp}
        onClose={() => setSelectedBusinessForWhatsApp(null)}
        onSent={(msg) => showToast(msg)}
      />

      <DeviceManagerModal
        isOpen={!!selectedBusinessForDevices}
        business={selectedBusinessForDevices}
        onClose={() => setSelectedBusinessForDevices(null)}
        onDevicesReset={(msg) => {
          showToast(msg);
          checkAndFetch();
        }}
      />

      <FeatureFlagsModal
        isOpen={!!selectedBusinessForFlags}
        business={selectedBusinessForFlags}
        onClose={() => setSelectedBusinessForFlags(null)}
        onSaved={() => {
          showToast('Configuración de módulos y aliado actualizada.');
          checkAndFetch();
        }}
      />

      <ReceiptModal
        isOpen={!!selectedPaymentForReceipt}
        payment={selectedPaymentForReceipt}
        business={selectedBusinessForReceipt}
        bcvRate={globalConfig.bcvRate}
        onClose={() => {
          setSelectedPaymentForReceipt(null);
          setSelectedBusinessForReceipt(null);
        }}
      />

      <ClientPaymentPortalModal
        isOpen={isClientPortalOpen}
        businesses={subscriptions}
        bcvRate={globalConfig.bcvRate}
        onClose={() => setIsClientPortalOpen(false)}
        onPaymentSubmitted={() => {
          showToast('Pago reportado exitosamente.');
          checkAndFetch();
        }}
      />
    </div>
  );
}
