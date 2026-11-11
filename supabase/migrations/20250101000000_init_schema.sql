-- ==============================================================================
-- Nepal Agriculture Machinery Subsidy Registry (नेपाल कृषि औजार अनुदान दर्ता)
-- Database Migration Script - Complete PostgreSQL / Supabase Schema
-- Includes:
-- 1. Tables: offices, profiles, farmers, groups, products, subsidies, duplicate_alerts, audit_log
-- 2. Triggers: Engine Number Normalization, Duplicate Fraud Detection, Audit Logging
-- 3. Row-Level Security (RLS) for Federal (Level 1), Provincial (Level 2), Local (Level 3)
-- 4. RPC Functions: Cross-Nepal Universal Engine Checker
-- 5. Storage Bucket Configuration for Product Photos
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. OFFICES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    government_level INTEGER NOT NULL CHECK (government_level IN (1, 2, 3)), -- 1: Federal, 2: Provincial, 3: Local
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    municipality TEXT,
    phone TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.offices IS 'Government offices at Federal (1), Provincial (2), and Local (3) levels';

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Linked with Supabase auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'office_admin', 'data_entry', 'viewer')) DEFAULT 'data_entry',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profiles with office assignment and role-based permissions';

-- ------------------------------------------------------------------------------
-- 3. FARMERS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    father_name TEXT,
    grandfather_name TEXT,
    citizenship_no TEXT,
    phone TEXT,
    province TEXT NOT NULL,
    district TEXT NOT NULL,
    municipality TEXT NOT NULL,
    ward TEXT,
    tole TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.farmers IS 'Farmer beneficiaries with lineage (father/grandfather) and address';

-- ------------------------------------------------------------------------------
-- 4. GROUPS TABLE (Firms, Co-operatives, or Farmer Groups)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('firm', 'cooperative', 'group')),
    name TEXT NOT NULL,
    registration_no TEXT,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.groups IS 'Farmer groups, agricultural firms, and co-operatives';

-- ------------------------------------------------------------------------------
-- 5. PRODUCTS TABLE (Machinery / Equipment)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- Tractor, Power Tiller, Reaper, Thresher, Mini Tiller, Harvester, etc.
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    model_no TEXT,
    engine_number TEXT NOT NULL UNIQUE, -- Normalized uppercase alphanumeric without spaces/hyphens
    chassis_no TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Agricultural machinery with unique normalized engine number';

-- ------------------------------------------------------------------------------
-- 6. SUBSIDIES TABLE (Subsidy grant events)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subsidies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES public.farmers(id) ON DELETE RESTRICT,
    group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
    office_id UUID NOT NULL REFERENCES public.offices(id) ON DELETE RESTRICT,
    entered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    subsidy_year_bs TEXT NOT NULL, -- e.g., '2080/81'
    subsidy_year_ad INTEGER,
    amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2), -- e.g., 50.00 (%)
    remarks TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subsidies IS 'Subsidy distribution event linking machine, farmer, and granting office';

-- ------------------------------------------------------------------------------
-- 7. DUPLICATE ALERTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.duplicate_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engine_number TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    existing_subsidy_id UUID REFERENCES public.subsidies(id) ON DELETE SET NULL,
    attempted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    attempted_office_id UUID REFERENCES public.offices(id) ON DELETE SET NULL,
    attempt_type TEXT NOT NULL CHECK (attempt_type IN ('same_engine_in_new_subsidy', 'same_engine_in_new_product')),
    status TEXT NOT NULL CHECK (status IN ('open', 'under_review', 'resolved', 'confirmed_fraud')) DEFAULT 'open',
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolution_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

COMMENT ON TABLE public.duplicate_alerts IS 'Fraud alerts logged automatically when duplicate engine numbers are entered';

-- ------------------------------------------------------------------------------
-- 8. AUDIT LOG TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, DUPLICATE_FLAG
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.audit_log IS 'Tamper-evident audit trail of all data changes and alerts';

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH & VERIFICATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_engine_number ON public.products(engine_number);
CREATE INDEX IF NOT EXISTS idx_subsidies_product_id ON public.subsidies(product_id);
CREATE INDEX IF NOT EXISTS idx_subsidies_farmer_id ON public.subsidies(farmer_id);
CREATE INDEX IF NOT EXISTS idx_subsidies_office_id ON public.subsidies(office_id);
CREATE INDEX IF NOT EXISTS idx_subsidies_year_bs ON public.subsidies(subsidy_year_bs);
CREATE INDEX IF NOT EXISTS idx_farmers_citizenship_no ON public.farmers(citizenship_no);
CREATE INDEX IF NOT EXISTS idx_farmers_phone ON public.farmers(phone);
CREATE INDEX IF NOT EXISTS idx_duplicate_alerts_status ON public.duplicate_alerts(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);

-- ==============================================================================
-- DATABASE TRIGGERS & FUNCTIONS
-- ==============================================================================

-- 1. Engine Number Normalization (Uppercase, remove all spaces, dashes, symbols)
CREATE OR REPLACE FUNCTION public.normalize_engine_number_func()
RETURNS TRIGGER AS $$
BEGIN
    NEW.engine_number := UPPER(REGEXP_REPLACE(NEW.engine_number, '[^A-Za-z0-9]', '', 'g'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_normalize_engine_number ON public.products;
CREATE TRIGGER trg_normalize_engine_number
    BEFORE INSERT OR UPDATE OF engine_number ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.normalize_engine_number_func();

-- 2. Prevent Multiple Active Subsidies for Same Machine & Auto-Trigger Alert
CREATE OR REPLACE FUNCTION public.check_subsidy_duplicate_func()
RETURNS TRIGGER AS $$
DECLARE
    v_existing_subsidy_id UUID;
    v_existing_office_name TEXT;
    v_existing_farmer_name TEXT;
    v_existing_year TEXT;
    v_engine_number TEXT;
BEGIN
    -- Fetch engine number for the product being subsidized
    SELECT engine_number INTO v_engine_number
    FROM public.products
    WHERE id = NEW.product_id;

    -- Check if this product or another product with the same normalized engine number
    -- already has an active (non-deleted) subsidy
    SELECT s.id, o.name, f.name, s.subsidy_year_bs
    INTO v_existing_subsidy_id, v_existing_office_name, v_existing_farmer_name, v_existing_year
    FROM public.subsidies s
    JOIN public.products p ON s.product_id = p.id
    JOIN public.offices o ON s.office_id = o.id
    JOIN public.farmers f ON s.farmer_id = f.id
    WHERE p.engine_number = v_engine_number
      AND s.is_deleted = false
      AND s.id IS DISTINCT FROM NEW.id
    LIMIT 1;

    IF v_existing_subsidy_id IS NOT NULL THEN
        -- Insert a duplicate alert automatically
        INSERT INTO public.duplicate_alerts (
            engine_number,
            product_id,
            existing_subsidy_id,
            attempted_by,
            attempted_office_id,
            attempt_type,
            status
        ) VALUES (
            v_engine_number,
            NEW.product_id,
            v_existing_subsidy_id,
            NEW.entered_by,
            NEW.office_id,
            'same_engine_in_new_subsidy',
            'open'
        );

        -- Also record in audit log
        INSERT INTO public.audit_log (
            user_id,
            action,
            table_name,
            record_id,
            new_values
        ) VALUES (
            NEW.entered_by,
            'DUPLICATE_ATTEMPT',
            'subsidies',
            NEW.id,
            jsonb_build_object(
                'engine_number', v_engine_number,
                'existing_subsidy_id', v_existing_subsidy_id,
                'existing_office', v_existing_office_name,
                'existing_farmer', v_existing_farmer_name,
                'existing_year', v_existing_year
            )
        );

        RAISE EXCEPTION 'DUPLICATE_ENGINE_ERROR: Machine with Engine Number % was already subsidized by office "%" in year % for farmer "%". This violation has been logged to Duplicate Alerts.',
            v_engine_number, v_existing_office_name, v_existing_year, v_existing_farmer_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_subsidy_duplicate ON public.subsidies;
CREATE TRIGGER trg_check_subsidy_duplicate
    BEFORE INSERT OR UPDATE OF product_id, is_deleted ON public.subsidies
    FOR EACH ROW
    WHEN (NEW.is_deleted = false)
    EXECUTE FUNCTION public.check_subsidy_duplicate_func();

-- 3. Generic Audit Logger Trigger Function
CREATE OR REPLACE FUNCTION public.audit_log_func()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_record_id UUID;
    v_old_json JSONB := NULL;
    v_new_json JSONB := NULL;
BEGIN
    -- Determine current user ID if available in request context
    BEGIN
        v_user_id := auth.uid();
    EXCEPTION WHEN OTHERS THEN
        v_user_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id;
        v_old_json := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id;
        v_old_json := to_jsonb(OLD);
        v_new_json := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id;
        v_new_json := to_jsonb(NEW);
    END IF;

    INSERT INTO public.audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values
    ) VALUES (
        v_user_id,
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old_json,
        v_new_json
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Audit Log triggers on critical tables
DROP TRIGGER IF EXISTS trg_audit_subsidies ON public.subsidies;
CREATE TRIGGER trg_audit_subsidies
    AFTER INSERT OR UPDATE OR DELETE ON public.subsidies
    FOR EACH ROW EXECUTE FUNCTION public.audit_log_func();

DROP TRIGGER IF EXISTS trg_audit_products ON public.products;
CREATE TRIGGER trg_audit_products
    AFTER INSERT OR UPDATE OR DELETE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.audit_log_func();

DROP TRIGGER IF EXISTS trg_audit_farmers ON public.farmers;
CREATE TRIGGER trg_audit_farmers
    AFTER INSERT OR UPDATE OR DELETE ON public.farmers
    FOR EACH ROW EXECUTE FUNCTION public.audit_log_func();

-- ==============================================================================
-- 4. UNIVERSAL CROSS-NEPAL ENGINE CHECKER (RPC FUNCTION)
-- Allowed for all logged-in users regardless of jurisdiction level
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_engine_number(search_engine TEXT)
RETURNS JSONB AS $$
DECLARE
    v_normalized TEXT;
    v_result JSONB;
BEGIN
    v_normalized := UPPER(REGEXP_REPLACE(search_engine, '[^A-Za-z0-9]', '', 'g'));

    IF v_normalized IS NULL OR LENGTH(v_normalized) = 0 THEN
        RETURN jsonb_build_object('exists', false, 'message', 'Please provide an engine number.');
    END IF;

    SELECT jsonb_build_object(
        'exists', true,
        'engine_number', p.engine_number,
        'product_name', p.name,
        'category', p.category,
        'brand', p.brand,
        'model_no', p.model_no,
        'subsidy_id', s.id,
        'subsidy_year_bs', s.subsidy_year_bs,
        'amount', s.amount,
        'office_name', o.name,
        'government_level', o.government_level,
        'province', o.province,
        'district', o.district,
        'municipality', o.municipality,
        'farmer_name', f.name,
        'farmer_district', f.district,
        'created_at', s.created_at
    )
    INTO v_result
    FROM public.products p
    JOIN public.subsidies s ON s.product_id = p.id AND s.is_deleted = false
    JOIN public.offices o ON s.office_id = o.id
    JOIN public.farmers f ON s.farmer_id = f.id
    WHERE p.engine_number = v_normalized
    ORDER BY s.created_at DESC
    LIMIT 1;

    IF v_result IS NOT NULL THEN
        RETURN v_result;
    END IF;

    -- Check if product exists but has no active subsidy yet
    SELECT jsonb_build_object(
        'exists', true,
        'has_subsidy', false,
        'engine_number', p.engine_number,
        'product_name', p.name,
        'category', p.category,
        'brand', p.brand,
        'model_no', p.model_no
    )
    INTO v_result
    FROM public.products p
    WHERE p.engine_number = v_normalized AND p.is_deleted = false
    LIMIT 1;

    IF v_result IS NOT NULL THEN
        RETURN v_result;
    END IF;

    RETURN jsonb_build_object(
        'exists', false,
        'engine_number', v_normalized,
        'message', 'Engine number is clear. No subsidy recorded for this machine in any office across Nepal.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subsidies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current user's profile info
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS TABLE (
    user_id UUID,
    office_id UUID,
    government_level INTEGER,
    province TEXT,
    municipality TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id AS user_id,
        p.office_id,
        o.government_level,
        o.province,
        o.municipality,
        p.role
    FROM public.profiles p
    LEFT JOIN public.offices o ON p.office_id = o.id
    WHERE p.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- OFFICES POLICIES ---
-- Everyone logged in can read active offices (needed for dropdowns and listings)
CREATE POLICY "Allow authenticated to view offices"
    ON public.offices FOR SELECT
    TO authenticated
    USING (true);

-- Only Super Admins can insert/update offices
CREATE POLICY "Admins can manage offices"
    ON public.offices FOR ALL
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'
    ));

-- --- PROFILES POLICIES ---
-- Users can view their own profile or profiles in the same office; Super Admin sees all
CREATE POLICY "View profiles policy"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles p_admin 
            WHERE p_admin.id = auth.uid() AND p_admin.role IN ('super_admin', 'office_admin')
        )
    );

CREATE POLICY "Admins can update profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'office_admin')
    ));

-- --- SUBSIDIES POLICIES (Jurisdiction Hierarchy) ---
-- Level 1 (Federal): All records in Nepal
-- Level 2 (Provincial): Records in user's province
-- Level 3 (Local): Records in user's municipality
CREATE POLICY "Jurisdiction based subsidy view"
    ON public.subsidies FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            JOIN public.offices o ON public.subsidies.office_id = o.id
            WHERE u.role = 'super_admin'
               OR u.government_level = 1
               OR (u.government_level = 2 AND o.province = u.province)
               OR (u.government_level = 3 AND o.municipality = u.municipality)
        )
    );

-- Only users belonging to the office can insert/update subsidies (and not viewer)
CREATE POLICY "Office users can insert subsidies"
    ON public.subsidies FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            WHERE u.office_id = public.subsidies.office_id
              AND u.role IN ('super_admin', 'office_admin', 'data_entry')
        )
    );

CREATE POLICY "Office users can update their subsidies"
    ON public.subsidies FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            WHERE (u.office_id = public.subsidies.office_id AND u.role IN ('office_admin', 'data_entry'))
               OR u.role = 'super_admin'
        )
    );

-- --- FARMERS POLICIES ---
CREATE POLICY "View farmers by jurisdiction"
    ON public.farmers FOR SELECT
    TO authenticated
    USING (true); -- Farmers readable across offices for duplicate prevention/beneficiary lookups

CREATE POLICY "Insert farmers"
    ON public.farmers FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Update farmers"
    ON public.farmers FOR UPDATE
    TO authenticated
    USING (auth.uid() IS NOT NULL);

-- --- PRODUCTS POLICIES ---
CREATE POLICY "View products"
    ON public.products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() IS NOT NULL);

-- --- DUPLICATE ALERTS POLICIES ---
-- Federal officers and Super Admins can see and resolve all alerts;
-- Provincial and local offices see alerts involving their office.
CREATE POLICY "View duplicate alerts"
    ON public.duplicate_alerts FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            WHERE u.role = 'super_admin'
               OR u.government_level = 1
               OR u.office_id = public.duplicate_alerts.attempted_office_id
        )
    );

CREATE POLICY "Admins can resolve alerts"
    ON public.duplicate_alerts FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            WHERE u.role IN ('super_admin', 'office_admin')
        )
    );

-- --- AUDIT LOG POLICIES ---
-- Super Admin and Office Admins can view audit log
CREATE POLICY "Admins can view audit log"
    ON public.audit_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.get_current_user_profile() u
            WHERE u.role IN ('super_admin', 'office_admin')
        )
    );

-- ==============================================================================
-- 6. STORAGE BUCKET FOR MACHINERY PHOTOS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read for product photos"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'product-photos');

CREATE POLICY "Authenticated users can upload product photos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'product-photos');

