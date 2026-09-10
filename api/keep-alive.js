/**
 * Vercel Serverless Function: Keep-Alive Cron Job
 * 
 * Se ejecuta automáticamente cada 4 días mediante Vercel Crons
 * para evitar la pausa por inactividad (7 días) en los proyectos gratuitos de Supabase.
 * También puede invocarse manualmente desde el panel de SuperAdmin o mediante llamada GET.
 */

// Lista predeterminada de clústeres a mantener activos
const DEFAULT_CLUSTERS = [
  {
    id: 'node-default',
    name: 'Nodo 1 - Producción (Clientes Pagos)',
    url: process.env.VITE_SUPABASE_URL || 'https://sjmmlbwrghvlexxztkzv.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbW1sYndyZ2h2bGV4eHp0a3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzE5NTcsImV4cCI6MjEwMjMwNzk1N30.7MpFfY59WIK7JxAYYTUHq5wj91eGKhr4ozgwJY25oLo'
  },
  {
    id: 'node-demos',
    name: 'Nodo 2 - Demos / Pruebas (15 Días)',
    url: process.env.DEMO_SUPABASE_URL || 'https://irwaqwgpyxjxjsexewze.supabase.co',
    anonKey: process.env.DEMO_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd2Fxd2dweXhqeGpzZXhld3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjEyMjksImV4cCI6MjEwMzc5NzIyOX0.9JYbgkHhcjngVWZ1vkkh_Ube85lU-nZqwBFLzro81gU'
  }
];

export default async function handler(req, res) {
  // Configuración de encabezados CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verificación de seguridad opcional:
  // Vercel envía automáticamente el encabezado Authorization con Bearer <CRON_SECRET> si la variable existe
  const authHeader = req.headers['authorization'];
  const querySecret = req.query?.secret;
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    querySecret !== process.env.CRON_SECRET
  ) {
    return res.status(401).json({
      ok: false,
      message: 'No autorizado. Proporcione el CRON_SECRET válido.'
    });
  }

  // Cargar clústeres adicionales desde variables de entorno si están configurados
  let clustersToPing = [...DEFAULT_CLUSTERS];
  if (process.env.ADDITIONAL_SUPABASE_CLUSTERS) {
    try {
      const extra = JSON.parse(process.env.ADDITIONAL_SUPABASE_CLUSTERS);
      if (Array.isArray(extra)) {
        clustersToPing = [...clustersToPing, ...extra];
      }
    } catch (e) {
      console.warn('Error parseando ADDITIONAL_SUPABASE_CLUSTERS:', e.message);
    }
  }

  const results = [];
  const startTime = Date.now();

  for (const cluster of clustersToPing) {
    if (!cluster.url || !cluster.anonKey) continue;

    const targetUrl = cluster.url.replace(/\/+$/, '');
    const pingStart = Date.now();

    try {
      // 1. Petición al endpoint REST raíz de PostgREST para registrar actividad en la API
      const rootResponse = await fetch(`${targetUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          apikey: cluster.anonKey,
          Authorization: `Bearer ${cluster.anonKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      // 2. Consulta a una tabla para activar la base de datos PostgreSQL y su connection pool
      let dbQueryOk = false;
      let dbStatus = null;
      try {
        const tableResponse = await fetch(`${targetUrl}/rest/v1/subscriptions?select=count&limit=1`, {
          method: 'GET',
          headers: {
            apikey: cluster.anonKey,
            Authorization: `Bearer ${cluster.anonKey}`,
            Range: '0-0'
          },
          signal: AbortSignal.timeout(10000)
        });
        dbQueryOk = tableResponse.ok || tableResponse.status === 206 || tableResponse.status === 200;
        dbStatus = tableResponse.status;
      } catch {
        dbQueryOk = false;
      }

      const latencyMs = Date.now() - pingStart;
      const isHealthy = rootResponse.ok || rootResponse.status === 200 || dbQueryOk;

      results.push({
        id: cluster.id || cluster.name,
        name: cluster.name,
        url: targetUrl,
        healthy: isHealthy,
        statusCode: dbStatus || rootResponse.status,
        apiStatus: rootResponse.status,
        dbStatus: dbStatus,
        latencyMs,
        message: isHealthy 
          ? 'Clúster activo y despierto con éxito' 
          : `Respuesta HTTP inesperada: ${rootResponse.status}`
      });
    } catch (err) {
      const latencyMs = Date.now() - pingStart;
      results.push({
        id: cluster.id || cluster.name,
        name: cluster.name,
        url: targetUrl,
        healthy: false,
        latencyMs,
        error: err.message,
        message: `Fallo al contactar el clúster: ${err.message}`
      });
    }
  }

  const allHealthy = results.every(r => r.healthy);

  return res.status(200).json({
    ok: allHealthy,
    action: 'supabase_keep_alive',
    trigger: authHeader ? 'cron_scheduled' : 'manual_or_api',
    schedule: 'Cada 4 días (0 12 */4 * *)',
    timestamp: new Date().toISOString(),
    totalDurationMs: Date.now() - startTime,
    clustersPinged: results.length,
    results
  });
}
