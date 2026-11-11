-- ==============================================================================
-- Nepal Agriculture Machinery Subsidy Registry
-- Realistic Seed Data (Offices, Profiles, Farmers, Products, Subsidies, Alerts)
-- ==============================================================================

-- 1. SEED OFFICES
INSERT INTO public.offices (id, name, government_level, province, district, municipality, phone, is_active) VALUES
('11111111-1111-1111-1111-111111111111', 'Ministry of Agriculture and Livestock Development (MoALD) - Central Office', 1, 'Bagmati', 'Kathmandu', 'Kathmandu Metropolitan City', '01-4211933', true),
('22222222-2222-2222-2222-222222222222', 'Directorate of Agricultural Development, Bagmati Province', 2, 'Bagmati', 'Makwanpur', 'Hetauda Sub-Metropolitan City', '057-520344', true),
('33333333-3333-3333-3333-333333333333', 'Ministry of Agriculture, Land Management & Cooperatives, Koshi Province', 2, 'Koshi', 'Morang', 'Biratnagar Metropolitan City', '021-460122', true),
('44444444-4444-4444-4444-444444444444', 'Agriculture Development Section, Bharatpur Metropolitan City', 3, 'Bagmati', 'Chitwan', 'Bharatpur Metropolitan City', '056-520165', true),
('55555555-5555-5555-5555-555555555555', 'Agriculture Development Branch, Damak Municipality', 3, 'Koshi', 'Jhapa', 'Damak Municipality', '023-580145', true),
('66666666-6666-6666-6666-666666666666', 'Agriculture Development Section, Pokhara Metropolitan City', 3, 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '061-521105', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED FARMER GROUPS
INSERT INTO public.groups (id, type, name, registration_no, phone, location) VALUES
('aa111111-1111-1111-1111-111111111111', 'cooperative', 'Sana Kisan Krishi Sahakari Sanstha Ltd.', 'REG-CHIT-449', '9855012345', 'Bharatpur-06, Chitwan'),
('bb222222-2222-2222-2222-222222222222', 'firm', 'Green Terai Agro-Tech Pvt. Ltd.', 'PVT-77821-080', '9852033441', 'Damak-03, Jhapa'),
('cc333333-3333-3333-3333-333333333333', 'group', 'Annapurna Krishak Samuha', 'GRP-KAS-112', '9846055112', 'Pokhara-14, Kaski')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED FARMERS
INSERT INTO public.farmers (id, name, father_name, grandfather_name, citizenship_no, phone, province, district, municipality, ward, tole) VALUES
('f1111111-1111-1111-1111-111111111111', 'Ram Bahadur Thapa', 'Tek Bahadur Thapa', 'Dil Bahadur Thapa', '31-01-72-04981', '9845012345', 'Bagmati', 'Chitwan', 'Bharatpur Metropolitan City', '04', 'Kailashnagar'),
('f2222222-2222-2222-2222-222222222222', 'Sita Devi Sharma', 'Hari Prasad Sharma', 'Kashi Nath Sharma', '12-02-68-01129', '9812345678', 'Koshi', 'Jhapa', 'Damak Municipality', '02', 'Krishna Mandir Tole'),
('f3333333-3333-3333-3333-333333333333', 'Krishna Prasad Poudel', 'Bishnu Prasad Poudel', 'Narayan Poudel', '45-01-75-08872', '9856098765', 'Gandaki', 'Kaski', 'Pokhara Metropolitan City', '14', 'Majhgaun'),
('f4444444-4444-4444-4444-444444444444', 'Maya Kumari Chaudhary', 'Dev Narayan Chaudhary', 'Sukadev Chaudhary', '14-01-70-03314', '9807211445', 'Koshi', 'Morang', 'Biratnagar Metropolitan City', '06', 'Mills Area'),
('f5555555-5555-5555-5555-555555555555', 'Bishnu Maya Shrestha', 'Buddha Lal Shrestha', 'Mani Lal Shrestha', '22-01-74-06155', '9845233119', 'Bagmati', 'Makwanpur', 'Hetauda Sub-Metropolitan City', '07', 'Kamane')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED PRODUCTS (MACHINERY)
-- Engine numbers are normalized uppercase alphanumeric
INSERT INTO public.products (id, category, name, brand, model_no, engine_number, chassis_no, photo_urls) VALUES
('p1111111-1111-1111-1111-111111111111', 'Tractor', 'Mahindra 575 DI 45HP Tractor', 'Mahindra', '575 DI SP PLUS', 'M575DI98214X', 'CH-MAH-992182', ARRAY['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80']),
('p2222222-2222-2222-2222-222222222222', 'Power Tiller', 'Shaktiman 12HP Rotary Tiller', 'Shaktiman', 'SRT-12D', 'SK12HP44901B', 'CH-SHK-334101', ARRAY['https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=800&auto=format&fit=crop&q=80']),
('p3333333-3333-3333-3333-333333333333', 'Tractor', 'Kubota MU4501 4WD Agricultural Tractor', 'Kubota', 'MU4501-4WD', 'KB4501A77219', 'CH-KUB-771249', ARRAY['https://images.unsplash.com/photo-1544986581-efac024faf62?w=800&auto=format&fit=crop&q=80']),
('p4444444-4444-4444-4444-444444444444', 'Mini Tiller', 'VST Shakti 130DI Power Weeder', 'VST Shakti', '130DI-PLUS', 'VST130DI55611', 'CH-VST-552109', ARRAY['https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80']),
('p5555555-5555-5555-5555-555555555555', 'Reaper', 'BCS 740 Self-Propelled Reaper Binder', 'BCS', 'BCS-740-RB', 'BCS740R22108', 'CH-BCS-228190', ARRAY['https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=800&auto=format&fit=crop&q=80'])
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SUBSIDIES
INSERT INTO public.subsidies (id, product_id, farmer_id, group_id, office_id, subsidy_year_bs, subsidy_year_ad, amount, percentage, remarks) VALUES
('s1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'aa111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '2081/82', 2024, 750000.00, 50.00, '50% Subsidy granted under Prime Minister Agriculture Modernization Project (PMAMP) Chitwan Zone.'),
('s2222222-2222-2222-2222-222222222222', 'p2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'bb222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', '2081/82', 2024, 180000.00, 60.00, '60% Municipal subsidy granted to progressive vegetable farming group in Damak.'),
('s3333333-3333-3333-3333-333333333333', 'p3333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'cc333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', '2080/81', 2023, 920000.00, 50.00, 'Provincial & Metropolitan matching grant for cereal grain mechanization.'),
('s4444444-4444-4444-4444-444444444444', 'p4444444-4444-4444-4444-444444444444', 'f4444444-4444-4444-4444-444444444444', NULL, '33333333-3333-3333-3333-333333333333', '2080/81', 2023, 95000.00, 75.00, 'Special women farmer empowerment grant, Morang.')
ON CONFLICT (id) DO NOTHING;

-- 6. SEED DUPLICATE ALERTS (Demonstration Fraud Attempts)
INSERT INTO public.duplicate_alerts (
    id, engine_number, product_id, existing_subsidy_id, attempted_office_id, attempt_type, status, resolution_note, created_at
) VALUES
(
    'd1111111-1111-1111-1111-111111111111',
    'M575DI98214X',
    'p1111111-1111-1111-1111-111111111111',
    's1111111-1111-1111-1111-111111111111',
    '55555555-5555-5555-5555-555555555555',
    'same_engine_in_new_subsidy',
    'open',
    NULL,
    NOW() - INTERVAL '2 hours'
),
(
    'd2222222-2222-2222-2222-222222222222',
    'SK12HP44901B',
    'p2222222-2222-2222-2222-222222222222',
    's2222222-2222-2222-2222-222222222222',
    '66666666-6666-6666-6666-666666666666',
    'same_engine_in_new_subsidy',
    'under_review',
    'Investigating serial invoice submitted to Pokhara office against existing Damak registry.',
    NOW() - INTERVAL '1 day'
),
(
    'd3333333-3333-3333-3333-333333333333',
    'KB4501A77219',
    'p3333333-3333-3333-3333-333333333333',
    's3333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    'same_engine_in_new_subsidy',
    'confirmed_fraud',
    'Dealer attempted second invoice for same Kubota tractor in Chitwan. Blacklisted from subsidy scheme.',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT (id) DO NOTHING;

-- 7. SEED AUDIT LOG
INSERT INTO public.audit_log (action, table_name, record_id, old_values, new_values, created_at) VALUES
('CREATE', 'subsidies', 's1111111-1111-1111-1111-111111111111', NULL, '{"amount": 750000, "engine": "M575DI98214X", "office": "Bharatpur Metropolitan"}', NOW() - INTERVAL '15 days'),
('CREATE', 'subsidies', 's2222222-2222-2222-2222-222222222222', NULL, '{"amount": 180000, "engine": "SK12HP44901B", "office": "Damak Municipality"}', NOW() - INTERVAL '10 days'),
('DUPLICATE_FLAG', 'duplicate_alerts', 'd1111111-1111-1111-1111-111111111111', NULL, '{"engine_number": "M575DI98214X", "attempted_office": "Damak Municipality", "status": "open"}', NOW() - INTERVAL '2 hours');
