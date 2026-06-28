-- ========================================================
-- DAILY JOBS PORTAL - SUPABASE POSTGRESQL SCHEMA
-- ========================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For advanced text search

-- ==========================================
-- 1. TABLES
-- ==========================================

-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    company_logo TEXT,
    location TEXT NOT NULL,
    salary TEXT,
    experience TEXT NOT NULL,
    category TEXT NOT NULL,
    skills TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    apply_link TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    posted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. FUTURE FEATURE TABLES (Architecture Prep)
-- ==========================================

-- User Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    resume_url TEXT,
    years_experience INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved Jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, job_id)
);

-- Job Applications (For future internal apply system)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. INDEXES FOR OPTIMIZATION
-- ==========================================
-- B-Tree indexes for exact match and sorting
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at ON jobs(expires_at);

-- GIN indexes for fast text searching on title and company
CREATE INDEX IF NOT EXISTS idx_jobs_title_trgm ON jobs USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_jobs_company_trgm ON jobs USING GIN (company gin_trgm_ops);

-- ==========================================
-- 4. TRIGGERS
-- ==========================================
-- Function to auto-update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_jobs_modtime
    BEFORE UPDATE ON jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ==========================================
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- JOBS RLS:
-- Visitors (anon) and authenticated users can READ active & non-expired jobs
CREATE POLICY "Public can view active jobs" 
    ON jobs FOR SELECT 
    USING (is_active = true AND expires_at > NOW());

-- Admins (authenticated users) can perform full CRUD on jobs
CREATE POLICY "Admins can insert jobs" 
    ON jobs FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "Admins can update jobs" 
    ON jobs FOR UPDATE 
    TO authenticated 
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can delete jobs" 
    ON jobs FOR DELETE 
    TO authenticated 
    USING (true);

-- Admins can view ALL jobs, even expired/inactive ones
CREATE POLICY "Admins can view all jobs" 
    ON jobs FOR SELECT 
    TO authenticated 
    USING (true);


-- ==========================================
-- 6. AUTOMATIC JOB EXPIRATION (pg_cron)
-- ==========================================
-- Note: Requires pg_cron extension to be enabled in Supabase Dashboard (Database -> Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to clean up expired jobs (deletes them)
-- Alternatively, you could just set is_active = false, but the requirement asked to "automatically remove expired jobs"
CREATE OR REPLACE FUNCTION delete_expired_jobs()
RETURNS void AS $$
BEGIN
    DELETE FROM jobs WHERE expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule the job to run every day at midnight
SELECT cron.schedule(
    'delete-expired-jobs-nightly', -- Job Name
    '0 0 * * *',                   -- Cron schedule (Midnight every day)
    $$SELECT delete_expired_jobs();$$
);

-- ==========================================
-- 7. INITIAL DUMMY DATA (Optional - For testing)
-- ==========================================
-- Uncomment to seed initial data
/*
INSERT INTO jobs (title, company, location, experience, category, description, salary, skills) VALUES
('Senior Frontend Developer', 'Amazon', 'Bangalore', '5-8 years', 'Software Development', 'Build scalable UIs with React.', '₹35L - ₹55L', ARRAY['React', 'TypeScript', 'AWS']),
('Data Scientist', 'Microsoft', 'Hyderabad', '3-5 years', 'Data Science', 'Analyze complex datasets.', '₹25L - ₹40L', ARRAY['Python', 'SQL', 'Machine Learning']);
*/
