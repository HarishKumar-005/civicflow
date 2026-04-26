-- CivicFlow Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- ============================================
-- USERS TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'reporter' CHECK (role IN ('admin', 'organizer', 'volunteer', 'reporter')),
  avatar_url TEXT,
  organization TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- VOLUNTEER PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{English}',
  availability JSONB DEFAULT '{"weekdays": true, "weekends": true, "mornings": true, "afternoons": true, "evenings": false}'::jsonb,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  radius_km DOUBLE PRECISION DEFAULT 10.0,
  preferred_categories TEXT[] DEFAULT '{}',
  experience_level TEXT DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'experienced', 'expert')),
  reliability_score DOUBLE PRECISION DEFAULT 1.0 CHECK (reliability_score >= 0 AND reliability_score <= 1),
  max_concurrent_tasks INT DEFAULT 3,
  active_task_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- CLUSTERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issue_type TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  report_count INT DEFAULT 0,
  priority_score DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- REPORTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  raw_text TEXT,
  source_type TEXT DEFAULT 'form' CHECK (source_type IN ('form', 'upload', 'field_note')),
  category TEXT DEFAULT 'general' CHECK (category IN (
    'water', 'sanitation', 'health', 'food', 'shelter',
    'education', 'transport', 'safety', 'infrastructure', 'environment', 'general'
  )),
  severity INT DEFAULT 3 CHECK (severity >= 1 AND severity <= 5),
  urgency INT DEFAULT 3 CHECK (urgency >= 1 AND urgency <= 5),
  affected_count INT DEFAULT 1,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'verified', 'in_progress', 'resolved', 'closed')),
  priority_score DOUBLE PRECISION DEFAULT 0,
  ai_summary TEXT,
  ai_confidence DOUBLE PRECISION,
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  verified_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  cluster_id UUID REFERENCES public.clusters(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT '{}',
  estimated_duration_hours DOUBLE PRECISION DEFAULT 2.0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  priority_score DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_volunteer_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  match_score DOUBLE PRECISION DEFAULT 0,
  match_breakdown JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'suggested' CHECK (status IN (
    'suggested', 'assigned', 'accepted', 'in_progress', 'completed', 'declined'
  )),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  feedback TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ACTIVITY LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('report', 'task', 'assignment', 'user', 'cluster')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ATTACHMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON public.reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_priority ON public.reports(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_reports_submitted_by ON public.reports(submitted_by);
CREATE INDEX IF NOT EXISTS idx_reports_location ON public.reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_volunteer ON public.assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_task ON public.assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_profiles_user ON public.volunteer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Users: can read all, can update own
CREATE POLICY "Users can read all users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Volunteer profiles: can read all, can update own
CREATE POLICY "Anyone can read volunteer profiles" ON public.volunteer_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Volunteers can update own profile" ON public.volunteer_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Volunteers can insert own profile" ON public.volunteer_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Reports: everyone can read, authenticated can create, organizers/admins can update
CREATE POLICY "Anyone can read reports" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Submitter or organizers can update reports" ON public.reports FOR UPDATE TO authenticated
  USING (
    auth.uid() = submitted_by OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer'))
  );

-- Tasks: everyone can read, organizers/admins can create/update
CREATE POLICY "Anyone can read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can create tasks" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));
CREATE POLICY "Organizers can update tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Assignments: everyone can read, organizers can create, volunteers can update own
CREATE POLICY "Anyone can read assignments" ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can create assignments" ON public.assignments FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));
CREATE POLICY "Volunteers can update own assignments" ON public.assignments FOR UPDATE TO authenticated
  USING (auth.uid() = volunteer_id OR EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Clusters: everyone can read, organizers can modify
CREATE POLICY "Anyone can read clusters" ON public.clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Organizers can manage clusters" ON public.clusters FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));

-- Activity logs: organizers/admins can read, system can insert
CREATE POLICY "Organizers can read logs" ON public.activity_logs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin', 'organizer')));
CREATE POLICY "Authenticated can insert logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Attachments: same as reports
CREATE POLICY "Anyone can read attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create attachments" ON public.attachments FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'reporter')
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-create user on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply updated_at triggers
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_volunteer_profiles BEFORE UPDATE ON public.volunteer_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_reports BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
