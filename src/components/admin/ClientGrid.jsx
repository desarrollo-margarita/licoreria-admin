import React, { useState } from 'react';
import { 
  Store, Copy, MessageCircle, Play, Pause, Search, Calendar, Sparkles, 
  Edit3, LayoutList, LayoutGrid, Monitor, Check, 
  DollarSign, Receipt, Download, Sliders, Database
} from 'lucide-react';
import Badge from '../ui/Badge';
import { formatDate, getDaysRemaining } from '../../lib/licenseUtils';
import { exportBusinessesToCsv } from '../../lib/storageService';
import { getAllNodes } from '../../lib/supabaseClient';

export default function ClientGrid({
  subscriptions = [],
  loading = false,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onExtendDays,
  onToggleStatus,
  onCopyKey,
  onChangePlan,
  onEditBusiness,
  onOpenWhatsApp,
  onRecordPayment,
  onOpenPaymentHistory,
  onOpenDeviceManager,
  onOpenFeatureFlags,
  onExportCsv
}) {
  const [viewMode, setViewMode] = useState('list');
  const [copiedKey, setCopiedKey] = useState(null);
  const [clusterFilter, setClusterFilter] = useState('ALL');

  const nodes = getAllNodes();

  const handleCopy = (key) => {
    onCopyKey(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const planLabelMap = {
    'TRIENAL': 'Trienal Multi-Caja (3 Años)',
    'ANUAL': 'Anual Pro ($80/año)',
    'MENSUAL': 'Emprendedor ($50/año)',
    'DEMO': 'Prueba Demo (15 Días)'
  };

  const planShortLabelMap = {
    'TRIENAL': 'Trienal (3 Años)',
    'ANUAL': 'Anual Pro',
    'MENSUAL': 'Emprendedor',
    'DEMO': 'Demo'
  };

  const filteredSubs = subscriptions.filter(sub => {
    const days = getDaysRemaining(new Date(sub.expirationDate));
    const isSuspended = sub.status === 'SUSPENDIDA';
    const isExpired = days <= 0;
    const isExpiring = days <= 7 && days > 0 && !isSuspended;

    if (statusFilter === 'ACTIVE' && (isSuspended || isExpired || isExpiring)) return false;
    if (statusFilter === 'EXPIRING' && !isExpiring) return false;
    if (statusFilter === 'SUSPENDED' && !isSuspended && !isExpired) return false;

    // Filtro por Clúster / Nodo
    if (clusterFilter !== 'ALL') {
      const subNode = sub.nodeId || 'node-default';
      if (subNode !== clusterFilter) return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (sub.businessName || '').toLowerCase().includes(q);
      const matchRif = (sub.rifDoc || '').toLowerCase().includes(q);
      const matchPhone = (sub.phone || '').includes(q);
      const matchKey = (sub.licenseKey || '').toLowerCase().includes(q);
      const matchContact = (sub.contactPerson || '').toLowerCase().includes(q);
      const matchPlan = (sub.planType || '').toLowerCase().includes(q);
      const matchNode = (sub.nodeId || '').toLowerCase().includes(q);
      return matchName || matchRif || matchPhone || matchKey || matchContact || matchPlan || matchNode;
    }
    return true;
  });

  const handleExport = () => {
    try {
      if (onExportCsv) {
        onExportCsv(filteredSubs);
      } else {
        exportBusinessesToCsv(filteredSubs);
      }
    } catch (err) {
      alert(err.message || 'Error al exportar datos');
    }
  };

  return (
    <div className="space-y-6 w-full animate-fadeIn">
      
      {/* Search, Filters & Action Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between shadow-2xl backdrop-blur-xl">
        
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[280px] flex items-center">
          <div className="absolute left-4.5 flex items-center justify-center pointer-events-none text-cyan-400 z-10">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por Nombre de Comercio, RIF, Teléfono, Contacto o Clave..."
            className="w-full h-12 bg-slate-950/90 border border-white/15 rounded-2xl pl-12 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium shadow-inner"
          />
        </div>

        {/* Filter Pills, CSV Export & View Toggle Group */}
        <div className="flex items-center gap-3 justify-between sm:justify-end flex-wrap">
          
          {/* Status Filters */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-white/10 text-xs overflow-x-auto">
            <button
              onClick={() => onStatusFilterChange('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos ({subscriptions.length})
            </button>
            <button
              onClick={() => onStatusFilterChange('ACTIVE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => onStatusFilterChange('EXPIRING')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'EXPIRING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Por Vencer
            </button>
            <button
              onClick={() => onStatusFilterChange('SUSPENDED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'SUSPENDED' ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suspendidos
            </button>
          </div>

          {/* Cluster / Node Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 px-3 py-1.5 rounded-2xl border border-white/10 text-xs">
            <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              value={clusterFilter}
              onChange={e => setClusterFilter(e.target.value)}
              className="bg-transparent text-slate-300 hover:text-white text-xs font-bold outline-none cursor-pointer pr-1"
              title="Filtrar comercios por Clúster / Base de Datos"
            >
              <option value="ALL" className="bg-slate-900 text-white">Todos los Clústeres</option>
              {nodes.map(n => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white font-mono">
                  {n.id === 'node-demos' ? '🟣 ' : '🟢 '}{n.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredSubs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Descargar base de datos filtrada en formato CSV para Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Exportar CSV</span>
          </button>

          {/* View Mode Toggle: List / Grid */}
          <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-2xl border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              title="Vista de Lista / Tabla Compacta"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lista</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              title="Vista de Cuadrícula / Tarjetas"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tarjetas</span>
            </button>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-28 bg-gradient-to-b from-[#1a0f36]/80 to-[#0d061e]/90 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-4">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 text-sm font-semibold">Cargando comercios y suscripciones desde Supabase...</p>
        </div>
      ) : filteredSubs.length === 0 ? (
        /* Empty State */
        <div className="text-center py-24 bg-gradient-to-b from-[#1a0f36]/80 to-[#0d061e]/90 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mx-auto text-slate-500">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No se encontraron comercios</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchQuery 
              ? 'No hay registros que coincidan con el término de búsqueda ingresado.' 
              : 'Aún no has registrado ningún cliente. Haz clic en "NUEVO COMERCIO" en la barra superior para registrar el primero.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ========================================================================= */
        /* COMPACT SAAS LUXURY TABLE / LIST VIEW                                     */
        /* ========================================================================= */
        <div className="bg-gradient-to-b from-[#1a0f36]/90 to-[#0d061e]/95 border border-white/10 rounded-3xl backdrop-blur-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-slate-950/70 text-[11px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Comercio / Cliente</th>
                  <th className="py-4 px-4">RIF & Clave Licencia</th>
                  <th className="py-4 px-4">Plan & Cajas</th>
                  <th className="py-4 px-4">Cobranzas & LTV</th>
                  <th className="py-4 px-4">Estado & Vencimiento</th>
                  <th className="py-4 px-6 text-right">Acciones Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filteredSubs.map(sub => {
                  const daysLeft = getDaysRemaining(new Date(sub.expirationDate));
                  const isSuspended = sub.status === 'SUSPENDIDA';
                  const isExpired = daysLeft <= 0;
                  const isExpiring = daysLeft <= 7 && daysLeft > 0 && !isSuspended;

                  let badgeVariant = 'emerald';
                  let badgeLabel = 'ACTIVA';

                  if (isSuspended) {
                    badgeVariant = 'red';
                    badgeLabel = 'SUSPENDIDA';
                  } else if (isExpired) {
                    badgeVariant = 'red';
                    badgeLabel = 'VENCIDA';
                  } else if (isExpiring) {
                    badgeVariant = 'amber';
                    badgeLabel = `POR VENCER (${daysLeft}d)`;
                  }

                  const boxCount = parseInt(sub.maxBoxes) || 1;
                  const isCopied = copiedKey === sub.licenseKey;
                  const ltv = parseFloat(sub.ltvUsd || 0);

                  return (
                    <tr 
                      key={sub.id} 
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Business Name & Contact */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            <Store className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-white text-sm truncate max-w-[200px]" title={sub.businessName}>
                              {sub.businessName}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              {sub.contactPerson ? (
                                <span className="truncate max-w-[130px] font-medium">{sub.contactPerson}</span>
                              ) : (
                                <span className="italic text-slate-600">Sin contacto</span>
                              )}
                              {sub.phone && (
                                <span className="font-mono text-slate-400">· {sub.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* RIF & License Key */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-300 text-xs">
                              {sub.rifDoc}
                            </span>
                            {sub.nodeId && sub.nodeId !== 'node-default' && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold border border-purple-500/30" title={`Asignado al nodo: ${sub.nodeId}`}>
                                {sub.nodeId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-cyan-300/90 select-all font-semibold">
                              {sub.licenseKey}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(sub.licenseKey)}
                              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                              title="Copiar Clave de Licencia"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Authorized Boxes */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">
                              {planShortLabelMap[sub.planType] || sub.planType}
                            </span>
                            <button
                              type="button"
                              onClick={() => onChangePlan && onChangePlan(sub)}
                              className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
                              title="Cambiar Plan Comercial"
                            >
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>Plan</span>
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenDeviceManager && onOpenDeviceManager(sub)}
                            className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Gestionar terminales y resetear cajas"
                          >
                            <Monitor className="w-3 h-3 text-cyan-400" />
                            <span>{boxCount} {boxCount === 1 ? 'Caja' : 'Cajas'}</span>
                            <span className="text-[10px] text-slate-500 underline font-semibold">(Reset)</span>
                          </button>
                        </div>
                      </td>

                      {/* Fee USD & LTV Payments */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-emerald-400 text-sm">
                              ${parseFloat(sub.monthlyFeeUsd || 0).toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase font-semibold">
                              {sub.planType === 'MENSUAL' ? '/ Mes' : '/ Lic.'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenPaymentHistory && onOpenPaymentHistory(sub)}
                            className="flex items-center gap-1 text-[11px] font-mono font-bold text-teal-300 hover:text-teal-200 bg-teal-500/10 hover:bg-teal-500/20 px-2 py-0.5 rounded-lg border border-teal-500/20 transition-all cursor-pointer"
                            title="Ver historial de cobros y comprobantes"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>LTV: ${ltv.toFixed(0)}</span>
                          </button>
                        </div>
                      </td>

                      {/* Status & Expiration */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <Badge variant={badgeVariant} dot={badgeVariant === 'emerald'}>
                            {badgeLabel}
                          </Badge>
                          <div className={`text-[11px] flex items-center gap-1 font-medium ${isExpiring ? 'text-amber-400 font-bold' : isExpired || isSuspended ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(new Date(sub.expirationDate))}</span>
                          </div>
                        </div>
                      </td>

                      {/* Row Action Buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          
                          {/* WhatsApp Template Selector Button */}
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp && onOpenWhatsApp(sub)}
                            className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                            title="Centro de mensajería y plantillas WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden xl:inline">WhatsApp</span>
                          </button>

                          {/* Record Payment Button */}
                          <button
                            type="button"
                            onClick={() => onRecordPayment && onRecordPayment(sub)}
                            className="px-2.5 py-1.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 transition-all cursor-pointer"
                            title="Registrar cobro recibido"
                          >
                            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="hidden 2xl:inline">+Cobro</span>
                          </button>

                          {/* +30 Days Extend Button */}
                          <button
                            type="button"
                            onClick={() => onExtendDays(sub.licenseKey, 30)}
                            className="px-2 py-1.5 rounded-xl font-bold text-xs bg-white/[0.05] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
                            title="Extender 30 días adicionales"
                          >
                            +30d
                          </button>

                          {/* +1 Year Extend Button */}
                          <button
                            type="button"
                            onClick={() => onExtendDays(sub.licenseKey, 365)}
                            className="px-2 py-1.5 rounded-xl font-bold text-xs bg-white/[0.05] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer"
                            title="Extender 1 año (365 días)"
                          >
                            +1a
                          </button>

                          {/* Toggle Status (Active / Suspended) */}
                          <button
                            type="button"
                            onClick={() => onToggleStatus(sub.licenseKey, sub.status)}
                            className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                              isSuspended 
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                            }`}
                            title={isSuspended ? 'Reactivar Licencia' : 'Suspender Licencia'}
                          >
                            {isSuspended ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                          </button>

                          {/* Feature Flags / Modules Button */}
                          <button
                            type="button"
                            onClick={() => onOpenFeatureFlags && onOpenFeatureFlags(sub)}
                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
                            title="Gestionar módulos y aliado comercial"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Business Button */}
                          <button
                            type="button"
                            onClick={() => onEditBusiness && onEditBusiness(sub)}
                            className="p-2 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
                            title="Editar datos del comercio"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="py-3.5 px-6 border-t border-white/[0.08] bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
            <div>
              Mostrando <span className="text-white font-bold">{filteredSubs.length}</span> de <span className="text-white font-bold">{subscriptions.length}</span> comercios
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span>Sincronizado en vivo con Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* GRID / CARDS VIEW (ALTERNATIVE VIEW)                                      */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {filteredSubs.map(sub => {
            const daysLeft = getDaysRemaining(new Date(sub.expirationDate));
            const isSuspended = sub.status === 'SUSPENDIDA';
            const isExpired = daysLeft <= 0;
            const isExpiring = daysLeft <= 7 && daysLeft > 0 && !isSuspended;

            let badgeVariant = 'emerald';
            let badgeLabel = 'ACTIVA';

            if (isSuspended) {
              badgeVariant = 'red';
              badgeLabel = 'SUSPENDIDA';
            } else if (isExpired) {
              badgeVariant = 'red';
              badgeLabel = 'VENCIDA';
            } else if (isExpiring) {
              badgeVariant = 'amber';
              badgeLabel = `POR VENCER (${daysLeft}d)`;
            }

            const boxCount = parseInt(sub.maxBoxes) || 1;
            const isCopied = copiedKey === sub.licenseKey;
            const ltv = parseFloat(sub.ltvUsd || 0);

            return (
              <div 
                key={sub.id} 
                className="relative bg-gradient-to-b from-[#1a0f36]/85 to-[#0d061e]/90 border border-white/10 hover:border-cyan-500/40 rounded-3xl backdrop-blur-xl p-7 sm:p-8 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                <div className="space-y-5 relative z-10">
                  
                  {/* Top Business Name & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-black text-white text-base truncate" title={sub.businessName}>
                          {sub.businessName}
                        </h4>
                        <span className="text-xs font-mono font-bold text-slate-400 block">
                          {sub.rifDoc}
                        </span>
                      </div>
                    </div>

                    <Badge variant={badgeVariant} dot={badgeVariant === 'emerald'}>
                      {badgeLabel}
                    </Badge>
                  </div>

                  {/* License Key Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 flex items-center justify-between gap-2 shadow-inner">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Clave de Activación</span>
                      <span className="font-mono text-xs font-bold text-cyan-300 select-all truncate block">
                        {sub.licenseKey}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(sub.licenseKey)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      title="Copiar Clave"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Plan & Pricing Info */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Plan Comercial</span>
                      <div className="font-bold text-white truncate flex items-center justify-between">
                        <span>{planShortLabelMap[sub.planType] || sub.planType}</span>
                        <button
                          type="button"
                          onClick={() => onChangePlan && onChangePlan(sub)}
                          className="text-[10px] text-cyan-400 hover:underline font-black"
                        >
                          Editar
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Monitor className="w-3 h-3 text-cyan-400" />
                        <span>{boxCount} {boxCount === 1 ? 'Caja' : 'Cajas'}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Tarifa & LTV</span>
                      <div className="font-mono font-bold text-emerald-400">
                        ${parseFloat(sub.monthlyFeeUsd || 0).toFixed(2)}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenPaymentHistory && onOpenPaymentHistory(sub)}
                        className="text-[10px] font-mono text-teal-300 hover:underline font-bold block truncate"
                      >
                        LTV: ${ltv.toFixed(0)} ({sub.paymentsCount || 0} pagos)
                      </button>
                    </div>
                  </div>

                  {/* Expiration Date Info */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" /> Vence:
                    </span>
                    <span className={`font-bold ${isExpiring ? 'text-amber-400' : isExpired ? 'text-red-400' : 'text-white'}`}>
                      {formatDate(new Date(sub.expirationDate))} ({daysLeft}d)
                    </span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-5 mt-5 border-t border-white/10 space-y-2.5 relative z-10">
                  
                  {/* Primary WhatsApp & Payment Row */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenWhatsApp && onOpenWhatsApp(sub)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRecordPayment && onRecordPayment(sub)}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+Cobro</span>
                    </button>
                  </div>

                  {/* Secondary Extension & Status Row */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onExtendDays(sub.licenseKey, 30)}
                      className="flex-1 py-2 rounded-xl font-bold text-xs bg-white/[0.05] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer text-center"
                    >
                      +30 Días
                    </button>
                    <button
                      type="button"
                      onClick={() => onExtendDays(sub.licenseKey, 365)}
                      className="flex-1 py-2 rounded-xl font-bold text-xs bg-white/[0.05] hover:bg-white/[0.12] text-slate-200 hover:text-white border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer text-center"
                    >
                      +1 Año
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleStatus(sub.licenseKey, sub.status)}
                      className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${
                        isSuspended 
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                      }`}
                      title={isSuspended ? 'Reactivar Licencia' : 'Suspender Licencia'}
                    >
                      {isSuspended ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenFeatureFlags && onOpenFeatureFlags(sub)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-indigo-500/20 text-slate-400 hover:text-indigo-300 border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
                      title="Gestionar módulos y aliado comercial"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditBusiness && onEditBusiness(sub)}
                      className="p-2 rounded-xl bg-white/[0.05] hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer"
                      title="Editar datos del comercio"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
