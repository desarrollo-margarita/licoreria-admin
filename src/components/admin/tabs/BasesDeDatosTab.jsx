import React, { useState, useEffect } from 'react';
import { 
  Database, Server, Plus, RefreshCw, CheckCircle2, 
  Download, Upload, Copy, Check, 
  AlertTriangle, HardDrive, Zap, Trash2, Edit3
} from 'lucide-react';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { 
  getAllNodes, saveNode, deleteNode, setDefaultNode, 
  testSupabaseConnection, SUPABASE_SCHEMA_SQL 
} from '../../../lib/supabaseClient';
import { 
  migrateDatabase, exportFullDatabaseBackup, restoreFullDatabaseBackup 
} from '../../../lib/storageService';

export default function BasesDeDatosTab({ businesses = [], onRefreshAll }) {
  const [nodes, setNodes] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('nodes'); // 'nodes' | 'migration' | 'backup'
  const [nodePings, setNodePings] = useState({});

  // Add / Edit Node Modal
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [nodeForm, setNodeForm] = useState({ name: '', url: '', anonKey: '', region: 'us-east-1', isDefault: false, notes: '' });
  const [nodeFormError, setNodeFormError] = useState('');
  const [testingNode, setTestingNode] = useState(false);

  // Migration Assistant State
  const [sourceNodeId, setSourceNodeId] = useState('node-default');
  const [targetNodeId, setTargetNodeId] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);
  const [migrationError, setMigrationError] = useState('');

  // Backup / Restore State
  const [backupNodeId, setBackupNodeId] = useState('node-default');
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(null);
  const [restoreStatusMsg, setRestoreStatusMsg] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = () => {
    const list = getAllNodes();
    setNodes(list);
    if (!targetNodeId && list.length > 1) {
      setTargetNodeId(list[1].id);
    }
  };

  const handlePingNode = async (node) => {
    setNodePings(prev => ({ ...prev, [node.id]: { checking: true } }));
    const result = await testSupabaseConnection(node.url, node.anonKey);
    setNodePings(prev => ({
      ...prev,
      [node.id]: {
        checking: false,
        ok: result.ok,
        message: result.message,
        tableMissing: result.tableMissing
      }
    }));
  };

  const handleOpenAddNode = () => {
    setEditingNode(null);
    setNodeForm({
      name: `Nodo ${nodes.length + 1} - Secundario`,
      url: '',
      anonKey: '',
      region: 'us-east-1',
      isDefault: false,
      notes: ''
    });
    setNodeFormError('');
    setIsNodeModalOpen(true);
  };

  const handleOpenEditNode = (node) => {
    setEditingNode(node);
    setNodeForm({
      name: node.name,
      url: node.url,
      anonKey: node.anonKey,
      region: node.region || 'us-east-1',
      isDefault: !!node.isDefault,
      notes: node.notes || ''
    });
    setNodeFormError('');
    setIsNodeModalOpen(true);
  };

  const handleSaveNodeSubmit = async (e) => {
    e.preventDefault();
    setNodeFormError('');

    if (!nodeForm.name.trim()) {
      setNodeFormError('El nombre del nodo es obligatorio.');
      return;
    }
    if (!nodeForm.url.trim() || !nodeForm.anonKey.trim()) {
      setNodeFormError('Debes ingresar la URL y la Anon Key del proyecto Supabase.');
      return;
    }

    setTestingNode(true);
    const test = await testSupabaseConnection(nodeForm.url, nodeForm.anonKey);
    setTestingNode(false);

    if (!test.ok && !test.tableMissing) {
      setNodeFormError(`Error conectando a Supabase: ${test.message}`);
      return;
    }

    saveNode({
      id: editingNode?.id,
      ...nodeForm
    });

    setIsNodeModalOpen(false);
    loadNodes();
    if (onRefreshAll) onRefreshAll();
  };

  const handleDeleteNode = (nodeId) => {
    if (window.confirm('¿Seguro que deseas eliminar este nodo de la lista? Los comercios asociados deberán ser reasignados.')) {
      try {
        deleteNode(nodeId);
        loadNodes();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleSetDefault = (nodeId) => {
    setDefaultNode(nodeId);
    loadNodes();
    if (onRefreshAll) onRefreshAll();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Contar comercios por nodo
  const getBusinessesCountForNode = (nodeId) => {
    return businesses.filter(b => (b.nodeId || 'node-default') === nodeId).length;
  };

  // ==========================================
  // EJECUCIÓN DE MIGRACIÓN ASISTIDA (MÉTODO 2)
  // ==========================================
  const handleStartMigration = async () => {
    if (!sourceNodeId || !targetNodeId) {
      setMigrationError('Selecciona el nodo origen y el nodo destino.');
      return;
    }
    if (sourceNodeId === targetNodeId) {
      setMigrationError('El nodo origen y destino no pueden ser el mismo.');
      return;
    }

    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);

    if (!sourceNode || !targetNode) {
      setMigrationError('Nodo no encontrado.');
      return;
    }

    if (!window.confirm(`¿Iniciar migración asistida desde "${sourceNode.name}" hacia "${targetNode.name}"? Los datos coincidentes en el destino se actualizarán.`)) {
      return;
    }

    setMigrationError('');
    setMigrationResult(null);
    setIsMigrating(true);
    setMigrationProgress({ percentage: 0, message: 'Iniciando conexión con ambos clústeres...' });

    try {
      const res = await migrateDatabase({
        sourceUrl: sourceNode.url,
        sourceKey: sourceNode.anonKey,
        targetUrl: targetNode.url,
        targetKey: targetNode.anonKey,
        onProgress: (p) => {
          setMigrationProgress(p);
        }
      });

      setMigrationResult(res);
      setIsMigrating(false);
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      setIsMigrating(false);
      setMigrationError(err.message || 'Error durante la migración.');
    }
  };

  // ==========================================
  // BACKUP & RESTAURACIÓN JSON
  // ==========================================
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      const backup = await exportFullDatabaseBackup(backupNodeId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ventrox_backup_${backupNodeId}_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setIsExporting(false);
    } catch (err) {
      alert('Error exportando backup: ' + err.message);
      setIsExporting(false);
    }
  };

  const handleRestoreFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result);
        if (!json.tables) {
          alert('El archivo no parece ser un backup válido de VentroX.');
          return;
        }

        if (window.confirm(`Se importarán los datos del archivo en el nodo "${backupNodeId}". ¿Deseas continuar?`)) {
          setIsRestoring(true);
          setRestoreStatusMsg('Restaurando datos...');

          await restoreFullDatabaseBackup(json, backupNodeId, (p) => {
            setRestoreProgress(p);
            setRestoreStatusMsg(p.message);
          });

          setIsRestoring(false);
          setRestoreStatusMsg('¡Restauración completada con éxito!');
          if (onRefreshAll) onRefreshAll();
        }
      } catch (err) {
        setIsRestoring(false);
        alert('Error leyendo archivo JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner with Concept Explanation */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1a0f36]/90 via-slate-900/90 to-[#0d061e]/90 border border-cyan-500/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 text-xs font-bold border border-cyan-500/30">
            <Server className="w-3.5 h-3.5" /> Arquitectura Multi-Nodo & Escalabilidad
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Distribución de Cargas (<span className="bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">Sharding</span>) & Migración
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Conecta <strong>múltiples cuentas gratuitas de Supabase</strong> para distribuir comercios por grupos sin superar los límites de espacio, o clona y migra tu base de datos completa con 1 solo clic.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopySql}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copiar SQL Schema</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('nodes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'nodes'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Clústeres & Nodos Activos</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
            {nodes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('migration')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'migration'
              ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/40 shadow-lg shadow-orange-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <Zap className="w-4 h-4 text-orange-400" />
          <span>Migrador Asistido (Cloud-to-Cloud)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('backup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'backup'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Copias de Seguridad (JSON)</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* SUB-TAB 1: GESTIÓN DE NODOS / CLÚSTERES (SHARDING) */}
      {/* ==================================================== */}
      {activeSubTab === 'nodes' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Nodos Supabase Configurados</h3>
              <p className="text-xs text-slate-400">Cada nodo corresponde a un proyecto independiente de Supabase</p>
            </div>

            <Button
              onClick={handleOpenAddNode}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              AÑADIR NUEVO NODO
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nodes.map((node) => {
              const ping = nodePings[node.id];
              const count = getBusinessesCountForNode(node.id);

              return (
                <div
                  key={node.id}
                  className={`relative bg-gradient-to-b from-[#1a0f36]/90 to-[#0d061e]/95 border ${
                    node.isDefault ? 'border-cyan-500/60 shadow-cyan-500/10' : 'border-white/10'
                  } rounded-3xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between group transition-all`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <Database className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{node.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {node.id}</span>
                        </div>
                      </div>

                      {node.isDefault ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefault(node.id)}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] transition-colors cursor-pointer"
                          title="Establecer como nodo por defecto"
                        >
                          Hacer Default
                        </button>
                      )}
                    </div>

                    {/* URL Card */}
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                        <span>URL del Proyecto</span>
                        <button
                          onClick={() => handleCopyUrl(node.url, node.id)}
                          className="text-cyan-400 hover:text-cyan-300 cursor-pointer text-[10px] flex items-center gap-1"
                        >
                          {copiedId === node.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === node.id ? 'Copiada' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 font-mono truncate">{node.url || 'No configurada'}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-950/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Comercios</span>
                        <span className="text-base font-black text-white">{count}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950/40 border border-white/5">
                        <span className="text-[10px] text-slate-400 block">Región</span>
                        <span className="text-xs font-bold text-slate-300 font-mono">{node.region || 'us-east-1'}</span>
                      </div>
                    </div>

                    {/* Ping Status Alert */}
                    {ping && (
                      <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                        ping.checking 
                          ? 'bg-slate-800 text-slate-300' 
                          : ping.ok 
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}>
                        {ping.checking ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : ping.ok ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="text-[11px] font-medium leading-tight">
                          {ping.checking ? 'Probando conexión...' : ping.ok ? 'Conexión activa y tablas verificadas' : ping.message}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handlePingNode(node)}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Ping Test</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditNode(node)}
                        className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-colors cursor-pointer"
                        title="Editar credenciales"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      
                      {!node.isDefault && (
                        <button
                          onClick={() => handleDeleteNode(node.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                          title="Eliminar nodo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 2: MIGRADOR ASISTIDO EN VIVO (MÉTODO 2)     */}
      {/* ==================================================== */}
      {activeSubTab === 'migration' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Asistente de Migración Cloud-to-Cloud
              </h3>
              <p className="text-xs text-slate-300">
                Transfiere automáticamente todos los registros (comercios, suscripciones, pagos, tickets y telemetría) desde un proyecto Supabase hacia otro.
              </p>
            </div>

            {/* Selectors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              
              {/* Source Node */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  1. Nodo / Proyecto de Origen (Extraer Data)
                </label>
                <select
                  value={sourceNodeId}
                  onChange={e => setSourceNodeId(e.target.value)}
                  disabled={isMigrating}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name} {n.isDefault ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  {getBusinessesCountForNode(sourceNodeId)} comercios registrados actualmente.
                </p>
              </div>

              {/* Target Node */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-2">
                <label className="text-xs font-bold text-slate-300 block">
                  2. Nodo / Proyecto de Destino (Inyectar Data)
                </label>
                <select
                  value={targetNodeId}
                  onChange={e => setTargetNodeId(e.target.value)}
                  disabled={isMigrating}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="">-- Selecciona el Nodo Destino --</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id} disabled={n.id === sourceNodeId}>
                      {n.name} {n.id === sourceNodeId ? '(Origen actual)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400">
                  Asegúrate de haber ejecutado el script SQL en el destino.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {migrationError && (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{migrationError}</span>
              </div>
            )}

            {/* Migration Progress Bar */}
            {isMigrating && migrationProgress && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-cyan-300 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {migrationProgress.message}
                  </span>
                  <span className="text-white font-mono">{migrationProgress.percentage}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-cyan-400 transition-all duration-300 rounded-full"
                    style={{ width: `${migrationProgress.percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Migration Success Result */}
            {migrationResult && (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-emerald-200">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ¡Migración Asistida Completada con Éxito!
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                  {Object.entries(migrationResult.summary).map(([tbl, val]) => (
                    <div key={tbl} className="p-2 rounded-lg bg-slate-950/60 border border-emerald-500/20 font-mono">
                      <span className="text-[10px] text-slate-400 block">{tbl}</span>
                      <span className="text-white font-bold">{val.count} reg.</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleStartMigration}
                disabled={isMigrating || !targetNodeId}
                variant="primary"
                icon={Zap}
              >
                {isMigrating ? 'MIGRANDO DATOS...' : 'INICIAR MIGRACIÓN ASISTIDA'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SUB-TAB 3: BACKUP Y RESTAURACIÓN JSON               */}
      {/* ==================================================== */}
      {activeSubTab === 'backup' && (
        <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Export Backup Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Descargar Copia de Seguridad</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Genera un archivo <strong>.JSON</strong> completo con todas las tablas, pagos y licencias para almacenamiento seguro en tu PC.
                </p>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-400">Selecciona el Nodo a Respaldar</label>
                  <select
                    value={backupNodeId}
                    onChange={e => setBackupNodeId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button
                onClick={handleExportBackup}
                disabled={isExporting}
                variant="secondary"
                icon={Download}
                className="w-full"
              >
                {isExporting ? 'GENERANDO ARCHIVO...' : 'DESCARGAR BACKUP (.JSON)'}
              </Button>
            </div>

            {/* Restore Backup Card */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Restaurar Copia de Seguridad</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Carga un archivo <strong>.JSON</strong> de respaldo previo para restaurar todas las tablas en el nodo seleccionado.
                </p>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-slate-400">Selecciona el Nodo Destino</label>
                  <select
                    value={backupNodeId}
                    onChange={e => setBackupNodeId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-cyan-400"
                  >
                    {nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full font-bold text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  <span>{isRestoring ? 'RESTAURANDO...' : 'CARGAR ARCHIVO JSON DE BACKUP'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleRestoreFileChange}
                    disabled={isRestoring}
                    className="hidden"
                  />
                </label>
                {restoreStatusMsg && (
                  <p className="text-[11px] text-center text-emerald-300 font-semibold mt-2">{restoreStatusMsg}</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL PARA AGREGAR / EDITAR NODO SUPABASE            */}
      {/* ==================================================== */}
      <Modal
        isOpen={isNodeModalOpen}
        onClose={() => setIsNodeModalOpen(false)}
        title={editingNode ? 'Editar Nodo Supabase' : 'Añadir Nuevo Nodo Supabase (Sharding)'}
        subtitle="Registra las credenciales de un proyecto gratuito de Supabase para balanceo de carga"
      >
        <form onSubmit={handleSaveNodeSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Nombre del Nodo / Clúster</label>
            <input
              type="text"
              value={nodeForm.name}
              onChange={e => setNodeForm({ ...nodeForm, name: e.target.value })}
              placeholder="ej. Nodo 2 - Oriente / Farmacias"
              required
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Project URL de Supabase</label>
            <input
              type="url"
              value={nodeForm.url}
              onChange={e => setNodeForm({ ...nodeForm, url: e.target.value })}
              placeholder="https://xyzcompany.supabase.co"
              required
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Anon Public Key</label>
            <textarea
              value={nodeForm.anonKey}
              onChange={e => setNodeForm({ ...nodeForm, anonKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              required
              rows={3}
              className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Región AWS</label>
              <input
                type="text"
                value={nodeForm.region}
                onChange={e => setNodeForm({ ...nodeForm, region: e.target.value })}
                placeholder="us-east-1"
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-cyan-400 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">¿Nodo por Defecto?</label>
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultNodeCheck"
                  checked={nodeForm.isDefault}
                  onChange={e => setNodeForm({ ...nodeForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-white/20"
                />
                <label htmlFor="isDefaultNodeCheck" className="text-xs text-slate-300 cursor-pointer">
                  Asignar a nuevos clientes
                </label>
              </div>
            </div>
          </div>

          {nodeFormError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{nodeFormError}</span>
            </div>
          )}

          <div className="pt-3 flex gap-3">
            <Button
              type="button"
              onClick={() => setIsNodeModalOpen(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={testingNode}
              variant="primary"
              className="flex-1"
            >
              {testingNode ? 'VERIFICANDO...' : 'GUARDAR NODO'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
