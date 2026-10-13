import { getAllNodes, getNodeClient } from './supabaseClient.js';
import { logAuditEvent } from './storageService.js';

const STORAGE_BCV_KEY = 'vx_bcv_rate_info';

/**
 * Consulta la Tasa Oficial BCV más reciente desde 4 proveedores públicos con fallbacks en cascada.
 * Timeout estricto de 8 segundos por solicitud para evitar cuelgues.
 */
export const fetchCurrentBcvRate = async () => {
  const fetchWithTimeout = async (url, timeoutMs = 8000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  // 1. Intento 1: DolarAPI Oficial Directo
  try {
    const data = await fetchWithTimeout('https://ve.dolarapi.com/v1/dolares/oficial');
    if (data && typeof data.promedio === 'number' && data.promedio > 0) {
      return {
        success: true,
        rate: Number(data.promedio.toFixed(4)),
        source: 'BCV Oficial (DolarAPI)',
        updatedAt: data.fechaActualizacion ? new Date(data.fechaActualizacion) : new Date()
      };
    }
  } catch (e) {
    console.warn('[BCV Sync] Intento 1 (DolarAPI Oficial) falló:', e.message);
  }

  // 2. Intento 2: DolarAPI Catálogo Completo
  try {
    const data = await fetchWithTimeout('https://ve.dolarapi.com/v1/dolares');
    if (Array.isArray(data)) {
      const oficial = data.find(
        (i) =>
          i.codigo === 'oficial' ||
          i.fuente === 'oficial' ||
          (i.titulo && i.titulo.toLowerCase().includes('oficial'))
      );
      if (oficial && typeof oficial.promedio === 'number' && oficial.promedio > 0) {
        return {
          success: true,
          rate: Number(oficial.promedio.toFixed(4)),
          source: 'BCV Oficial (DolarAPI Lista)',
          updatedAt: oficial.fechaActualizacion ? new Date(oficial.fechaActualizacion) : new Date()
        };
      }
    }
  } catch (e) {
    console.warn('[BCV Sync] Intento 2 (DolarAPI Lista) falló:', e.message);
  }

  // 3. Intento 3: Open Exchange Rates CDN
  try {
    const data = await fetchWithTimeout('https://open.er-api.com/v6/latest/USD');
    if (data && data.rates && typeof data.rates.VES === 'number' && data.rates.VES > 0) {
      return {
        success: true,
        rate: Number(data.rates.VES.toFixed(4)),
        source: 'BCV Oficial (Open Exchange Rates)',
        updatedAt: new Date()
      };
    }
  } catch (e) {
    console.warn('[BCV Sync] Intento 3 (Open Exchange Rates) falló:', e.message);
  }

  // 4. Intento 4: ExchangeRate-API CDN
  try {
    const data = await fetchWithTimeout('https://api.exchangerate-api.com/v4/latest/USD');
    if (data && data.rates && typeof data.rates.VES === 'number' && data.rates.VES > 0) {
      return {
        success: true,
        rate: Number(data.rates.VES.toFixed(4)),
        source: 'BCV Oficial (ExchangeRate-API)',
        updatedAt: new Date()
      };
    }
  } catch (e) {
    console.warn('[BCV Sync] Intento 4 (ExchangeRate-API) falló:', e.message);
  }

  return {
    success: false,
    error: 'No se pudo conectar a los proveedores oficiales de tasa BCV.'
  };
};

/**
 * Obtiene la información local persistida de la tasa BCV
 */
export const getCachedBcvRate = () => {
  try {
    const stored = localStorage.getItem(STORAGE_BCV_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.warn(e);
  }
  return { rate: 65.50, source: 'Por defecto', updatedAt: new Date().toISOString() };
};

/**
 * Propaga una nueva tasa BCV a todos los clústeres/nodos Supabase registrados:
 * 1. Actualiza `global_config` (id: 1, bcv_rate: rate).
 * 2. Actualiza `businesses.bcv_rate` para que Supabase Realtime lo transmita a las cajas de Windows.
 */
export const syncBcvRateToAllNodes = async (rate, source = 'Sincronizador Automático') => {
  const numericRate = parseFloat(rate);
  if (!numericRate || numericRate <= 0) {
    throw new Error('La tasa debe ser un número válido mayor a 0');
  }

  const nowIso = new Date().toISOString();
  const info = {
    rate: numericRate,
    source,
    updatedAt: nowIso
  };

  // Guardar en cache local
  try {
    localStorage.setItem(STORAGE_BCV_KEY, JSON.stringify(info));
    const cfg = JSON.parse(localStorage.getItem('vx_global_config') || '{}');
    cfg.bcvRate = numericRate;
    cfg.updatedAt = nowIso;
    localStorage.setItem('vx_global_config', JSON.stringify(cfg));
  } catch (e) {
    console.warn(e);
  }

  const nodes = getAllNodes();
  let updatedCount = 0;

  const failures = [];

  for (const node of nodes) {
    const client = getNodeClient(node.id);
    if (!client) continue;

    try {
      // 1. Actualizar global_config
      const { error: cfgError } = await client
        .from('global_config')
        .upsert({ id: 1, bcv_rate: numericRate, updated_at: nowIso });
      if (cfgError) {
        console.warn(`[BCV Sync] global_config falló en nodo ${node.id}:`, cfgError);
      }

      // 2. Actualizar businesses (para disparar WebSocket Realtime a los POS en Windows)
      const { data: updatedRows, error: bizError } = await client
        .from('businesses')
        .update({ bcv_rate: numericRate })
        .gt('id', 0)
        .select('id');
      if (bizError) throw bizError;
      if (!updatedRows || updatedRows.length === 0) {
        throw new Error('0 negocios actualizados (¿RLS o tabla vacía?)');
      }

      updatedCount++;
    } catch (err) {
      console.warn(`[BCV Sync] Error sincronizando tasa en nodo ${node.id}:`, err);
      failures.push(`${node.id}: ${err.message || err}`);
    }
  }

  if (updatedCount === 0) {
    throw new Error(`No se pudo guardar la tasa en ningún nodo. ${failures.join(' | ')}`);
  }

  // Registrar evento en bitácora de auditoría
  try {
    await logAuditEvent({
      actionType: 'TASA_BCV_ACTUALIZADA',
      description: `Tasa BCV sincronizada a Bs. ${numericRate.toFixed(4)} (${source}) en ${updatedCount} nodo(s).`
    });
  } catch (e) {
    console.warn(e);
  }

  return { success: true, rate: numericRate, updatedCount, source, updatedAt: nowIso };
};

let autoSyncTimerId = null;

/**
 * Inicia el temporizador de auto-sincronización periódica en segundo plano
 * (cada 30 min y al arrancar).
 */
export const startBcvAutoSync = (onRateUpdated, intervalMinutes = 30) => {
  if (autoSyncTimerId) {
    clearInterval(autoSyncTimerId);
  }

  const runSync = async () => {
    try {
      const res = await fetchCurrentBcvRate();
      if (res.success && res.rate > 0) {
        const cached = getCachedBcvRate();
        const diff = Math.abs(cached.rate - res.rate);
        // Si hay cambio perceptible (> 0.001) o pasaron más de 4 horas
        const hoursSinceLast = (Date.now() - new Date(cached.updatedAt).getTime()) / (1000 * 60 * 60);
        if (diff > 0.001 || hoursSinceLast >= 4) {
          const syncRes = await syncBcvRateToAllNodes(res.rate, res.source);
          if (onRateUpdated) {
            onRateUpdated(syncRes);
          }
        }
      }
    } catch (e) {
      console.warn('[BCV AutoSync Timer] Error en consulta periódica:', e);
    }
  };

  // Ejecución inicial después de 3 segundos para no bloquear la carga
  setTimeout(runSync, 3000);

  // Intervalo periódico
  autoSyncTimerId = setInterval(runSync, intervalMinutes * 60 * 1000);

  return () => {
    if (autoSyncTimerId) {
      clearInterval(autoSyncTimerId);
      autoSyncTimerId = null;
    }
  };
};
