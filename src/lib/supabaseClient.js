import { createClient } from '@supabase/supabase-js';

// Default Supabase project configuration (can be overridden in localStorage or .env)
const DEFAULT_URL = 'https://sjmmlbwrghvlexxztkzv.supabase.co';
const ENV_URL = import.meta.env?.VITE_SUPABASE_URL || DEFAULT_URL;
const ENV_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

export const SUPABASE_SCHEMA_SQL = `-- ========================================================
-- VENTROX POS & SUPERADMIN - ESQUEMA OFICIAL DE SUPABASE
-- Pega este script en el SQL Editor de tu proyecto Supabase
-- ========================================================

-- 1. Tabla de Negocios y Comercios (Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.businesses (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rif_doc TEXT NOT NULL UNIQUE,
    phone TEXT,
    email TEXT,
    contact_person TEXT,
    license_key TEXT UNIQUE NOT NULL,
    is_active INTEGER DEFAULT 1,
    node_id TEXT DEFAULT 'node-default',
    distributor_name TEXT,
    distributor_commission NUMERIC DEFAULT 0.00,
    modules_config JSONB DEFAULT '{"cashea": true, "fiscal_printer": true, "multi_warehouse": true, "kardex": true, "restaurant_tables": false, "pdf_reports": true, "whatsapp_receipts": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Suscripciones y Licencias POS
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE,
    license_key TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'ANUAL',
    status TEXT DEFAULT 'ACTIVA',
    monthly_fee_usd NUMERIC DEFAULT 80.00,
    max_boxes INTEGER DEFAULT 2,
    start_date TIMESTAMPTZ DEFAULT now(),
    expiration_date TIMESTAMPTZ NOT NULL,
    last_verified_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Registro de Pagos y Facturación (Historial & LTV)
CREATE TABLE IF NOT EXISTS public.payments (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL,
    amount_usd NUMERIC NOT NULL DEFAULT 0.00,
    amount_ves NUMERIC DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'ZELLE',
    reference_code TEXT,
    receipt_number TEXT,
    status TEXT DEFAULT 'APPROVED', -- 'APPROVED', 'PENDING_VERIFICATION', 'REJECTED'
    proof_url TEXT,
    payment_date TIMESTAMPTZ DEFAULT now(),
    period_extended_days INTEGER DEFAULT 0,
    distributor_commission_usd NUMERIC DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Dispositivos y Cajas Vinculadas (Telemetría de Cajas)
CREATE TABLE IF NOT EXISTS public.pos_devices (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE,
    license_key TEXT NOT NULL,
    device_id TEXT NOT NULL,
    machine_name TEXT,
    os_info TEXT,
    app_version TEXT,
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(license_key, device_id)
);

-- 5. Tabla de Mesa de Ayuda y Tickets de Soporte
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGSERIAL PRIMARY KEY,
    business_id BIGINT,
    license_key TEXT NOT NULL,
    business_name TEXT NOT NULL,
    contact_phone TEXT,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MEDIA', -- 'ALTA', 'MEDIA', 'BAJA'
    status TEXT DEFAULT 'ABIERTO', -- 'ABIERTO', 'EN_PROCESO', 'RESUELTO'
    assigned_to TEXT DEFAULT 'Soporte',
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 6. Tabla de Bitácora de Auditoría SuperAdmin
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL DEFAULT 'superadmin',
    action_type TEXT NOT NULL,
    description TEXT NOT NULL,
    target_business TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Tabla de Configuración Global del Ecosistema
CREATE TABLE IF NOT EXISTS public.global_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    bcv_rate NUMERIC DEFAULT 65.50,
    min_pos_version TEXT DEFAULT '1.0.0',
    maintenance_mode BOOLEAN DEFAULT false,
    maintenance_message TEXT DEFAULT 'Sistema en mantenimiento preventivo. Volvemos en breve.',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insertar registro por defecto en global_config si no existe
INSERT INTO public.global_config (id, bcv_rate, min_pos_version, maintenance_mode, maintenance_message)
VALUES (1, 65.50, '1.0.0', false, 'Sistema en mantenimiento preventivo. Volvemos en breve.')
ON CONFLICT (id) DO NOTHING;

-- 8. Deshabilitar RLS para permitir sincronización fluida entre POS y SuperAdmin
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_config DISABLE ROW LEVEL SECURITY;
`;

export function cleanSupabaseUrl(raw) {
  if (!raw) return '';
  let url = raw.trim();

  // 1. Si el usuario pegó la URL del Dashboard de Supabase: https://supabase.com/dashboard/project/abcdef...
  const dashboardMatch = url.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (dashboardMatch && dashboardMatch[1]) {
    return `https://${dashboardMatch[1]}.supabase.co`;
  }

  // 2. Si pegó solo el Project ID / Ref (ej: sjmmlbwrghvlexxztkzv)
  if (/^[a-z0-9]{15,25}$/i.test(url)) {
    return `https://${url}.supabase.co`;
  }

  // 3. Asegurar protocolo https://
  if (!/^https?:\/\//i.test(url)) {
    url = 'https://' + url;
  }

  // 4. Eliminar /rest/v1, /auth/v1, trailing slashes y mantener solo protocol + host
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  }
}

export function cleanSupabaseKey(raw) {
  if (!raw) return '';
  return raw.trim().replace(/\s+/g, '');
}

export const getStoredCredentials = () => {
  const rawUrl = localStorage.getItem('vx_supabase_url') || ENV_URL || DEFAULT_URL;
  const rawKey = localStorage.getItem('vx_supabase_key') || ENV_KEY || '';
  return { 
    url: cleanSupabaseUrl(rawUrl), 
    key: cleanSupabaseKey(rawKey) 
  };
};

export const saveCredentials = (url, key) => {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = cleanSupabaseKey(key);
  localStorage.setItem('vx_supabase_url', cleanUrl);
  localStorage.setItem('vx_supabase_key', cleanKey);
  
  cachedClient = null;
  cachedClientUrl = '';
  cachedClientKey = '';
};

let cachedClient = null;
let cachedClientUrl = '';
let cachedClientKey = '';

export const getSupabaseClient = () => {
  const { url, key } = getStoredCredentials();
  if (!url || !key) return null;

  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = cleanSupabaseKey(key);

  if (cachedClient && cachedClientUrl === cleanUrl && cachedClientKey === cleanKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cleanUrl, cleanKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
    cachedClientUrl = cleanUrl;
    cachedClientKey = cleanKey;
    return cachedClient;
  } catch (e) {
    console.error('Error instanciando cliente Supabase:', e);
    return null;
  }
};

export const testSupabaseConnection = async (customUrl, customKey) => {
  const creds = getStoredCredentials();
  const rawUrl = customUrl !== undefined ? customUrl : creds.url;
  const rawKey = customKey !== undefined ? customKey : creds.key;

  const url = cleanSupabaseUrl(rawUrl);
  const key = cleanSupabaseKey(rawKey);

  if (!url || !key) {
    return { ok: false, message: 'URL o Anon Key no configurados.' };
  }

  try {
    const client = (url === cachedClientUrl && key === cachedClientKey && cachedClient)
      ? cachedClient
      : createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
        });
    
    // Intenta consultar la tabla subscriptions
    const { error } = await client.from('subscriptions').select('count', { count: 'exact', head: true });
    
    if (error) {
      // Si la tabla no existe
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return { 
          ok: false, 
          tableMissing: true, 
          message: 'Conectó a Supabase pero las tablas (businesses, subscriptions) aún no han sido creadas. Ejecuta el script SQL en el Editor SQL.' 
        };
      }
      if (error.code === '42501' || error.message?.includes('row-level security')) {
        return {
          ok: false,
          message: 'Error de permisos RLS: Ejecuta el script SQL para deshabilitar RLS en las tablas businesses y subscriptions.'
        };
      }
      return { ok: false, message: `Error de Supabase: ${error.message} (${error.code || 'sin código'})` };
    }

    return { ok: true, message: `Conexión a Supabase (${url}) verificada exitosamente.` };
  } catch (err) {
    return { ok: false, message: `Error de red o URL inválida: ${err.message}` };
  }
};

// ========================================================
// GESTIÓN DE CLÚSTERES / MULTI-NODO SUPABASE (SHARDING)
// ========================================================

const NODES_STORAGE_KEY = 'vx_supabase_nodes';

export const getAllNodes = () => {
  try {
    const stored = localStorage.getItem(NODES_STORAGE_KEY);
    let nodes = stored ? JSON.parse(stored) : [];
    
    const defaultCreds = getStoredCredentials();

    // 1. Asegurar Nodo 1 (Producción)
    let prodNode = nodes.find(n => n.id === 'node-default');
    if (!prodNode) {
      prodNode = {
        id: 'node-default',
        name: 'Nodo 1 - Producción (Clientes Pagos)',
        url: defaultCreds.url || cleanSupabaseUrl(ENV_URL),
        anonKey: defaultCreds.key || cleanSupabaseKey(ENV_KEY),
        region: 'us-east-1',
        isDefault: true,
        createdAt: new Date().toISOString()
      };
      nodes.unshift(prodNode);
    } else if (prodNode.name === 'Nodo 1 - Principal (Default)') {
      prodNode.name = 'Nodo 1 - Producción (Clientes Pagos)';
    }

    // 2. Asegurar Nodo 2 (Demos / Pruebas)
    let demoNode = nodes.find(n => n.id === 'node-demos');
    if (!demoNode) {
      demoNode = {
        id: 'node-demos',
        name: 'Nodo 2 - Demos / Pruebas (15 Días)',
        url: 'https://irwaqwgpyxjxjsexewze.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd2Fxd2dweXhqeGpzZXhld3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjEyMjksImV4cCI6MjEwMzc5NzIyOX0.9JYbgkHhcjngVWZ1vkkh_Ube85lU-nZqwBFLzro81gU',
        region: 'us-east-1',
        isDefault: false,
        notes: 'Clúster exclusivo para cuentas de prueba gratuitas',
        createdAt: new Date().toISOString()
      };
      nodes.push(demoNode);
    }

    localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));
    return nodes;
  } catch (e) {
    console.error('Error cargando nodos de Supabase:', e);
    return [
      {
        id: 'node-default',
        name: 'Nodo 1 - Producción (Clientes Pagos)',
        url: cleanSupabaseUrl(ENV_URL),
        anonKey: cleanSupabaseKey(ENV_KEY),
        region: 'us-east-1',
        isDefault: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'node-demos',
        name: 'Nodo 2 - Demos / Pruebas (15 Días)',
        url: 'https://irwaqwgpyxjxjsexewze.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd2Fxd2dweXhqeGpzZXhld3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjEyMjksImV4cCI6MjEwMzc5NzIyOX0.9JYbgkHhcjngVWZ1vkkh_Ube85lU-nZqwBFLzro81gU',
        region: 'us-east-1',
        isDefault: false,
        createdAt: new Date().toISOString()
      }
    ];
  }
};

export const saveNode = (nodeData) => {
  const nodes = getAllNodes();
  const cleanUrl = cleanSupabaseUrl(nodeData.url);
  const cleanKey = cleanSupabaseKey(nodeData.anonKey);

  const existingIdx = nodes.findIndex(n => n.id === nodeData.id);

  const nodeObj = {
    id: nodeData.id || `node-${Date.now()}`,
    name: nodeData.name || `Nodo Supabase ${nodes.length + 1}`,
    url: cleanUrl,
    anonKey: cleanKey,
    region: nodeData.region || 'us-east-1',
    isDefault: !!nodeData.isDefault,
    notes: nodeData.notes || '',
    updatedAt: new Date().toISOString()
  };

  if (nodeObj.isDefault) {
    nodes.forEach(n => { n.isDefault = false; });
  }

  if (existingIdx >= 0) {
    nodes[existingIdx] = { ...nodes[existingIdx], ...nodeObj };
  } else {
    nodes.push(nodeObj);
  }

  localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));

  // Si es default, actualizar credenciales activas
  if (nodeObj.isDefault) {
    saveCredentials(cleanUrl, cleanKey);
  }

  return nodeObj;
};

export const deleteNode = (nodeId) => {
  if (nodeId === 'node-default') {
    throw new Error('No se puede eliminar el nodo principal por defecto.');
  }

  const nodes = getAllNodes().filter(n => n.id !== nodeId);
  localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));
  return true;
};

export const setDefaultNode = (nodeId) => {
  const nodes = getAllNodes();
  let selected = null;

  nodes.forEach(n => {
    if (n.id === nodeId) {
      n.isDefault = true;
      selected = n;
    } else {
      n.isDefault = false;
    }
  });

  if (selected) {
    localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(nodes));
    saveCredentials(selected.url, selected.anonKey);
  }

  return selected;
};

const nodeClientsCache = {};

export const getNodeClient = (nodeId) => {
  if (!nodeId || nodeId === 'node-default') {
    return getSupabaseClient();
  }

  const nodes = getAllNodes();
  const node = nodes.find(n => n.id === nodeId);
  if (!node || !node.url || !node.anonKey) {
    return getSupabaseClient();
  }

  const cacheKey = `${node.url}_${node.anonKey}`;
  if (nodeClientsCache[cacheKey]) {
    return nodeClientsCache[cacheKey];
  }

  try {
    const client = createClient(node.url, node.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
    nodeClientsCache[cacheKey] = client;
    return client;
  } catch (e) {
    console.error(`Error creando cliente para nodo ${nodeId}:`, e);
    return getSupabaseClient();
  }
};

export const createDirectClient = (url, anonKey) => {
  const cleanUrl = cleanSupabaseUrl(url);
  const cleanKey = cleanSupabaseKey(anonKey);
  if (!cleanUrl || !cleanKey) return null;

  return createClient(cleanUrl, cleanKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
};

