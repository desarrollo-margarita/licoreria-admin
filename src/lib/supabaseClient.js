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
    payment_date TIMESTAMPTZ DEFAULT now(),
    period_extended_days INTEGER DEFAULT 0,
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

-- 5. Deshabilitar RLS para permitir sincronización fluida entre POS y SuperAdmin
ALTER TABLE public.businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_devices DISABLE ROW LEVEL SECURITY;
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
    const { data, error } = await client.from('subscriptions').select('count', { count: 'exact', head: true });
    
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
