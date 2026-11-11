import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import { normalizeEngineNumber } from '../utils/engineNormalizer.js';
import {
  INITIAL_OFFICES,
  INITIAL_USERS,
  INITIAL_FARMERS,
  INITIAL_GROUPS,
  INITIAL_PRODUCTS,
  INITIAL_SUBSIDIES,
  INITIAL_DUPLICATE_ALERTS,
  INITIAL_AUDIT_LOGS
} from './mockData.js';

// Local storage keys for demo persistence
const STORAGE_KEYS = {
  OFFICES: 'namr_offices_v1',
  USERS: 'namr_users_v1',
  FARMERS: 'namr_farmers_v1',
  GROUPS: 'namr_groups_v1',
  PRODUCTS: 'namr_products_v1',
  SUBSIDIES: 'namr_subsidies_v1',
  DUPLICATE_ALERTS: 'namr_duplicate_alerts_v1',
  AUDIT_LOGS: 'namr_audit_logs_v1'
};

function getLocal(key, initial) {
  try {
    if (typeof localStorage === 'undefined') return initial;
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  } catch {
    return initial;
  }
}

function setLocal(key, data) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage quota exceeded or error:', e);
  }
}

// In-memory data store initialized from LocalStorage or mockData
let localStore = {
  offices: getLocal(STORAGE_KEYS.OFFICES, INITIAL_OFFICES),
  users: getLocal(STORAGE_KEYS.USERS, INITIAL_USERS),
  farmers: getLocal(STORAGE_KEYS.FARMERS, INITIAL_FARMERS),
  groups: getLocal(STORAGE_KEYS.GROUPS, INITIAL_GROUPS),
  products: getLocal(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
  subsidies: getLocal(STORAGE_KEYS.SUBSIDIES, INITIAL_SUBSIDIES),
  duplicateAlerts: getLocal(STORAGE_KEYS.DUPLICATE_ALERTS, INITIAL_DUPLICATE_ALERTS),
  auditLogs: getLocal(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS)
};

export function resetDemoDatabase() {
  localStorage.removeItem(STORAGE_KEYS.OFFICES);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.FARMERS);
  localStorage.removeItem(STORAGE_KEYS.GROUPS);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.SUBSIDIES);
  localStorage.removeItem(STORAGE_KEYS.DUPLICATE_ALERTS);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);

  localStore = {
    offices: [...INITIAL_OFFICES],
    users: [...INITIAL_USERS],
    farmers: [...INITIAL_FARMERS],
    groups: [...INITIAL_GROUPS],
    products: [...INITIAL_PRODUCTS],
    subsidies: [...INITIAL_SUBSIDIES],
    duplicateAlerts: [...INITIAL_DUPLICATE_ALERTS],
    auditLogs: [...INITIAL_AUDIT_LOGS]
  };

  setLocal(STORAGE_KEYS.OFFICES, localStore.offices);
  setLocal(STORAGE_KEYS.USERS, localStore.users);
  setLocal(STORAGE_KEYS.FARMERS, localStore.farmers);
  setLocal(STORAGE_KEYS.GROUPS, localStore.groups);
  setLocal(STORAGE_KEYS.PRODUCTS, localStore.products);
  setLocal(STORAGE_KEYS.SUBSIDIES, localStore.subsidies);
  setLocal(STORAGE_KEYS.DUPLICATE_ALERTS, localStore.duplicateAlerts);
  setLocal(STORAGE_KEYS.AUDIT_LOGS, localStore.auditLogs);
}

// Generate standard UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Universal Cross-Nepal Engine Number Checker
 * Available to all logged-in users regardless of jurisdiction level
 */
export async function checkEngineNumber(engineNo) {
  const normalized = normalizeEngineNumber(engineNo);
  if (!normalized) {
    return { exists: false, message: 'Please provide an engine number' };
  }

  // 1. Live Supabase RPC if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('check_engine_number', {
        search_engine: normalized
      });
      if (!error && data) return data;
    } catch (e) {
      console.warn('Supabase RPC fallback to local check:', e);
    }
  }

  // 2. Local verification logic (exact mirror of SQL stored procedure)
  const product = localStore.products.find(
    p => normalizeEngineNumber(p.engine_number) === normalized && !p.is_deleted
  );

  if (!product) {
    return {
      exists: false,
      engine_number: normalized,
      message: 'Engine number is clear. No subsidy recorded for this machine across Nepal.'
    };
  }

  const activeSubsidy = localStore.subsidies.find(
    s => s.product_id === product.id && !s.is_deleted
  );

  if (activeSubsidy) {
    const office = localStore.offices.find(o => o.id === activeSubsidy.office_id) || {};
    const farmer = localStore.farmers.find(f => f.id === activeSubsidy.farmer_id) || {};

    return {
      exists: true,
      has_subsidy: true,
      engine_number: product.engine_number,
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      brand: product.brand,
      model_no: product.model_no,
      subsidy_id: activeSubsidy.id,
      subsidy_year_bs: activeSubsidy.subsidy_year_bs,
      amount: activeSubsidy.amount,
      office_id: office.id,
      office_name: office.name,
      government_level: office.government_level,
      province: office.province,
      district: office.district,
      municipality: office.municipality,
      farmer_id: farmer.id,
      farmer_name: farmer.name,
      farmer_district: farmer.district,
      created_at: activeSubsidy.created_at
    };
  }

  return {
    exists: true,
    has_subsidy: false,
    engine_number: product.engine_number,
    product_id: product.id,
    product_name: product.name,
    category: product.category,
    brand: product.brand,
    model_no: product.model_no
  };
}

/**
 * Log Audit Trail Entry
 */
export async function addAuditLog(entry) {
  const log = {
    id: generateUUID(),
    user_id: entry.user_id,
    user_name: entry.user_name || 'System User',
    action: entry.action, // CREATE, UPDATE, DELETE, DUPLICATE_FLAG, LOGIN
    table_name: entry.table_name,
    record_id: entry.record_id,
    old_values: entry.old_values || null,
    new_values: entry.new_values || null,
    created_at: new Date().toISOString()
  };

  localStore.auditLogs.unshift(log);
  setLocal(STORAGE_KEYS.AUDIT_LOGS, localStore.auditLogs);

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('audit_log').insert([{
        user_id: entry.user_id,
        action: entry.action,
        table_name: entry.table_name,
        record_id: entry.record_id,
        old_values: entry.old_values,
        new_values: entry.new_values
      }]);
    } catch (e) {
      console.warn('Supabase audit log insert error:', e);
    }
  }

  return log;
}

/**
 * Automatic Duplicate Alert Creation
 */
export async function createDuplicateAlert(alertData) {
  const newAlert = {
    id: generateUUID(),
    engine_number: normalizeEngineNumber(alertData.engine_number),
    product_id: alertData.product_id || null,
    existing_subsidy_id: alertData.existing_subsidy_id || null,
    attempted_by: alertData.attempted_by || null,
    attempted_office_id: alertData.attempted_office_id || null,
    attempt_type: alertData.attempt_type || 'same_engine_in_new_subsidy',
    status: 'open',
    resolved_by: null,
    resolution_note: null,
    created_at: new Date().toISOString(),
    resolved_at: null
  };

  localStore.duplicateAlerts.unshift(newAlert);
  setLocal(STORAGE_KEYS.DUPLICATE_ALERTS, localStore.duplicateAlerts);

  // Record into audit log
  await addAuditLog({
    user_id: alertData.attempted_by,
    user_name: alertData.attempted_user_name,
    action: 'DUPLICATE_FLAG',
    table_name: 'duplicate_alerts',
    record_id: newAlert.id,
    new_values: {
      engine_number: newAlert.engine_number,
      attempt_type: newAlert.attempt_type,
      office_id: newAlert.attempted_office_id,
      existing_subsidy_id: newAlert.existing_subsidy_id
    }
  });

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('duplicate_alerts').insert([newAlert]);
    } catch (e) {
      console.warn('Supabase duplicate alert insert error:', e);
    }
  }

  return newAlert;
}

/**
 * Create Subsidy with Strict Duplicate Enforcement
 */
export async function createSubsidy({ farmerData, productData, subsidyData, currentUser }) {
  const normalizedEngine = normalizeEngineNumber(productData.engine_number);

  // 1. Live Duplicate Check
  const check = await checkEngineNumber(normalizedEngine);

  if (check.exists && check.has_subsidy) {
    // Machine already subsidized! Trigger fraud alert automatically
    await createDuplicateAlert({
      engine_number: normalizedEngine,
      product_id: check.product_id,
      existing_subsidy_id: check.subsidy_id,
      attempted_by: currentUser?.id,
      attempted_user_name: currentUser?.full_name,
      attempted_office_id: currentUser?.office_id,
      attempt_type: 'same_engine_in_new_subsidy'
    });

    const error = new Error(
      `DUPLICATE_ENGINE_ERROR: Machine with Engine Number "${normalizedEngine}" was already subsidized by office "${check.office_name}" in Fiscal Year ${check.subsidy_year_bs} for farmer "${check.farmer_name}". This violation has been automatically logged to Duplicate Alerts.`
    );
    error.duplicateDetails = check;
    throw error;
  }

  // 2. Resolve or Create Farmer
  let farmerId = farmerData.id;
  if (!farmerId) {
    const newFarmer = {
      id: generateUUID(),
      name: farmerData.name.trim(),
      father_name: farmerData.father_name?.trim() || '',
      grandfather_name: farmerData.grandfather_name?.trim() || '',
      citizenship_no: farmerData.citizenship_no?.trim() || '',
      phone: farmerData.phone?.trim() || '',
      province: farmerData.province,
      district: farmerData.district,
      municipality: farmerData.municipality,
      ward: farmerData.ward || '',
      tole: farmerData.tole || '',
      created_by: currentUser?.id,
      is_deleted: false,
      created_at: new Date().toISOString()
    };
    localStore.farmers.unshift(newFarmer);
    setLocal(STORAGE_KEYS.FARMERS, localStore.farmers);
    farmerId = newFarmer.id;
    await addAuditLog({
      user_id: currentUser?.id,
      user_name: currentUser?.full_name,
      action: 'CREATE',
      table_name: 'farmers',
      record_id: farmerId,
      new_values: newFarmer
    });
  }

  // 3. Resolve or Create Product
  let productId = check.product_id;
  if (!productId) {
    const newProduct = {
      id: generateUUID(),
      category: productData.category,
      name: productData.name.trim(),
      brand: productData.brand.trim(),
      model_no: productData.model_no?.trim() || '',
      engine_number: normalizedEngine,
      chassis_no: productData.chassis_no?.trim() || '',
      photo_urls: productData.photo_urls || [],
      created_by: currentUser?.id,
      is_deleted: false,
      created_at: new Date().toISOString()
    };
    localStore.products.unshift(newProduct);
    setLocal(STORAGE_KEYS.PRODUCTS, localStore.products);
    productId = newProduct.id;
    await addAuditLog({
      user_id: currentUser?.id,
      user_name: currentUser?.full_name,
      action: 'CREATE',
      table_name: 'products',
      record_id: productId,
      new_values: newProduct
    });
  }

  // 4. Create Subsidy Entry
  const newSubsidy = {
    id: generateUUID(),
    product_id: productId,
    farmer_id: farmerId,
    group_id: subsidyData.group_id || null,
    office_id: currentUser?.office_id || subsidyData.office_id,
    entered_by: currentUser?.id,
    subsidy_year_bs: subsidyData.subsidy_year_bs,
    subsidy_year_ad: Number(subsidyData.subsidy_year_ad) || new Date().getFullYear(),
    amount: Number(subsidyData.amount) || 0,
    percentage: Number(subsidyData.percentage) || 50,
    remarks: subsidyData.remarks || '',
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  localStore.subsidies.unshift(newSubsidy);
  setLocal(STORAGE_KEYS.SUBSIDIES, localStore.subsidies);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'CREATE',
    table_name: 'subsidies',
    record_id: newSubsidy.id,
    new_values: newSubsidy
  });

  return newSubsidy;
}

/**
 * Soft Delete Subsidy
 */
export async function deleteSubsidy(id, currentUser) {
  const subsidyIndex = localStore.subsidies.findIndex(s => s.id === id);
  if (subsidyIndex === -1) throw new Error('Subsidy record not found.');

  const oldSubsidy = { ...localStore.subsidies[subsidyIndex] };
  localStore.subsidies[subsidyIndex].is_deleted = true;
  localStore.subsidies[subsidyIndex].updated_at = new Date().toISOString();
  setLocal(STORAGE_KEYS.SUBSIDIES, localStore.subsidies);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'DELETE',
    table_name: 'subsidies',
    record_id: id,
    old_values: oldSubsidy,
    new_values: { is_deleted: true }
  });

  return true;
}

/**
 * Filter Subsidies with Row-Level Security Jurisdiction Rules
 */
export async function getSubsidies(filters = {}, currentUser) {
  let list = localStore.subsidies.filter(s => !s.is_deleted);

  // RLS Jurisdiction enforcement
  if (currentUser) {
    const userOffice = localStore.offices.find(o => o.id === currentUser.office_id);
    if (currentUser.role !== 'super_admin' && userOffice) {
      if (userOffice.government_level === 2) {
        // Provincial: only records in user's province
        list = list.filter(s => {
          const office = localStore.offices.find(o => o.id === s.office_id);
          return office && office.province === userOffice.province;
        });
      } else if (userOffice.government_level === 3) {
        // Local: only records in user's municipality
        list = list.filter(s => {
          const office = localStore.offices.find(o => o.id === s.office_id);
          return office && office.municipality === userOffice.municipality;
        });
      }
    }
  }

  // Populate related objects
  const enriched = list.map(s => {
    const product = localStore.products.find(p => p.id === s.product_id) || {};
    const farmer = localStore.farmers.find(f => f.id === s.farmer_id) || {};
    const office = localStore.offices.find(o => o.id === s.office_id) || {};
    const group = localStore.groups.find(g => g.id === s.group_id) || null;
    const user = localStore.users.find(u => u.id === s.entered_by) || {};

    return {
      ...s,
      product,
      farmer,
      office,
      group,
      entered_by_user: user
    };
  });

  // Apply filters
  let filtered = enriched;

  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.product.engine_number?.toLowerCase().includes(q) ||
      item.product.name?.toLowerCase().includes(q) ||
      item.product.brand?.toLowerCase().includes(q) ||
      item.farmer.name?.toLowerCase().includes(q) ||
      item.farmer.phone?.includes(q) ||
      item.farmer.citizenship_no?.toLowerCase().includes(q) ||
      item.office.name?.toLowerCase().includes(q)
    );
  }

  if (filters.year) {
    filtered = filtered.filter(item => item.subsidy_year_bs === filters.year);
  }

  if (filters.category) {
    filtered = filtered.filter(item => item.product.category === filters.category);
  }

  if (filters.province) {
    filtered = filtered.filter(item => item.office.province === filters.province);
  }

  if (filters.office_id) {
    filtered = filtered.filter(item => item.office_id === filters.office_id);
  }

  return filtered;
}

/**
 * Get Subsidy Detail by ID
 */
export async function getSubsidyById(id) {
  const s = localStore.subsidies.find(sub => sub.id === id);
  if (!s) return null;

  const product = localStore.products.find(p => p.id === s.product_id) || {};
  const farmer = localStore.farmers.find(f => f.id === s.farmer_id) || {};
  const office = localStore.offices.find(o => o.id === s.office_id) || {};
  const group = localStore.groups.find(g => g.id === s.group_id) || null;
  const user = localStore.users.find(u => u.id === s.entered_by) || {};

  return {
    ...s,
    product,
    farmer,
    office,
    group,
    entered_by_user: user
  };
}

/**
 * Dashboard Metrics and Chart Aggregations
 */
export async function getDashboardStats(currentUser) {
  const subsidies = await getSubsidies({}, currentUser);
  const activeAlerts = localStore.duplicateAlerts.filter(a => a.status === 'open');

  const uniqueFarmerIds = new Set(subsidies.map(s => s.farmer_id));
  const totalAmount = subsidies.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Group by Fiscal Year
  const yearCounts = {};
  subsidies.forEach(s => {
    yearCounts[s.subsidy_year_bs] = (yearCounts[s.subsidy_year_bs] || 0) + 1;
  });

  // Group by Province
  const provinceCounts = {};
  subsidies.forEach(s => {
    const prov = s.office?.province || 'Other';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });

  // Group by Category
  const categoryCounts = {};
  subsidies.forEach(s => {
    const cat = s.product?.category || 'Other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Group by Government Level
  const levelCounts = { Federal: 0, Provincial: 0, Local: 0 };
  subsidies.forEach(s => {
    const lvl = s.office?.government_level;
    if (lvl === 1) levelCounts.Federal++;
    else if (lvl === 2) levelCounts.Provincial++;
    else if (lvl === 3) levelCounts.Local++;
  });

  // Enriched duplicate alerts for red alert section
  const enrichedAlerts = localStore.duplicateAlerts.map(a => {
    const product = localStore.products.find(p => p.id === a.product_id) || {};
    const attemptedOffice = localStore.offices.find(o => o.id === a.attempted_office_id) || {};
    const existingSubsidy = localStore.subsidies.find(s => s.id === a.existing_subsidy_id) || {};
    const existingOffice = localStore.offices.find(o => o.id === existingSubsidy.office_id) || {};
    const existingFarmer = localStore.farmers.find(f => f.id === existingSubsidy.farmer_id) || {};

    return {
      ...a,
      product,
      attemptedOffice,
      existingOffice,
      existingFarmer,
      existingSubsidy
    };
  });

  return {
    totalSubsidies: subsidies.length,
    totalFarmers: uniqueFarmerIds.size,
    totalOffices: localStore.offices.filter(o => o.is_active).length,
    openAlertsCount: activeAlerts.length,
    totalAmount,
    yearCounts,
    provinceCounts,
    categoryCounts,
    levelCounts,
    recentAlerts: enrichedAlerts.slice(0, 5),
    recentAuditLogs: localStore.auditLogs.slice(0, 6)
  };
}

/**
 * Duplicate Alerts Management
 */
export async function getDuplicateAlerts(statusFilter = 'all') {
  let list = localStore.duplicateAlerts;
  if (statusFilter && statusFilter !== 'all') {
    list = list.filter(a => a.status === statusFilter);
  }

  return list.map(a => {
    const product = localStore.products.find(p => p.id === a.product_id) || {};
    const attemptedOffice = localStore.offices.find(o => o.id === a.attempted_office_id) || {};
    const existingSubsidy = localStore.subsidies.find(s => s.id === a.existing_subsidy_id) || {};
    const existingOffice = localStore.offices.find(o => o.id === existingSubsidy.office_id) || {};
    const existingFarmer = localStore.farmers.find(f => f.id === existingSubsidy.farmer_id) || {};
    const attemptedUser = localStore.users.find(u => u.id === a.attempted_by) || {};
    const resolvedByUser = localStore.users.find(u => u.id === a.resolved_by) || {};

    return {
      ...a,
      product,
      attemptedOffice,
      existingOffice,
      existingFarmer,
      existingSubsidy,
      attemptedUser,
      resolvedByUser
    };
  });
}

export async function resolveDuplicateAlert(id, { status, resolution_note, resolved_by, currentUser }) {
  const alertIndex = localStore.duplicateAlerts.findIndex(a => a.id === id);
  if (alertIndex === -1) throw new Error('Alert not found.');

  const oldAlert = { ...localStore.duplicateAlerts[alertIndex] };
  localStore.duplicateAlerts[alertIndex].status = status;
  localStore.duplicateAlerts[alertIndex].resolution_note = resolution_note;
  localStore.duplicateAlerts[alertIndex].resolved_by = resolved_by || currentUser?.id;
  localStore.duplicateAlerts[alertIndex].resolved_at = new Date().toISOString();
  setLocal(STORAGE_KEYS.DUPLICATE_ALERTS, localStore.duplicateAlerts);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'UPDATE',
    table_name: 'duplicate_alerts',
    record_id: id,
    old_values: { status: oldAlert.status },
    new_values: { status, resolution_note }
  });

  return localStore.duplicateAlerts[alertIndex];
}

/**
 * Offices Management
 */
export async function getOffices() {
  return [...localStore.offices];
}

export async function createOffice(officeData, currentUser) {
  const newOffice = {
    id: generateUUID(),
    name: officeData.name.trim(),
    nameNe: officeData.nameNe || officeData.name,
    government_level: Number(officeData.government_level) || 3,
    province: officeData.province,
    district: officeData.district,
    municipality: officeData.municipality || '',
    phone: officeData.phone || '',
    is_active: true,
    created_at: new Date().toISOString()
  };

  localStore.offices.push(newOffice);
  setLocal(STORAGE_KEYS.OFFICES, localStore.offices);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'CREATE',
    table_name: 'offices',
    record_id: newOffice.id,
    new_values: newOffice
  });

  return newOffice;
}

/**
 * Users Management
 */
export async function getUsers() {
  return localStore.users.map(u => {
    const office = localStore.offices.find(o => o.id === u.office_id) || {};
    return { ...u, office };
  });
}

export async function createUser(userData, currentUser) {
  const newUser = {
    id: generateUUID(),
    full_name: userData.full_name.trim(),
    email: userData.email.trim().toLowerCase(),
    phone: userData.phone || '',
    office_id: userData.office_id,
    role: userData.role || 'data_entry',
    is_active: true,
    created_at: new Date().toISOString()
  };

  localStore.users.push(newUser);
  setLocal(STORAGE_KEYS.USERS, localStore.users);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'CREATE',
    table_name: 'users',
    record_id: newUser.id,
    new_values: newUser
  });

  return newUser;
}

export async function updateUserRole(userId, newRole, currentUser) {
  const user = localStore.users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');
  const oldRole = user.role;
  user.role = newRole;
  setLocal(STORAGE_KEYS.USERS, localStore.users);

  await addAuditLog({
    user_id: currentUser?.id,
    user_name: currentUser?.full_name,
    action: 'UPDATE',
    table_name: 'users',
    record_id: userId,
    old_values: { role: oldRole },
    new_values: { role: newRole }
  });

  return user;
}

/**
 * Farmers Catalog & Detail
 */
export async function getFarmers(search = '') {
  let list = localStore.farmers.filter(f => !f.is_deleted);
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.phone?.includes(q) ||
      f.citizenship_no?.toLowerCase().includes(q) ||
      f.district?.toLowerCase().includes(q)
    );
  }

  return list.map(f => {
    const farmerSubsidies = localStore.subsidies.filter(s => s.farmer_id === f.id && !s.is_deleted);
    return {
      ...f,
      subsidiesCount: farmerSubsidies.length,
      totalSubsidyAmount: farmerSubsidies.reduce((a, c) => a + (Number(c.amount) || 0), 0)
    };
  });
}

export async function getFarmerDetail(farmerId) {
  const farmer = localStore.farmers.find(f => f.id === farmerId);
  if (!farmer) return null;

  const subsidies = localStore.subsidies
    .filter(s => s.farmer_id === farmerId && !s.is_deleted)
    .map(s => {
      const product = localStore.products.find(p => p.id === s.product_id) || {};
      const office = localStore.offices.find(o => o.id === s.office_id) || {};
      return { ...s, product, office };
    });

  return { ...farmer, subsidies };
}

/**
 * Products Catalog & Detail
 */
export async function getProducts(search = '', category = '') {
  let list = localStore.products.filter(p => !p.is_deleted);
  if (category) {
    list = list.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.engine_number.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  return list.map(p => {
    const subsidy = localStore.subsidies.find(s => s.product_id === p.id && !s.is_deleted);
    let office = null;
    let farmer = null;
    if (subsidy) {
      office = localStore.offices.find(o => o.id === subsidy.office_id) || null;
      farmer = localStore.farmers.find(f => f.id === subsidy.farmer_id) || null;
    }
    return {
      ...p,
      hasActiveSubsidy: Boolean(subsidy),
      subsidy,
      office,
      farmer
    };
  });
}

/**
 * Audit Logs Retrieval
 */
export async function getAuditLogs(filters = {}) {
  let list = localStore.auditLogs;
  if (filters.action && filters.action !== 'all') {
    list = list.filter(a => a.action === filters.action);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(a =>
      a.user_name?.toLowerCase().includes(q) ||
      a.table_name?.toLowerCase().includes(q) ||
      JSON.stringify(a.new_values || {}).toLowerCase().includes(q)
    );
  }
  return list;
}
