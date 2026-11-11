/**
 * Initial Mock Data for Nepal Agriculture Machinery Subsidy Registry
 * Synchronized with the Supabase PostgreSQL seed schema.
 */

export const NEPAL_PROVINCES = [
  'Koshi',
  'Madhesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpashchim'
];

export const MACHINERY_CATEGORIES = [
  { id: 'Tractor', nameEn: 'Tractor', nameNe: 'ट्र्याक्टर' },
  { id: 'Power Tiller', nameEn: 'Power Tiller', nameNe: 'पावर टिलर' },
  { id: 'Mini Tiller', nameEn: 'Mini Tiller / Power Weeder', nameNe: 'मिनी टिलर / विडर' },
  { id: 'Reaper', nameEn: 'Reaper / Binder', nameNe: 'रिपर / कम्बाइन' },
  { id: 'Thresher', nameEn: 'Multi-Crop Thresher', nameNe: 'थ्रेसर' },
  { id: 'Harvester', nameEn: 'Combine Harvester', nameNe: 'हार्भेस्टर' },
  { id: 'Water Pump', nameEn: 'Irrigation Water Pump', nameNe: 'सिंचाई पम्पसेट' },
  { id: 'Rice Mill', nameEn: 'Mini Rice Mill', nameNe: 'मिनी राइस मिल' },
  { id: 'Other', nameEn: 'Other Implements', nameNe: 'अन्य औजार' },
];

export const INITIAL_OFFICES = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Ministry of Agriculture and Livestock Development (MoALD) - Central Office',
    nameNe: 'कृषि तथा पशुपन्छी विकास मन्त्रालय - सिंहदरबार, काठमाडौं',
    government_level: 1, // Federal
    province: 'Bagmati',
    district: 'Kathmandu',
    municipality: 'Kathmandu Metropolitan City',
    phone: '01-4211933',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Directorate of Agricultural Development, Bagmati Province',
    nameNe: 'कृषि विकास निर्देशनालय, बागमती प्रदेश',
    government_level: 2, // Provincial
    province: 'Bagmati',
    district: 'Makwanpur',
    municipality: 'Hetauda Sub-Metropolitan City',
    phone: '057-520344',
    is_active: true,
    created_at: '2024-01-16T09:30:00Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Ministry of Agriculture, Land Management & Cooperatives, Koshi Province',
    nameNe: 'कृषि, भूमि व्यवस्था तथा सहकारी मन्त्रालय, कोशी प्रदेश',
    government_level: 2, // Provincial
    province: 'Koshi',
    district: 'Morang',
    municipality: 'Biratnagar Metropolitan City',
    phone: '021-460122',
    is_active: true,
    created_at: '2024-01-18T10:00:00Z'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Agriculture Development Section, Bharatpur Metropolitan City',
    nameNe: 'कृषि विकास शाखा, भरतपुर महानगरपालिका',
    government_level: 3, // Local
    province: 'Bagmati',
    district: 'Chitwan',
    municipality: 'Bharatpur Metropolitan City',
    phone: '056-520165',
    is_active: true,
    created_at: '2024-02-01T11:00:00Z'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Agriculture Development Branch, Damak Municipality',
    nameNe: 'कृषि विकास शाखा, दमक नगरपालिका',
    government_level: 3, // Local
    province: 'Koshi',
    district: 'Jhapa',
    municipality: 'Damak Municipality',
    phone: '023-580145',
    is_active: true,
    created_at: '2024-02-05T12:00:00Z'
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Agriculture Development Section, Pokhara Metropolitan City',
    nameNe: 'कृषि विकास महाशाखा, पोखरा महानगरपालिका',
    government_level: 3, // Local
    province: 'Gandaki',
    district: 'Kaski',
    municipality: 'Pokhara Metropolitan City',
    phone: '061-521105',
    is_active: true,
    created_at: '2024-02-10T14:00:00Z'
  }
];

export const INITIAL_USERS = [
  {
    id: 'u1111111-1111-1111-1111-111111111111',
    full_name: 'Dr. Hari Bahadur KC',
    email: 'superadmin@moald.gov.np',
    phone: '9851023456',
    office_id: '11111111-1111-1111-1111-111111111111',
    role: 'super_admin',
    is_active: true,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'u2222222-2222-2222-2222-222222222222',
    full_name: 'Prakash Chandra Adhikari',
    email: 'bagmati.admin@agri.bagmati.gov.np',
    phone: '9845098765',
    office_id: '22222222-2222-2222-2222-222222222222',
    role: 'office_admin',
    is_active: true,
    created_at: '2024-01-16T09:30:00Z'
  },
  {
    id: 'u3333333-3333-3333-3333-333333333333',
    full_name: 'Sushil Shrestha',
    email: 'bharatpur.agri@bharatpurmun.gov.np',
    phone: '9855077665',
    office_id: '44444444-4444-4444-4444-444444444444',
    role: 'data_entry',
    is_active: true,
    created_at: '2024-02-01T11:00:00Z'
  },
  {
    id: 'u4444444-4444-4444-4444-444444444444',
    full_name: 'Rita Bhattarai',
    email: 'damak.data@damakmun.gov.np',
    phone: '9806122334',
    office_id: '55555555-5555-5555-5555-555555555555',
    role: 'data_entry',
    is_active: true,
    created_at: '2024-02-05T12:00:00Z'
  },
  {
    id: 'u5555555-5555-5555-5555-555555555555',
    full_name: 'Gopal Krishna Regmi',
    email: 'auditor@moald.gov.np',
    phone: '9841334455',
    office_id: '11111111-1111-1111-1111-111111111111',
    role: 'viewer',
    is_active: true,
    created_at: '2024-02-12T10:00:00Z'
  }
];

export const INITIAL_FARMERS = [
  {
    id: 'f1111111-1111-1111-1111-111111111111',
    name: 'Ram Bahadur Thapa',
    father_name: 'Tek Bahadur Thapa',
    grandfather_name: 'Dil Bahadur Thapa',
    citizenship_no: '31-01-72-04981',
    phone: '9845012345',
    province: 'Bagmati',
    district: 'Chitwan',
    municipality: 'Bharatpur Metropolitan City',
    ward: '04',
    tole: 'Kailashnagar',
    created_by: 'u3333333-3333-3333-3333-333333333333',
    is_deleted: false,
    created_at: '2024-02-15T09:00:00Z'
  },
  {
    id: 'f2222222-2222-2222-2222-222222222222',
    name: 'Sita Devi Sharma',
    father_name: 'Hari Prasad Sharma',
    grandfather_name: 'Kashi Nath Sharma',
    citizenship_no: '12-02-68-01129',
    phone: '9812345678',
    province: 'Koshi',
    district: 'Jhapa',
    municipality: 'Damak Municipality',
    ward: '02',
    tole: 'Krishna Mandir Tole',
    created_by: 'u4444444-4444-4444-4444-444444444444',
    is_deleted: false,
    created_at: '2024-02-20T10:00:00Z'
  },
  {
    id: 'f3333333-3333-3333-3333-333333333333',
    name: 'Krishna Prasad Poudel',
    father_name: 'Bishnu Prasad Poudel',
    grandfather_name: 'Narayan Poudel',
    citizenship_no: '45-01-75-08872',
    phone: '9856098765',
    province: 'Gandaki',
    district: 'Kaski',
    municipality: 'Pokhara Metropolitan City',
    ward: '14',
    tole: 'Majhgaun',
    created_by: 'u1111111-1111-1111-1111-111111111111',
    is_deleted: false,
    created_at: '2024-03-01T11:00:00Z'
  },
  {
    id: 'f4444444-4444-4444-4444-444444444444',
    name: 'Maya Kumari Chaudhary',
    father_name: 'Dev Narayan Chaudhary',
    grandfather_name: 'Sukadev Chaudhary',
    citizenship_no: '14-01-70-03314',
    phone: '9807211445',
    province: 'Koshi',
    district: 'Morang',
    municipality: 'Biratnagar Metropolitan City',
    ward: '06',
    tole: 'Mills Area',
    created_by: 'u1111111-1111-1111-1111-111111111111',
    is_deleted: false,
    created_at: '2024-03-10T12:00:00Z'
  },
  {
    id: 'f5555555-5555-5555-5555-555555555555',
    name: 'Bishnu Maya Shrestha',
    father_name: 'Buddha Lal Shrestha',
    grandfather_name: 'Mani Lal Shrestha',
    citizenship_no: '22-01-74-06155',
    phone: '9845233119',
    province: 'Bagmati',
    district: 'Makwanpur',
    municipality: 'Hetauda Sub-Metropolitan City',
    ward: '07',
    tole: 'Kamane',
    created_by: 'u2222222-2222-2222-2222-222222222222',
    is_deleted: false,
    created_at: '2024-03-15T14:00:00Z'
  }
];

export const INITIAL_GROUPS = [
  {
    id: 'aa111111-1111-1111-1111-111111111111',
    type: 'cooperative',
    name: 'Sana Kisan Krishi Sahakari Sanstha Ltd.',
    registration_no: 'REG-CHIT-449',
    phone: '9855012345',
    location: 'Bharatpur-06, Chitwan'
  },
  {
    id: 'bb222222-2222-2222-2222-222222222222',
    type: 'firm',
    name: 'Green Terai Agro-Tech Pvt. Ltd.',
    registration_no: 'PVT-77821-080',
    phone: '9852033441',
    location: 'Damak-03, Jhapa'
  },
  {
    id: 'cc333333-3333-3333-3333-333333333333',
    type: 'group',
    name: 'Annapurna Krishak Samuha',
    registration_no: 'GRP-KAS-112',
    phone: '9846055112',
    location: 'Pokhara-14, Kaski'
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    category: 'Tractor',
    name: 'Mahindra 575 DI 45HP Tractor',
    brand: 'Mahindra',
    model_no: '575 DI SP PLUS',
    engine_number: 'M575DI98214X',
    chassis_no: 'CH-MAH-992182',
    photo_urls: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80'],
    created_by: 'u3333333-3333-3333-3333-333333333333',
    is_deleted: false,
    created_at: '2024-02-15T09:15:00Z'
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    category: 'Power Tiller',
    name: 'Shaktiman 12HP Rotary Tiller',
    brand: 'Shaktiman',
    model_no: 'SRT-12D',
    engine_number: 'SK12HP44901B',
    chassis_no: 'CH-SHK-334101',
    photo_urls: ['https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80'],
    created_by: 'u4444444-4444-4444-4444-444444444444',
    is_deleted: false,
    created_at: '2024-02-20T10:15:00Z'
  },
  {
    id: 'p3333333-3333-3333-3333-333333333333',
    category: 'Tractor',
    name: 'Kubota MU4501 4WD Agricultural Tractor',
    brand: 'Kubota',
    model_no: 'MU4501-4WD',
    engine_number: 'KB4501A77219',
    chassis_no: 'CH-KUB-771249',
    photo_urls: ['https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&auto=format&fit=crop&q=80'],
    created_by: 'u1111111-1111-1111-1111-111111111111',
    is_deleted: false,
    created_at: '2024-03-01T11:15:00Z'
  },
  {
    id: 'p4444444-4444-4444-4444-444444444444',
    category: 'Mini Tiller',
    name: 'VST Shakti 130DI Power Weeder',
    brand: 'VST Shakti',
    model_no: '130DI-PLUS',
    engine_number: 'VST130DI55611',
    chassis_no: 'CH-VST-552109',
    photo_urls: ['https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80'],
    created_by: 'u1111111-1111-1111-1111-111111111111',
    is_deleted: false,
    created_at: '2024-03-10T12:15:00Z'
  },
  {
    id: 'p5555555-5555-5555-5555-555555555555',
    category: 'Reaper',
    name: 'BCS 740 Self-Propelled Reaper Binder',
    brand: 'BCS',
    model_no: 'BCS-740-RB',
    engine_number: 'BCS740R22108',
    chassis_no: 'CH-BCS-228190',
    photo_urls: ['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80'],
    created_by: 'u2222222-2222-2222-2222-222222222222',
    is_deleted: false,
    created_at: '2024-03-15T14:15:00Z'
  }
];

export const INITIAL_SUBSIDIES = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    product_id: 'p1111111-1111-1111-1111-111111111111',
    farmer_id: 'f1111111-1111-1111-1111-111111111111',
    group_id: 'aa111111-1111-1111-1111-111111111111',
    office_id: '44444444-4444-4444-4444-444444444444',
    entered_by: 'u3333333-3333-3333-3333-333333333333',
    subsidy_year_bs: '2081/82',
    subsidy_year_ad: 2024,
    amount: 750000.00,
    percentage: 50.00,
    remarks: '50% Subsidy granted under Prime Minister Agriculture Modernization Project (PMAMP) Chitwan Zone.',
    is_deleted: false,
    created_at: '2024-02-15T09:30:00Z',
    updated_at: '2024-02-15T09:30:00Z'
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    product_id: 'p2222222-2222-2222-2222-222222222222',
    farmer_id: 'f2222222-2222-2222-2222-222222222222',
    group_id: 'bb222222-2222-2222-2222-222222222222',
    office_id: '55555555-5555-5555-5555-555555555555',
    entered_by: 'u4444444-4444-4444-4444-444444444444',
    subsidy_year_bs: '2081/82',
    subsidy_year_ad: 2024,
    amount: 180000.00,
    percentage: 60.00,
    remarks: '60% Municipal subsidy granted to progressive vegetable farming group in Damak.',
    is_deleted: false,
    created_at: '2024-02-20T10:30:00Z',
    updated_at: '2024-02-20T10:30:00Z'
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    product_id: 'p3333333-3333-3333-3333-333333333333',
    farmer_id: 'f3333333-3333-3333-3333-333333333333',
    group_id: 'cc333333-3333-3333-3333-333333333333',
    office_id: '66666666-6666-6666-6666-666666666666',
    entered_by: 'u1111111-1111-1111-1111-111111111111',
    subsidy_year_bs: '2080/81',
    subsidy_year_ad: 2023,
    amount: 920000.00,
    percentage: 50.00,
    remarks: 'Provincial & Metropolitan matching grant for cereal grain mechanization.',
    is_deleted: false,
    created_at: '2024-03-01T11:30:00Z',
    updated_at: '2024-03-01T11:30:00Z'
  },
  {
    id: 's4444444-4444-4444-4444-444444444444',
    product_id: 'p4444444-4444-4444-4444-444444444444',
    farmer_id: 'f4444444-4444-4444-4444-444444444444',
    group_id: null,
    office_id: '33333333-3333-3333-3333-333333333333',
    entered_by: 'u1111111-1111-1111-1111-111111111111',
    subsidy_year_bs: '2080/81',
    subsidy_year_ad: 2023,
    amount: 95000.00,
    percentage: 75.00,
    remarks: 'Special women farmer empowerment grant, Morang.',
    is_deleted: false,
    created_at: '2024-03-10T12:30:00Z',
    updated_at: '2024-03-10T12:30:00Z'
  }
];

export const INITIAL_DUPLICATE_ALERTS = [
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    engine_number: 'M575DI98214X',
    product_id: 'p1111111-1111-1111-1111-111111111111',
    existing_subsidy_id: 's1111111-1111-1111-1111-111111111111',
    attempted_by: 'u4444444-4444-4444-4444-444444444444',
    attempted_office_id: '55555555-5555-5555-5555-555555555555',
    attempt_type: 'same_engine_in_new_subsidy',
    status: 'open',
    resolved_by: null,
    resolution_note: null,
    created_at: '2024-04-10T10:20:00Z',
    resolved_at: null
  },
  {
    id: 'd2222222-2222-2222-2222-222222222222',
    engine_number: 'SK12HP44901B',
    product_id: 'p2222222-2222-2222-2222-222222222222',
    existing_subsidy_id: 's2222222-2222-2222-2222-222222222222',
    attempted_by: 'u3333333-3333-3333-3333-333333333333',
    attempted_office_id: '66666666-6666-6666-6666-666666666666',
    attempt_type: 'same_engine_in_new_subsidy',
    status: 'under_review',
    resolved_by: null,
    resolution_note: 'Investigating serial invoice submitted to Pokhara office against existing Damak registry.',
    created_at: '2024-04-08T14:40:00Z',
    resolved_at: null
  },
  {
    id: 'd3333333-3333-3333-3333-333333333333',
    engine_number: 'KB4501A77219',
    product_id: 'p3333333-3333-3333-3333-333333333333',
    existing_subsidy_id: 's3333333-3333-3333-3333-333333333333',
    attempted_by: 'u3333333-3333-3333-3333-333333333333',
    attempted_office_id: '44444444-4444-4444-4444-444444444444',
    attempt_type: 'same_engine_in_new_subsidy',
    status: 'confirmed_fraud',
    resolved_by: 'u1111111-1111-1111-1111-111111111111',
    resolution_note: 'Dealer attempted second invoice for same Kubota tractor in Chitwan. Blacklisted from subsidy scheme.',
    created_at: '2024-04-05T09:10:00Z',
    resolved_at: '2024-04-06T11:00:00Z'
  }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: 'u3333333-3333-3333-3333-333333333333',
    user_name: 'Sushil Shrestha (Bharatpur)',
    action: 'CREATE',
    table_name: 'subsidies',
    record_id: 's1111111-1111-1111-1111-111111111111',
    old_values: null,
    new_values: { amount: 750000, engine: 'M575DI98214X', farmer: 'Ram Bahadur Thapa' },
    created_at: '2024-02-15T09:30:00Z'
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    user_id: 'u4444444-4444-4444-4444-444444444444',
    user_name: 'Rita Bhattarai (Damak)',
    action: 'CREATE',
    table_name: 'subsidies',
    record_id: 's2222222-2222-2222-2222-222222222222',
    old_values: null,
    new_values: { amount: 180000, engine: 'SK12HP44901B', farmer: 'Sita Devi Sharma' },
    created_at: '2024-02-20T10:30:00Z'
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    user_id: 'u4444444-4444-4444-4444-444444444444',
    user_name: 'Rita Bhattarai (Damak)',
    action: 'DUPLICATE_FLAG',
    table_name: 'duplicate_alerts',
    record_id: 'd1111111-1111-1111-1111-111111111111',
    old_values: null,
    new_values: {
      engine_number: 'M575DI98214X',
      attempted_office: 'Agriculture Development Branch, Damak Municipality',
      existing_office: 'Agriculture Development Section, Bharatpur Metropolitan City',
      status: 'open'
    },
    created_at: '2024-04-10T10:20:00Z'
  }
];
