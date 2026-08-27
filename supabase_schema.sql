-- ============================================================================
-- ASK EOD MANAGER - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. OPERATORS TABLE
CREATE TABLE IF NOT EXISTS public.operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id TEXT UNIQUE NOT NULL,
    operator_name TEXT NOT NULL,
    manager_name TEXT NOT NULL,
    center TEXT NOT NULL,
    certification TEXT NOT NULL DEFAULT 'Certified',
    qualification TEXT NOT NULL DEFAULT 'Graduate',
    certificate_file TEXT,
    certificate_url TEXT,
    certificate_reg_no TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ASSIGNED WORK TABLE (Admin -> Manager tasks)
CREATE TABLE IF NOT EXISTS public.assigned_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_id TEXT UNIQUE NOT NULL,
    assigned_to TEXT NOT NULL,
    center TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'High',
    assigned_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Not Started',
    instructions TEXT,
    manager_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DAILY WORK DONE / LOGS TABLE (Manager daily log with proof)
CREATE TABLE IF NOT EXISTS public.work_done (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_id TEXT UNIQUE NOT NULL,
    manager_name TEXT NOT NULL,
    center TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Operations',
    description TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    status TEXT NOT NULL DEFAULT 'Completed',
    remarks TEXT,
    attachment_name TEXT,
    attachment_url TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EOD SUBMISSIONS TABLE (Master EOD Reports)
CREATE TABLE IF NOT EXISTS public.eod_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id TEXT UNIQUE NOT NULL,
    manager_name TEXT NOT NULL,
    center TEXT NOT NULL,
    date DATE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Station & System Metadata
    registrar_code TEXT NOT NULL DEFAULT '818',
    enrolment_agency TEXT NOT NULL DEFAULT '2081',
    station_id TEXT NOT NULL,
    operator_id TEXT NOT NULL,
    client_version TEXT NOT NULL DEFAULT '3.3.4.2',
    last_registered TIMESTAMP WITH TIME ZONE,
    last_synch TIMESTAMP WITH TIME ZONE,
    
    -- Summary Counters & Daily Revenue
    enrolments_count INTEGER NOT NULL DEFAULT 0,
    updates_count INTEGER NOT NULL DEFAULT 0,
    total_volume INTEGER NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    
    -- Individual Transaction Packets (JSONB Array for high flexibility)
    transactions JSONB DEFAULT '[]'::jsonb,
    
    -- Operational Remarks
    issues TEXT DEFAULT 'None',
    remarks TEXT DEFAULT 'None',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. INDEXES FOR LIGHTNING FAST QUERIES & ANALYTICS
CREATE INDEX IF NOT EXISTS idx_operators_center ON public.operators(center);
CREATE INDEX IF NOT EXISTS idx_operators_manager ON public.operators(manager_name);
CREATE INDEX IF NOT EXISTS idx_eod_date ON public.eod_submissions(date);
CREATE INDEX IF NOT EXISTS idx_eod_center ON public.eod_submissions(center);
CREATE INDEX IF NOT EXISTS idx_eod_manager ON public.eod_submissions(manager_name);
CREATE INDEX IF NOT EXISTS idx_assigned_manager ON public.assigned_work(assigned_to);
CREATE INDEX IF NOT EXISTS idx_work_done_date ON public.work_done(date);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_work ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_done ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_submissions ENABLE ROW LEVEL SECURITY;

-- Allow read & write access for authenticated & anon clients (customizable via Supabase Auth)
CREATE POLICY "Allow public read-write for operators" ON public.operators FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for assigned_work" ON public.assigned_work FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for work_done" ON public.work_done FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for eod_submissions" ON public.eod_submissions FOR ALL USING (true) WITH CHECK (true);

-- 8. STORAGE BUCKETS (For Operator Certificates and Proof Attachments)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('certificates', 'certificates', true), ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public access to certificates" ON storage.objects FOR ALL USING (bucket_id = 'certificates') WITH CHECK (bucket_id = 'certificates');
CREATE POLICY "Allow public access to attachments" ON storage.objects FOR ALL USING (bucket_id = 'attachments') WITH CHECK (bucket_id = 'attachments');
