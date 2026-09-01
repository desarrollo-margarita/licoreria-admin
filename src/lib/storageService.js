import { getSupabaseClient, getNodeClient, createDirectClient } from './supabaseClient';
import { generateLicenseKey } from './licenseUtils';

/**
 * Obtiene todos los comercios y suscripciones directamente desde Supabase Cloud
 */
export const fetchAllBusinesses = async () => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return {
      source: 'unconfigured',
      connected: false,
      data: []
    };
  }

  try {
    const [bizsRes, subsRes, paysRes, devsRes] = await Promise.allSettled([
      supabase.from('businesses').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('payment_date', { ascending: false }),
      supabase.from('pos_devices').select('*')
    ]);

    const bizsData = bizsRes.status === 'fulfilled' && bizsRes.value.data ? bizsRes.value.data : [];
    const subsData = subsRes.status === 'fulfilled' && subsRes.value.data ? subsRes.value.data : [];
    const paysData = paysRes.status === 'fulfilled' && paysRes.value.data ? paysRes.value.data : [];
    const devsData = devsRes.status === 'fulfilled' && devsRes.value.data ? devsRes.value.data : [];

    // Indexar suscripciones por business_id y license_key
    const subsMap = {};
    subsData.forEach(s => {
      if (s.business_id) subsMap[s.business_id] = s;
      if (s.license_key) subsMap[s.license_key] = s;
      if (s.id) subsMap[s.id] = s;
    });

    // Indexar y calcular LTV de pagos por business_id y license_key
    const ltvMap = {};
    const paymentCountMap = {};
    paysData.forEach(p => {
      const keys = [p.business_id, p.license_key].filter(Boolean);
      const amt = parseFloat(p.amount_usd || 0);
      keys.forEach(k => {
        ltvMap[k] = (ltvMap[k] || 0) + amt;
        paymentCountMap[k] = (paymentCountMap[k] || 0) + 1;
      });
    });

    // Indexar dispositivos conectados por license_key
    const devicesCountMap = {};
    devsData.forEach(d => {
      if (d.license_key) {
        devicesCountMap[d.license_key] = (devicesCountMap[d.license_key] || 0) + 1;
      }
    });

    const processedIds = new Set();
    const cloudList = [];

    // Procesar negocios de Supabase
    bizsData.forEach(biz => {
      const sub = subsMap[biz.id] || subsMap[biz.license_key] || {};
      if (sub.id) processedIds.add(sub.id);

      const planType = sub.plan_type || biz.plan_type || biz.plan || 'ANUAL';
      let defaultDays = 365;
      if (planType === 'TRIENAL') defaultDays = 1095;
      if (planType === 'MENSUAL') defaultDays = 365;
      if (planType === 'DEMO') defaultDays = 15;

      const defaultExp = new Date(new Date(biz.created_at || Date.now()).getTime() + defaultDays * 24 * 60 * 60 * 1000);
      const licenseKey = biz.license_key || biz.license || sub.license_key || `VX-${(biz.id || 'DEMO').toString().slice(0, 8).toUpperCase()}`;

      const ltv = ltvMap[biz.id] || ltvMap[licenseKey] || 0;
      const paymentsCount = paymentCountMap[biz.id] || paymentCountMap[licenseKey] || 0;
      const connectedDevices = devicesCountMap[licenseKey] || 0;

      const defaultModules = {
        cashea: true,
        fiscal_printer: true,
        multi_warehouse: true,
        kardex: true,
        restaurant_tables: false,
        pdf_reports: true,
        whatsapp_receipts: true
      };

      cloudList.push({
        id: biz.id || sub.id || Math.random().toString(),
        businessId: biz.id,
        licenseKey,
        businessName: biz.name || biz.business_name || biz.nombre || 'Comercio Registrado',
        rifDoc: biz.rif_doc || biz.rif || biz.documento || 'J-00000000-0',
        phone: biz.phone || biz.telefono || sub.phone || '',
        email: biz.email || biz.correo || sub.email || '',
        contactPerson: biz.contact_person || biz.contacto || '',
        planType,
        nodeId: biz.node_id || 'node-default',
        status: sub.status || biz.status || (biz.is_active === 0 ? 'SUSPENDIDA' : 'ACTIVA'),
        monthlyFeeUsd: parseFloat(sub.monthly_fee_usd || biz.monthly_fee_usd || (planType === 'TRIENAL' ? 150 : planType === 'ANUAL' ? 80 : 50)),
        maxBoxes: parseInt(sub.max_boxes || biz.max_boxes || (planType === 'TRIENAL' ? 3 : planType === 'ANUAL' ? 2 : 1)),
        connectedDevices,
        ltvUsd: ltv,
        paymentsCount,
        distributorName: biz.distributor_name || '',
        distributorCommission: parseFloat(biz.distributor_commission || 0),
        modulesConfig: biz.modules_config ? { ...defaultModules, ...(typeof biz.modules_config === 'string' ? JSON.parse(biz.modules_config) : biz.modules_config) } : defaultModules,
        expirationDate: sub.expiration_date ? new Date(sub.expiration_date).toISOString() : biz.expiration_date ? new Date(biz.expiration_date).toISOString() : defaultExp.toISOString(),
        startDate: sub.start_date ? new Date(sub.start_date).toISOString() : new Date(biz.created_at || Date.now()).toISOString(),
        notes: sub.notes || biz.notes || ''
      });
    });

    // Añadir suscripciones huérfanas si las hubiera
    subsData.forEach(sub => {
      if (!processedIds.has(sub.id)) {
        const licenseKey = sub.license_key || 'VX-PRO-0000';
        const ltv = ltvMap[sub.business_id] || ltvMap[licenseKey] || 0;
        const paymentsCount = paymentCountMap[sub.business_id] || paymentCountMap[licenseKey] || 0;
        const connectedDevices = devicesCountMap[licenseKey] || 0;

        cloudList.push({
          id: sub.id,
          businessId: sub.business_id,
          licenseKey,
          businessName: sub.business_name || sub.notes || 'Comercio Suscrito',
          rifDoc: sub.rif_doc || 'J-00000000-0',
          phone: sub.phone || '',
          email: sub.email || '',
          contactPerson: '',
          planType: sub.plan_type || 'ANUAL',
          status: sub.status || 'ACTIVA',
          monthlyFeeUsd: parseFloat(sub.monthly_fee_usd || 80),
          maxBoxes: parseInt(sub.max_boxes || 2),
          connectedDevices,
          ltvUsd: ltv,
          paymentsCount,
          expirationDate: sub.expiration_date ? new Date(sub.expiration_date).toISOString() : new Date(Date.now() + 365*24*60*60*1000).toISOString(),
          startDate: sub.start_date ? new Date(sub.start_date).toISOString() : new Date().toISOString(),
          notes: sub.notes || ''
        });
      }
    });

    return {
      source: 'supabase',
      connected: true,
      data: cloudList,
      totalRevenueCollected: paysData.reduce((acc, p) => acc + (parseFloat(p.amount_usd) || 0), 0)
    };
  } catch (err) {
    console.warn('Error consultando Supabase:', err);
    return {
      source: 'error',
      connected: false,
      data: [],
      totalRevenueCollected: 0
    };
  }
};

/**
 * Registra un nuevo comercio directamente en Supabase Nube
 */
export const registerBusiness = async ({
  name,
  rif,
  phone,
  contact,
  email,
  planType,
  fee,
  boxes,
  notes,
  nodeId = 'node-default'
}) => {
  const trimmedName = name?.trim() || '';
  const trimmedRif = rif?.trim().toUpperCase() || '';

  if (!trimmedName) {
    throw new Error('El nombre del comercio es obligatorio.');
  }
  if (!trimmedRif) {
    throw new Error('El RIF o documento fiscal es obligatorio.');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('No hay conexión con Supabase configurada. Por favor ve a "Configurar Supabase" e ingresa la URL y la Anon Key de tu proyecto.');
  }

  // 1. Validar que el RIF sea único en la base de datos
  const { data: existingBiz, error: checkErr } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('rif_doc', trimmedRif)
    .maybeSingle();

  if (!checkErr && existingBiz) {
    throw new Error(`Ya existe un comercio registrado con el RIF "${trimmedRif}" (${existingBiz.name}). Utiliza un RIF único.`);
  }

  const licenseKey = generateLicenseKey();
  
  let days = 365;
  if (planType === 'TRIENAL') days = 1095;
  if (planType === 'MENSUAL') days = 365;
  if (planType === 'DEMO') days = 15;

  const startDate = new Date();
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + days);

  const parsedFee = parseFloat(fee);
  const monthlyFeeUsd = !isNaN(parsedFee) && parsedFee >= 0 
    ? parsedFee 
    : (planType === 'TRIENAL' ? 150 : planType === 'ANUAL' ? 80 : planType === 'MENSUAL' ? 50 : 0);

  const maxBoxes = Math.max(1, parseInt(boxes, 10) || 1);

  // 2. Inserción en la tabla 'businesses'
  const { data: bizData, error: bizErr } = await supabase
    .from('businesses')
    .insert({
      name: trimmedName,
      rif_doc: trimmedRif,
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      contact_person: contact?.trim() || null,
      license_key: licenseKey,
      is_active: 1,
      node_id: nodeId || 'node-default'
    })
    .select()
    .single();

  if (bizErr) {
    if (bizErr.code === '23505' || bizErr.message?.includes('duplicate key') || bizErr.message?.includes('unique constraint')) {
      throw new Error(`Ya existe un comercio registrado con el RIF "${trimmedRif}". Por favor utiliza un RIF diferente.`);
    }
    if (bizErr.code === '42501' || bizErr.message?.includes('row-level security')) {
      throw new Error(`Permiso denegado por RLS en Supabase (tabla 'businesses'). Asegúrate de deshabilitar RLS ejecutando el script SQL en Supabase.`);
    }
    if (bizErr.code === '42P01' || bizErr.message?.includes('does not exist')) {
      throw new Error(`Las tablas en Supabase no existen. Abre 'Configurar Supabase' y ejecuta el script SQL en el SQL Editor.`);
    }
    throw new Error(`Error al registrar comercio en Supabase: ${bizErr.message}`);
  }

  // 3. Inserción en la tabla 'subscriptions'
  const subPayload = {
    business_id: bizData.id,
    license_key: licenseKey,
    plan_type: planType || 'ANUAL',
    status: 'ACTIVA',
    monthly_fee_usd: monthlyFeeUsd,
    max_boxes: maxBoxes,
    start_date: startDate.toISOString(),
    expiration_date: expDate.toISOString(),
    last_verified_at: startDate.toISOString(),
    notes: notes?.trim() || null
  };

  const { data: subData, error: subErr } = await supabase
    .from('subscriptions')
    .insert(subPayload)
    .select()
    .single();

  if (subErr) {
    // Revertir inserción del negocio para evitar inconsistencias
    await supabase.from('businesses').delete().eq('id', bizData.id);
    throw new Error(`Error al registrar la suscripción en Supabase: ${subErr.message}`);
  }

  const newRecord = {
    id: bizData.id,
    licenseKey,
    businessName: trimmedName,
    rifDoc: trimmedRif,
    phone: phone?.trim() || '',
    email: email?.trim() || '',
    contactPerson: contact?.trim() || '',
    planType: planType || 'ANUAL',
    status: 'ACTIVA',
    monthlyFeeUsd,
    maxBoxes,
    expirationDate: expDate.toISOString(),
    startDate: startDate.toISOString(),
    notes: notes?.trim() || ''
  };

  return {
    success: true,
    licenseKey,
    record: newRecord,
    supabaseSynced: true
  };
};

/**
 * Extiende la vigencia de una licencia (+30d o +365d) directamente en Supabase
 */
export const extendBusinessLicense = async (licenseKey, extraDays) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no está configurado o conectado.');
  }

  const { data, error: fetchErr } = await supabase
    .from('subscriptions')
    .select('expiration_date')
    .eq('license_key', licenseKey)
    .maybeSingle();

  if (fetchErr || !data) {
    throw new Error(`No se encontró la licencia "${licenseKey}" en Supabase.`);
  }

  const currentExp = data.expiration_date ? new Date(data.expiration_date) : new Date();
  const baseDate = currentExp < new Date() ? new Date() : currentExp;
  baseDate.setDate(baseDate.getDate() + extraDays);

  const { error: updateErr } = await supabase
    .from('subscriptions')
    .update({
      expiration_date: baseDate.toISOString(),
      status: 'ACTIVA',
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (updateErr) {
    throw new Error(`Error al extender licencia en Supabase: ${updateErr.message}`);
  }

  return { success: true, newExpirationDate: baseDate };
};

/**
 * Cambia el plan único de un comercio directamente en Supabase
 */
export const changeBusinessPlan = async (licenseKey, newPlanType) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no está configurado o conectado.');
  }

  let fee = 80.00;
  let boxes = 2;
  let days = 365;

  if (newPlanType === 'TRIENAL') {
    fee = 150.00;
    boxes = 3;
    days = 1095;
  } else if (newPlanType === 'MENSUAL') {
    fee = 50.00;
    boxes = 1;
    days = 365;
  } else if (newPlanType === 'DEMO') {
    fee = 0.00;
    boxes = 1;
    days = 15;
  } else if (newPlanType === 'ANUAL') {
    fee = 80.00;
    boxes = 2;
    days = 365;
  }

  const expDate = new Date();
  expDate.setDate(expDate.getDate() + days);

  const { error: subErr } = await supabase
    .from('subscriptions')
    .update({
      plan_type: newPlanType,
      monthly_fee_usd: fee,
      max_boxes: boxes,
      status: 'ACTIVA',
      expiration_date: expDate.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (subErr) {
    throw new Error(`Error al cambiar plan en Supabase: ${subErr.message}`);
  }

  await supabase
    .from('businesses')
    .update({
      is_active: 1,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  return { success: true, newPlanType, fee, boxes, expirationDate: expDate };
};

/**
 * Suspende o reactiva un comercio directamente en Supabase
 */
export const toggleBusinessStatusInStorage = async (licenseKey, currentStatus) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no está configurado o conectado.');
  }

  const newStatus = currentStatus === 'SUSPENDIDA' ? 'ACTIVA' : 'SUSPENDIDA';

  const { error: subErr } = await supabase
    .from('subscriptions')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (subErr) {
    throw new Error(`Error al cambiar estado en Supabase: ${subErr.message}`);
  }

  await supabase
    .from('businesses')
    .update({
      is_active: newStatus === 'ACTIVA' ? 1 : 0,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  return { success: true, newStatus };
};

/**
 * Actualiza la información completa de un comercio directamente en Supabase
 */
export const updateBusinessInfo = async (licenseKey, updatedData) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no está configurado o conectado.');
  }

  const name = updatedData.businessName?.trim() || '';
  const rif = updatedData.rifDoc?.trim().toUpperCase() || '';
  const phone = updatedData.phone?.trim() || null;
  const email = updatedData.email?.trim() || null;
  const contact = updatedData.contactPerson?.trim() || null;
  const maxBoxes = Math.max(1, parseInt(updatedData.maxBoxes, 10) || 1);
  const fee = parseFloat(updatedData.monthlyFeeUsd) || 80.00;
  const notes = updatedData.notes?.trim() || null;

  // Buscar ID del negocio
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('business_id, id')
    .eq('license_key', licenseKey)
    .maybeSingle();

  if (subData?.business_id) {
    const { error: bizErr } = await supabase
      .from('businesses')
      .update({
        name: name || undefined,
        rif_doc: rif || undefined,
        phone,
        email,
        contact_person: contact,
        updated_at: new Date().toISOString()
      })
      .eq('id', subData.business_id);

    if (bizErr) throw new Error(`Error al actualizar datos del comercio: ${bizErr.message}`);
  } else {
    const { error: bizErr } = await supabase
      .from('businesses')
      .update({
        name: name || undefined,
        rif_doc: rif || undefined,
        phone,
        email,
        contact_person: contact,
        updated_at: new Date().toISOString()
      })
      .eq('license_key', licenseKey);

    if (bizErr) throw new Error(`Error al actualizar datos del comercio: ${bizErr.message}`);
  }

  const { error: subErr } = await supabase
    .from('subscriptions')
    .update({
      max_boxes: maxBoxes,
      monthly_fee_usd: fee,
      notes,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (subErr) throw new Error(`Error al actualizar suscripción: ${subErr.message}`);

  return { success: true };
};

/**
 * Registra un cobro/pago recibido directamente en Supabase
 * y opcionalmente extiende la suscripción de forma automática
 */
export const recordPayment = async ({
  businessId,
  licenseKey,
  amountUsd,
  amountVes,
  paymentMethod,
  referenceCode,
  paymentDate,
  extendDays = 0,
  notes = ''
}) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase no está configurado o conectado.');
  }

  const parsedAmountUsd = parseFloat(amountUsd) || 0;
  const parsedAmountVes = parseFloat(amountVes) || 0;
  const parsedExtendDays = parseInt(extendDays, 10) || 0;

  if (parsedAmountUsd <= 0 && parsedAmountVes <= 0) {
    throw new Error('El monto pagado debe ser mayor a 0.');
  }

  // 1. Obtener business_id si no vino
  let targetBizId = businessId;
  if (!targetBizId && licenseKey) {
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('business_id')
      .eq('license_key', licenseKey)
      .maybeSingle();
    targetBizId = subData?.business_id || null;
  }

  // 2. Insertar en tabla payments
  const paymentPayload = {
    business_id: targetBizId,
    license_key: licenseKey,
    amount_usd: parsedAmountUsd,
    amount_ves: parsedAmountVes,
    payment_method: paymentMethod || 'ZELLE',
    reference_code: referenceCode?.trim() || null,
    payment_date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
    period_extended_days: parsedExtendDays,
    notes: notes?.trim() || null
  };

  const { data: payData, error: payErr } = await supabase
    .from('payments')
    .insert(paymentPayload)
    .select()
    .single();

  if (payErr) {
    if (payErr.code === '42P01' || payErr.message?.includes('does not exist')) {
      throw new Error('La tabla "payments" no existe en Supabase. Abre "Configurar Supabase" y vuelve a ejecutar el script SQL actualizado.');
    }
    throw new Error(`Error al registrar el pago en Supabase: ${payErr.message}`);
  }

  // 3. Si se especificó extensión de vigencia, extender la suscripción
  if (parsedExtendDays > 0 && licenseKey) {
    await extendBusinessLicense(licenseKey, parsedExtendDays);
  }

  return { success: true, payment: payData };
};

/**
 * Obtiene el historial de pagos de un comercio específico
 */
export const fetchBusinessPayments = async (licenseKey, businessId) => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, data: [], error: 'Supabase no está conectado o configurado.' };
  }

  try {
    let query = supabase.from('payments').select('*');
    
    if (licenseKey && businessId) {
      query = query.or(`license_key.eq."${licenseKey}",business_id.eq.${businessId}`);
    } else if (licenseKey) {
      query = query.eq('license_key', licenseKey);
    } else if (businessId) {
      query = query.eq('business_id', businessId);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      // Si la tabla payments no existe en Supabase todavía
      if (
        error.code === '42P01' || 
        error.code === 'PGRST204' ||
        error.code === 'PGRST205' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('relation "public.payments"')
      ) {
        return { 
          success: true, 
          data: [], 
          tableMissing: true, 
          message: 'La tabla "payments" aún no ha sido creada en tu Supabase.' 
        };
      }
      return { success: false, data: [], error: error.message };
    }

    return { success: true, data: data || [], tableMissing: false };
  } catch (err) {
    console.warn('Error consultando historial de pagos:', err);
    return { success: false, data: [], error: err.message };
  }
};

/**
 * Elimina un registro de pago específico
 */
export const deletePayment = async (paymentId) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no conectado.');

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId);

  if (error) throw new Error(`Error al eliminar pago: ${error.message}`);
  return { success: true };
};

/**
 * Resetea y libera las cajas/dispositivos registrados para una licencia
 */
export const resetBusinessDevices = async (licenseKey) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no conectado.');

  try {
    const { error } = await supabase
      .from('pos_devices')
      .delete()
      .eq('license_key', licenseKey);

    if (error && error.code !== '42P01') {
      throw error;
    }

    return { success: true };
  } catch (err) {
    throw new Error(`Error al liberar cajas: ${err.message}`);
  }
};

/**
 * Exporta la lista de comercios a formato CSV con formato compatible para Excel
 */
export const exportBusinessesToCsv = (businesses = []) => {
  if (!businesses || businesses.length === 0) {
    throw new Error('No hay datos para exportar.');
  }

  const headers = [
    'Comercio / Negocio',
    'RIF / Documento',
    'Persona de Contacto',
    'Telefono',
    'Correo Electronico',
    'Clave de Licencia',
    'Plan Comercial',
    'Estado',
    'Cajas Autorizadas',
    'Tarifa USD',
    'Total Pagado LTV (USD)',
    'Fecha de Registro',
    'Fecha de Vencimiento',
    'Dias Restantes',
    'Notas'
  ];

  const rows = businesses.map(b => {
    const expDate = new Date(b.expirationDate);
    const now = new Date();
    const daysLeft = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return [
      `"${(b.businessName || '').replace(/"/g, '""')}"`,
      `"${(b.rifDoc || '').replace(/"/g, '""')}"`,
      `"${(b.contactPerson || '').replace(/"/g, '""')}"`,
      `"${(b.phone || '').replace(/"/g, '""')}"`,
      `"${(b.email || '').replace(/"/g, '""')}"`,
      `"${(b.licenseKey || '').replace(/"/g, '""')}"`,
      `"${b.planType || ''}"`,
      `"${b.status || ''}"`,
      b.maxBoxes || 1,
      parseFloat(b.monthlyFeeUsd || 0).toFixed(2),
      parseFloat(b.ltvUsd || 0).toFixed(2),
      `"${b.startDate ? new Date(b.startDate).toLocaleDateString() : ''}"`,
      `"${expDate.toLocaleDateString()}"`,
      daysLeft,
      `"${(b.notes || '').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `VentroX_Clientes_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

// ============================================================================
// NUEVAS FUNCIONALIDADES SAAS: CONFIGURACIÓN GLOBAL, AUDITORÍA, TICKETS Y MÓDULOS
// ============================================================================

/**
 * 1. Obtiene la configuración global del ecosistema (Tasa BCV, Versión POS, Mantenimiento)
 */
export const fetchGlobalConfig = async () => {
  const supabase = getSupabaseClient();
  const fallback = {
    bcvRate: 65.50,
    minPosVersion: '1.0.0',
    maintenanceMode: false,
    maintenanceMessage: 'Sistema en mantenimiento preventivo. Volvemos en breve.',
    updatedAt: new Date().toISOString()
  };

  if (!supabase) {
    try {
      const stored = localStorage.getItem('vx_global_config');
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  try {
    const { data, error } = await supabase
      .from('global_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data) {
      const stored = localStorage.getItem('vx_global_config');
      return stored ? JSON.parse(stored) : fallback;
    }

    return {
      bcvRate: parseFloat(data.bcv_rate || 65.50),
      minPosVersion: data.min_pos_version || '1.0.0',
      maintenanceMode: !!data.maintenance_mode,
      maintenanceMessage: data.maintenance_message || fallback.maintenanceMessage,
      updatedAt: data.updated_at || new Date().toISOString()
    };
  } catch {
    return fallback;
  }
};

/**
 * Guarda la configuración global en Supabase y localmente
 */
export const saveGlobalConfig = async (config) => {
  const payload = {
    id: 1,
    bcv_rate: parseFloat(config.bcvRate) || 65.50,
    min_pos_version: config.minPosVersion || '1.0.0',
    maintenance_mode: !!config.maintenanceMode,
    maintenance_message: config.maintenanceMessage || 'Mantenimiento preventivo.',
    updated_at: new Date().toISOString()
  };

  try {
    localStorage.setItem('vx_global_config', JSON.stringify(config));
  } catch (e) {
    console.warn(e);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('global_config').upsert(payload);
  }

  // Registrar auditoría
  await logAuditEvent({
    actionType: 'CONFIG_GLOBAL_MODIFICADA',
    description: `Tasa BCV: ${payload.bcv_rate} | Mantenimiento: ${payload.maintenance_mode ? 'ACTIVO' : 'INACTIVO'} | Versión Mínima: ${payload.min_pos_version}`
  });

  return { success: true };
};

/**
 * 2. Bitácora de Auditoría SuperAdmin
 */
export const fetchAuditLogs = async (limit = 100) => {
  const supabase = getSupabaseClient();
  const localLogs = (() => {
    try {
      return JSON.parse(localStorage.getItem('vx_audit_logs') || '[]');
    } catch {
      return [];
    }
  })();

  if (!supabase) return localLogs;

  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return localLogs;

    return data.map(l => ({
      id: l.id,
      userName: l.user_name || 'Admin',
      userRole: l.user_role || 'superadmin',
      actionType: l.action_type || 'ACCION',
      description: l.description || '',
      targetBusiness: l.target_business || '',
      metadata: l.metadata || null,
      createdAt: l.created_at || new Date().toISOString()
    }));
  } catch {
    return localLogs;
  }
};

export const logAuditEvent = async ({
  userName = 'Admin',
  userRole = 'superadmin',
  actionType = 'ACCION',
  description = '',
  targetBusiness = '',
  metadata = null
}) => {
  const logEntry = {
    id: Date.now().toString(),
    user_name: userName,
    user_role: userRole,
    action_type: actionType,
    description,
    target_business: targetBusiness,
    metadata,
    created_at: new Date().toISOString()
  };

  // Guardar localmente
  try {
    const existing = JSON.parse(localStorage.getItem('vx_audit_logs') || '[]');
    existing.unshift(logEntry);
    localStorage.setItem('vx_audit_logs', JSON.stringify(existing.slice(0, 200)));
  } catch (e) {
    console.warn(e);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('audit_logs').insert(logEntry);
    } catch {
      // Silencioso si la tabla no existe aún
    }
  }
};

/**
 * 3. Mesa de Ayuda y Tickets de Soporte
 */
export const fetchSupportTickets = async () => {
  const supabase = getSupabaseClient();
  const localTickets = (() => {
    try {
      return JSON.parse(localStorage.getItem('vx_support_tickets') || '[]');
    } catch {
      return [];
    }
  })();

  if (!supabase) return localTickets;

  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return localTickets;

    return data.map(t => ({
      id: t.id,
      businessId: t.business_id,
      licenseKey: t.license_key,
      businessName: t.business_name,
      contactPhone: t.contact_phone || '',
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'MEDIA',
      status: t.status || 'ABIERTO',
      assignedTo: t.assigned_to || 'Soporte',
      resolutionNotes: t.resolution_notes || '',
      createdAt: t.created_at,
      resolvedAt: t.resolved_at
    }));
  } catch {
    return localTickets;
  }
};

export const createSupportTicket = async (ticketData) => {
  const newTicket = {
    business_id: ticketData.businessId || null,
    license_key: ticketData.licenseKey || 'S/L',
    business_name: ticketData.businessName || 'Comercio',
    contact_phone: ticketData.contactPhone || '',
    title: ticketData.title,
    description: ticketData.description || '',
    priority: ticketData.priority || 'MEDIA',
    status: 'ABIERTO',
    assigned_to: ticketData.assignedTo || 'Soporte',
    created_at: new Date().toISOString()
  };

  // Local
  try {
    const existing = JSON.parse(localStorage.getItem('vx_support_tickets') || '[]');
    existing.unshift({ id: Date.now(), ...newTicket });
    localStorage.setItem('vx_support_tickets', JSON.stringify(existing));
  } catch (e) {
    console.warn(e);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.from('support_tickets').insert(newTicket).select().single();
    if (error) console.warn('Ticket error Supabase:', error);
    return data;
  }

  return newTicket;
};

export const updateSupportTicketStatus = async (ticketId, { status, resolutionNotes, assignedTo }) => {
  const updates = {
    status,
    resolution_notes: resolutionNotes,
    assigned_to: assignedTo,
    resolved_at: status === 'RESUELTO' ? new Date().toISOString() : null
  };

  // Local
  try {
    const existing = JSON.parse(localStorage.getItem('vx_support_tickets') || '[]');
    const idx = existing.findIndex(t => t.id === ticketId || t.id === Number(ticketId));
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...updates };
      localStorage.setItem('vx_support_tickets', JSON.stringify(existing));
    }
  } catch (e) {
    console.warn(e);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('support_tickets').update(updates).eq('id', ticketId);
  }

  return { success: true };
};

export const deleteSupportTicket = async (ticketId) => {
  // Local
  try {
    const existing = JSON.parse(localStorage.getItem('vx_support_tickets') || '[]');
    const filtered = existing.filter(t => t.id !== ticketId && t.id !== Number(ticketId));
    localStorage.setItem('vx_support_tickets', JSON.stringify(filtered));
  } catch (e) {
    console.warn(e);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    await supabase.from('support_tickets').delete().eq('id', ticketId);
  }

  return { success: true };
};

/**
 * 4. Actualiza la configuración de módulos (Feature Flags) de un comercio
 */
export const updateBusinessModules = async (businessId, licenseKey, modulesConfig) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('businesses')
    .update({ 
      modules_config: modulesConfig,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (error) {
    // Si la columna no existe aún
    if (error.code === '42703' || error.message?.includes('modules_config')) {
      throw new Error('La columna "modules_config" no existe en Supabase. Ejecuta el script SQL en "Configurar Supabase".');
    }
    throw new Error(`Error al guardar módulos: ${error.message}`);
  }

  await logAuditEvent({
    actionType: 'MODULOS_ACTUALIZADOS',
    description: `Configuración de módulos modificada para ${licenseKey}`,
    targetBusiness: licenseKey,
    metadata: modulesConfig
  });

  return { success: true };
};

/**
 * 5. Actualiza el distribuidor / promotor asignado a un comercio
 */
export const updateBusinessDistributor = async (businessId, licenseKey, distributorName, distributorCommission) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('businesses')
    .update({
      distributor_name: distributorName?.trim() || null,
      distributor_commission: parseFloat(distributorCommission) || 0.00,
      updated_at: new Date().toISOString()
    })
    .eq('license_key', licenseKey);

  if (error) {
    throw new Error(`Error al actualizar distribuidor: ${error.message}`);
  }

  await logAuditEvent({
    actionType: 'DISTRIBUIDOR_ACTUALIZADO',
    description: `Distribuidor "${distributorName}" asignado a ${licenseKey} (Comisión: $${distributorCommission})`,
    targetBusiness: licenseKey
  });

  return { success: true };
};

/**
 * 6. Portal de Pagos Express del Cliente & Aprobación por SuperAdmin
 */
export const submitClientExpressPayment = async ({
  licenseKey,
  businessName,
  amountUsd,
  amountVes,
  paymentMethod,
  referenceCode,
  notes,
  proofUrl
}) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no está disponible.');

  const parsedAmountUsd = parseFloat(amountUsd) || 0;
  const parsedAmountVes = parseFloat(amountVes) || 0;

  const paymentPayload = {
    license_key: licenseKey,
    amount_usd: parsedAmountUsd,
    amount_ves: parsedAmountVes,
    payment_method: paymentMethod || 'PAGO_MOVIL',
    reference_code: referenceCode?.trim() || 'REF-EXPRESS',
    receipt_number: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`,
    status: 'PENDING_VERIFICATION',
    proof_url: proofUrl || null,
    payment_date: new Date().toISOString(),
    notes: notes?.trim() || 'Reportado desde Portal Express de Cliente'
  };

  const { data, error } = await supabase.from('payments').insert(paymentPayload).select().single();
  if (error) throw new Error(`Error al reportar pago: ${error.message}`);

  return { success: true, payment: data };
};

/**
 * Aprueba un pago reportado por el cliente
 */
export const approvePendingPayment = async (paymentId, businessId, licenseKey, extendDays = 30) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'APPROVED',
      period_extended_days: extendDays
    })
    .eq('id', paymentId);

  if (error) throw new Error(`Error aprobando pago: ${error.message}`);

  // Extender suscripción
  if (licenseKey && extendDays > 0) {
    await extendBusinessLicense(licenseKey, extendDays);
  }

  await logAuditEvent({
    actionType: 'PAGO_APROBADO',
    description: `Pago #${paymentId} aprobado con extensión de ${extendDays} días para ${licenseKey}`,
    targetBusiness: licenseKey
  });

  return { success: true };
};

/**
 * Rechaza un pago reportado
 */
export const rejectPendingPayment = async (paymentId, licenseKey, reason = '') => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('payments')
    .update({ 
      status: 'REJECTED',
      notes: reason ? `RECHAZADO: ${reason}` : 'Pago rechazado por el administrador'
    })
    .eq('id', paymentId);

  if (error) throw new Error(`Error rechazando pago: ${error.message}`);

  await logAuditEvent({
    actionType: 'PAGO_RECHAZADO',
    description: `Pago #${paymentId} rechazado para ${licenseKey}. Motivo: ${reason}`,
    targetBusiness: licenseKey
  });

  return { success: true };
};

/**
 * 7. Telemetría global de todas las cajas POS
 */
export const fetchAllTelemetryDevices = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data: devices, error } = await supabase
      .from('pos_devices')
      .select('*')
      .order('last_seen_at', { ascending: false });

    if (error || !devices) return [];

    return devices.map(d => ({
      id: d.id,
      businessId: d.business_id,
      licenseKey: d.license_key,
      deviceId: d.device_id,
      machineName: d.machine_name || 'Caja Registradora',
      osInfo: d.os_info || 'Windows POS',
      appVersion: d.app_version || '1.0.0',
      lastSeenAt: d.last_seen_at || d.created_at
    }));
  } catch {
    return [];
  }
};

/**
 * 8. Actualizar nodo/clúster asignado a un comercio
 */
export const updateBusinessNode = async (licenseKey, newNodeId) => {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase no configurado.');

  const { error } = await supabase
    .from('businesses')
    .update({ node_id: newNodeId })
    .eq('license_key', licenseKey);

  if (error) throw new Error(`Error actualizando nodo del comercio: ${error.message}`);

  await logAuditEvent({
    actionType: 'CAMBIO_NODO_DATABASE',
    description: `Comercio ${licenseKey} reasignado al nodo ${newNodeId}`,
    targetBusiness: licenseKey
  });

  return { success: true };
};

/**
 * 9. Exportar copia de seguridad completa (JSON) de la base de datos
 */
export const exportFullDatabaseBackup = async (sourceNodeId = 'node-default') => {
  const client = getNodeClient(sourceNodeId);
  if (!client) throw new Error('No se pudo conectar al nodo seleccionado para el backup.');

  const tables = [
    'businesses',
    'subscriptions',
    'payments',
    'pos_devices',
    'support_tickets',
    'audit_logs',
    'global_config'
  ];

  const backupData = {
    metadata: {
      appName: 'VentroX SuperAdmin SaaS',
      version: '1.1.0',
      exportDate: new Date().toISOString(),
      sourceNodeId
    },
    tables: {}
  };

  for (const table of tables) {
    try {
      const { data, error } = await client.from(table).select('*');
      if (!error && data) {
        backupData.tables[table] = data;
      } else {
        backupData.tables[table] = [];
      }
    } catch {
      backupData.tables[table] = [];
    }
  }

  return backupData;
};

/**
 * 10. Restaurar copia de seguridad completa (JSON) en un nodo destino
 */
export const restoreFullDatabaseBackup = async (backupData, targetNodeId = 'node-default', onProgress = () => {}) => {
  const client = getNodeClient(targetNodeId);
  if (!client) throw new Error('No se pudo conectar al nodo destino para la restauración.');

  if (!backupData || !backupData.tables) {
    throw new Error('El archivo de copia de seguridad no tiene una estructura JSON válida.');
  }

  const tableOrder = [
    'businesses',
    'subscriptions',
    'payments',
    'pos_devices',
    'support_tickets',
    'audit_logs',
    'global_config'
  ];

  const totalSteps = tableOrder.length;
  let currentStep = 0;
  const summary = {};

  for (const table of tableOrder) {
    currentStep++;
    const rows = backupData.tables[table] || [];

    onProgress({
      step: currentStep,
      totalSteps,
      currentTable: table,
      percentage: Math.round((currentStep / totalSteps) * 100),
      message: `Restaurando tabla ${table} (${rows.length} registros)...`
    });

    if (rows.length > 0) {
      // Insertar/actualizar en lotes de 50
      const batchSize = 50;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await client.from(table).upsert(batch, { onConflict: table === 'global_config' ? 'key' : 'id' });
        if (!error) {
          inserted += batch.length;
        } else {
          console.warn(`Error restaurando lote en ${table}:`, error);
        }
      }
      summary[table] = inserted;
    } else {
      summary[table] = 0;
    }
  }

  await logAuditEvent({
    actionType: 'RESTAURACION_BACKUP_JSON',
    description: `Copia de seguridad restaurada en nodo ${targetNodeId}. Tablas: ${Object.keys(summary).length}`,
    targetBusiness: 'SISTEMA_GLOBAL'
  });

  return { success: true, summary };
};

/**
 * 11. Migrador Asistido Cloud-to-Cloud de Supabase
 */
export const migrateDatabase = async ({
  sourceUrl,
  sourceKey,
  targetUrl,
  targetKey,
  onProgress = () => {}
}) => {
  const sourceClient = createDirectClient(sourceUrl, sourceKey);
  const targetClient = createDirectClient(targetUrl, targetKey);

  if (!sourceClient) throw new Error('Credenciales del proyecto Supabase Origen no válidas.');
  if (!targetClient) throw new Error('Credenciales del proyecto Supabase Destino no válidas.');

  const tableOrder = [
    { name: 'businesses', label: 'Comercios & Licencias', conflictCol: 'id' },
    { name: 'subscriptions', label: 'Suscripciones POS', conflictCol: 'id' },
    { name: 'payments', label: 'Historial de Pagos & Cobranzas', conflictCol: 'id' },
    { name: 'pos_devices', label: 'Cajas POS & Telemetría', conflictCol: 'id' },
    { name: 'support_tickets', label: 'Tickets de Soporte', conflictCol: 'id' },
    { name: 'audit_logs', label: 'Bitácora de Auditoría', conflictCol: 'id' },
    { name: 'global_config', label: 'Parámetros Globales & BCV', conflictCol: 'key' }
  ];

  const totalSteps = tableOrder.length;
  let currentStep = 0;
  const migrationSummary = {};

  for (const t of tableOrder) {
    currentStep++;
    onProgress({
      step: currentStep,
      totalSteps,
      currentTable: t.name,
      tableLabel: t.label,
      percentage: Math.round((currentStep / totalSteps) * 100),
      message: `Extrayendo y transfiriendo ${t.label} (${t.name})...`
    });

    // 1. Extraer del origen
    const { data: rows, error: sourceErr } = await sourceClient
      .from(t.name)
      .select('*');

    if (sourceErr) {
      console.warn(`No se pudo leer la tabla ${t.name} del origen:`, sourceErr.message);
      migrationSummary[t.name] = { count: 0, status: 'SKIPPED_OR_EMPTY' };
      continue;
    }

    if (rows && rows.length > 0) {
      // 2. Insertar en destino en lotes
      const batchSize = 50;
      let insertedCount = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error: targetErr } = await targetClient
          .from(t.name)
          .upsert(batch, { onConflict: t.conflictCol });

        if (!targetErr) {
          insertedCount += batch.length;
        } else {
          console.error(`Error insertando en ${t.name} destino:`, targetErr);
          throw new Error(`Error en destino tabla ${t.name}: ${targetErr.message}. Asegúrate de haber ejecutado el script SQL en el proyecto destino.`);
        }
      }

      migrationSummary[t.name] = { count: insertedCount, status: 'SUCCESS' };
    } else {
      migrationSummary[t.name] = { count: 0, status: 'EMPTY' };
    }
  }

  await logAuditEvent({
    actionType: 'MIGRACION_DATABASE_CLOUD',
    description: `Migración asistida completada de ${sourceUrl} hacia ${targetUrl}`,
    targetBusiness: 'MIGRACION_HUB'
  });

  return {
    success: true,
    summary: migrationSummary,
    completedAt: new Date().toISOString()
  };
};



