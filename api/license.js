import { createClient } from '@supabase/supabase-js';

// Lista de Nodos Supabase Configurados (Producción y Demos)
const CLUSTER_NODES = [
  {
    id: 'node-default',
    name: 'Nodo 1 - Producción (Clientes Pagos)',
    url: 'https://sjmmlbwrghvlexxztkzv.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbW1sYndyZ2h2bGV4eHp0a3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MzE5NTcsImV4cCI6MjEwMjMwNzk1N30.7MpFfY59WIK7JxAYYTUHq5wj91eGKhr4ozgwJY25oLo'
  },
  {
    id: 'node-demos',
    name: 'Nodo 2 - Demos / Pruebas (15 Días)',
    url: 'https://irwaqwgpyxjxjsexewze.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlyd2Fxd2dweXhqeGpzZXhld3plIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMjEyMjksImV4cCI6MjEwMzc5NzIyOX0.9JYbgkHhcjngVWZ1vkkh_Ube85lU-nZqwBFLzro81gU'
  }
];


export default async function handler(req, res) {
  // CORS Headers
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

  const rawKey = req.query.key || req.body?.key || req.query.license_key || req.body?.license_key;
  if (!rawKey) {
    return res.status(400).json({
      ok: false,
      message: 'Parámetro obligatorio "key" (clave de licencia) no suministrado.'
    });
  }

  const searchKey = rawKey.toString().trim().toUpperCase();

  // Consultar a través de los nodos disponibles
  for (const node of CLUSTER_NODES) {
    try {
      const client = createClient(node.url, node.anonKey, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });

      const { data: sub, error } = await client
        .from('subscriptions')
        .select(`
          id,
          license_key,
          plan_type,
          status,
          monthly_fee_usd,
          max_boxes,
          start_date,
          expiration_date,
          businesses (
            id,
            name,
            rif_doc,
            phone,
            email,
            contact_person,
            modules_config,
            is_active
          )
        `)
        .eq('license_key', searchKey)
        .maybeSingle();

      if (!error && sub) {
        const expDate = new Date(sub.expiration_date);
        const now = new Date();
        const diffMs = expDate.getTime() - now.getTime();
        const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        
        const isSuspended = sub.status === 'SUSPENDIDA' || (sub.businesses && sub.businesses.is_active === 0);
        const isExpired = daysRemaining <= 0;
        
        let calculatedStatus = 'ACTIVA';
        if (isSuspended) calculatedStatus = 'SUSPENDIDA';
        else if (isExpired) calculatedStatus = 'VENCIDA';

        return res.status(200).json({
          ok: true,
          status: calculatedStatus,
          license_key: sub.license_key,
          business_name: sub.businesses?.name || 'Comercio Registrado',
          rif: sub.businesses?.rif_doc || '',
          contact_person: sub.businesses?.contact_person || '',
          phone: sub.businesses?.phone || '',
          email: sub.businesses?.email || '',
          plan_type: sub.plan_type,
          max_boxes: sub.max_boxes || 1,
          days_remaining: daysRemaining,
          start_date: sub.start_date,
          expiration_date: sub.expiration_date,
          cluster: {
            id: node.id,
            name: node.name,
            supabase_url: node.url,
            supabase_anon_key: node.anonKey
          },
          modules: sub.businesses?.modules_config || {
            cashea: true,
            fiscal_printer: true,
            multi_warehouse: true,
            kardex: true,
            restaurant_tables: false,
            pdf_reports: true,
            whatsapp_receipts: true
          },
          server_time: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn(`Error buscando licencia en nodo ${node.id}:`, err.message);
    }
  }

  return res.status(404).json({
    ok: false,
    message: `La clave de licencia "${searchKey}" no fue encontrada en ningún clúster.`
  });
}
