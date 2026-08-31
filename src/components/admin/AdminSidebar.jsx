import React from 'react';
import { 
  Store, DollarSign, Radio, Sliders, LifeBuoy, FileText, 
  ChevronLeft, ChevronRight, LogOut, ArrowLeft, Cloud, 
  ExternalLink, User
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onBackToLanding,
  onOpenConfig,
  onOpenClientPortal,
  onLogout,
  userRole = 'superadmin',
  userName = 'Administrador',
  connectionStatus = { ok: false },
  subscriptionsCount = 0,
  pendingPaymentsCount = 0,
  openTicketsCount = 0,
  hasPermission = () => true
}) {
  const navItems = [
    {
      id: 'businesses',
      label: 'Comercios & Licencias',
      icon: Store,
      badge: subscriptionsCount > 0 ? subscriptionsCount : null,
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      permission: 'view_businesses'
    },
    {
      id: 'finances',
      label: 'Finanzas & Cobranzas',
      icon: DollarSign,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} pend.` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse',
      permission: 'view_payments'
    },
    {
      id: 'telemetry',
      label: 'Radar & Cajas POS',
      icon: Radio,
      badge: 'Live',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      permission: 'view_telemetry'
    },
    {
      id: 'control',
      label: 'Control Global & OTA',
      icon: Sliders,
      permission: 'global_control'
    },
    {
      id: 'support',
      label: 'Mesa de Ayuda',
      icon: LifeBuoy,
      badge: openTicketsCount > 0 ? openTicketsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      permission: 'manage_tickets'
    },
    {
      id: 'audit',
      label: 'Bitácora de Auditoría',
      icon: FileText,
      permission: 'view_businesses'
    }
  ];

  const visibleNavItems = navItems.filter(item => hasPermission(item.permission));

  const roleColorMap = {
    superadmin: 'from-cyan-400 to-blue-500 text-slate-950',
    finanzas: 'from-emerald-400 to-teal-500 text-slate-950',
    soporte: 'from-purple-400 to-indigo-500 text-white'
  };

  const currentRoleBadge = roleColorMap[userRole] || 'from-slate-400 to-slate-500 text-slate-950';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950/95 border-r border-white/10 backdrop-blur-2xl transition-all duration-300 ease-in-out lg:static ${
          isCollapsed ? 'w-20' : 'w-68 xl:w-72'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Brand */}
        <div className="h-20 border-b border-white/10 px-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-600/30 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-md">
              <img src="/ventrox-logo.png" alt="VentroX" className="w-6 h-6 object-contain" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-base font-black text-white tracking-tight truncate flex items-center gap-1.5">
                  Ventro<span className="bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">X</span>
                </h2>
                <p className="text-[10px] text-cyan-300/80 font-mono uppercase font-bold tracking-wider">
                  SuperAdmin Hub
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-white items-center justify-center border border-white/10 transition-colors cursor-pointer shrink-0"
            title={isCollapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div className={`p-4 border-b border-white/10 shrink-0 ${isCollapsed ? 'px-2 text-center' : ''}`}>
          <div className={`rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-3 flex items-center gap-3 ${
            isCollapsed ? 'justify-center p-2' : ''
          }`}>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-black text-xs shrink-0 shadow-sm">
              <User className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{userName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] font-black px-2 py-0.2 rounded-full bg-gradient-to-r ${currentRoleBadge} uppercase`}>
                    {userRole}
                  </span>
                  <span className={`w-1.5 h-1.5 rounded-full ${connectionStatus.ok ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} title={connectionStatus.ok ? 'Nube conectada' : 'Local'} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Nav Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Módulos Principales
            </p>
          )}

          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  if (isMobileOpen) onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05] border border-transparent'
                } ${isCollapsed ? 'justify-center px-2 py-3' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-cyan-400' : 'text-slate-400'
                }`} />

                {!isCollapsed && (
                  <>
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Tools & Utilities */}
        <div className="p-3 border-t border-white/10 space-y-1.5 shrink-0 bg-slate-950/40">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Herramientas & Enlaces
            </p>
          )}

          {onOpenClientPortal && (
            <button
              type="button"
              onClick={() => {
                onOpenClientPortal();
                if (isMobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:bg-emerald-500/10 transition-colors border border-emerald-500/20 cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Portal de Pagos Express para Clientes"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span className="truncate text-left">Portal de Pagos</span>}
            </button>
          )}

          {onOpenConfig && (
            <button
              type="button"
              onClick={() => {
                onOpenConfig();
                if (isMobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.06] transition-colors border border-white/5 cursor-pointer ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
              title="Configurar Supabase Nube"
            >
              <Cloud className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
              {!isCollapsed && <span className="truncate text-left">Configurar BD</span>}
            </button>
          )}

          <button
            type="button"
            onClick={onBackToLanding}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Volver a la Web Comercial"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate text-left">Volver a la Web</span>}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/15 transition-colors border border-rose-500/20 cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Cerrar Sesión SuperAdmin"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            {!isCollapsed && <span className="truncate text-left">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
