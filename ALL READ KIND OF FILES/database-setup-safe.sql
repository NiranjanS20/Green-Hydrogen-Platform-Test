-- Green Hydrogen Platform Database Setup (Safe Version)
-- This script can be run multiple times without errors
-- Run these SQL commands in your Supabase SQL Editor

-- First, let's drop all existing policies to avoid conflicts
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies for our tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Create tables (IF NOT EXISTS is safe)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'operator',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  electrolyzer_type TEXT CHECK (electrolyzer_type IN ('PEM', 'Alkaline', 'SOEC')) NOT NULL,
  capacity_kg_per_day NUMERIC NOT NULL,
  energy_source_id UUID,
  efficiency_percent NUMERIC DEFAULT 70,
  status TEXT DEFAULT 'operational',
  commissioned_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.production_facilities(id) ON DELETE CASCADE NOT NULL,
  production_date DATE NOT NULL,
  hydrogen_produced_kg NUMERIC NOT NULL,
  energy_consumed_kwh NUMERIC NOT NULL,
  water_consumed_liters NUMERIC,
  efficiency_percent NUMERIC,
  carbon_offset_kg NUMERIC,
  operating_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storage_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  storage_type TEXT CHECK (storage_type IN ('compressed', 'liquid', 'metal_hydride', 'underground')) NOT NULL,
  capacity_kg NUMERIC NOT NULL,
  current_level_kg NUMERIC DEFAULT 0,
  pressure_bar NUMERIC,
  temperature_celsius NUMERIC,
  status TEXT DEFAULT 'operational',
  last_inspection_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.storage_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  storage_id UUID REFERENCES public.storage_facilities(id) ON DELETE CASCADE NOT NULL,
  record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  transaction_type TEXT CHECK (transaction_type IN ('input', 'output')) NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  pressure_bar NUMERIC,
  temperature_celsius NUMERIC,
  energy_used_kwh NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transport_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  route_name TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  transport_type TEXT CHECK (transport_type IN ('tube_trailer', 'tanker', 'pipeline')) NOT NULL,
  vehicle_id TEXT,
  distance_km NUMERIC NOT NULL,
  capacity_kg NUMERIC NOT NULL,
  current_load_kg NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  estimated_arrival TIMESTAMP WITH TIME ZONE,
  cost_per_kg_km NUMERIC,
  energy_cost_kwh NUMERIC,
  pressure_loss_bar NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.renewable_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('solar', 'wind', 'hydro')) NOT NULL,
  capacity_mw NUMERIC NOT NULL,
  capacity_factor NUMERIC DEFAULT 0.25,
  current_output_mw NUMERIC DEFAULT 0,
  uptime_percent NUMERIC DEFAULT 100,
  energy_produced_kwh NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'operational',
  weather_dependent BOOLEAN DEFAULT TRUE,
  installation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.research_papers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT[] NOT NULL,
  publication_year INTEGER,
  journal TEXT,
  doi TEXT,
  abstract TEXT,
  keywords TEXT[],
  category TEXT CHECK (category IN ('production', 'storage', 'transportation', 'safety', 'economics', 'environmental')) NOT NULL,
  pdf_url TEXT,
  relevance_score NUMERIC,
  citation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  total_production_kg NUMERIC,
  total_energy_consumed_kwh NUMERIC,
  total_carbon_offset_kg NUMERIC,
  average_efficiency_percent NUMERIC,
  storage_utilization_percent NUMERIC,
  active_facilities_count INTEGER,
  renewable_energy_percent NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renewable_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (fresh start)

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Production facilities policies
CREATE POLICY "Users can view own production facilities" ON public.production_facilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own production facilities" ON public.production_facilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own production facilities" ON public.production_facilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own production facilities" ON public.production_facilities
  FOR DELETE USING (auth.uid() = user_id);

-- Storage facilities policies
CREATE POLICY "Users can view own storage facilities" ON public.storage_facilities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage facilities" ON public.storage_facilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage facilities" ON public.storage_facilities
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage facilities" ON public.storage_facilities
  FOR DELETE USING (auth.uid() = user_id);

-- Transport routes policies
CREATE POLICY "Users can view own transport routes" ON public.transport_routes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transport routes" ON public.transport_routes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transport routes" ON public.transport_routes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transport routes" ON public.transport_routes
  FOR DELETE USING (auth.uid() = user_id);

-- Renewable sources policies
CREATE POLICY "Users can view own renewable sources" ON public.renewable_sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own renewable sources" ON public.renewable_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own renewable sources" ON public.renewable_sources
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own renewable sources" ON public.renewable_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Research papers policies (public read, authenticated write)
CREATE POLICY "Anyone can view research papers" ON public.research_papers
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert research papers" ON public.research_papers
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update research papers" ON public.research_papers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- System metrics policies
CREATE POLICY "Users can view own system metrics" ON public.system_metrics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own system metrics" ON public.system_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Production records policies
CREATE POLICY "Users can view production records for own facilities" ON public.production_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.production_facilities 
      WHERE id = production_records.facility_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert production records for own facilities" ON public.production_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.production_facilities 
      WHERE id = production_records.facility_id 
      AND user_id = auth.uid()
    )
  );

-- Storage records policies
CREATE POLICY "Users can view storage records for own facilities" ON public.storage_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.storage_facilities 
      WHERE id = storage_records.storage_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert storage records for own facilities" ON public.storage_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.storage_facilities 
      WHERE id = storage_records.storage_id 
      AND user_id = auth.uid()
    )
  );

-- Create analytics function
CREATE OR REPLACE FUNCTION get_analytics_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_facilities', (
      SELECT COUNT(*) FROM public.production_facilities 
      WHERE user_id = auth.uid()
    ),
    'total_production_kg', (
      SELECT COALESCE(SUM(hydrogen_produced_kg), 0) 
      FROM public.production_records pr
      JOIN public.production_facilities pf ON pr.facility_id = pf.id
      WHERE pf.user_id = auth.uid()
    ),
    'total_storage_capacity_kg', (
      SELECT COALESCE(SUM(capacity_kg), 0) 
      FROM public.storage_facilities 
      WHERE user_id = auth.uid()
    ),
    'average_efficiency', (
      SELECT COALESCE(AVG(efficiency_percent), 0) 
      FROM public.production_facilities 
      WHERE user_id = auth.uid()
    ),
    'renewable_energy_percentage', (
      SELECT COALESCE(AVG(uptime_percent), 0) 
      FROM public.renewable_sources 
      WHERE user_id = auth.uid()
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_production_facilities_user_id ON public.production_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_facilities_user_id ON public.storage_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_routes_user_id ON public.transport_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_renewable_sources_user_id ON public.renewable_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_production_records_facility_id ON public.production_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_storage_records_storage_id ON public.storage_records(storage_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_user_id ON public.system_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_research_papers_category ON public.research_papers(category);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers first, then create new ones
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_production_facilities_updated_at ON public.production_facilities;
CREATE TRIGGER update_production_facilities_updated_at BEFORE UPDATE ON public.production_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_storage_facilities_updated_at ON public.storage_facilities;
CREATE TRIGGER update_storage_facilities_updated_at BEFORE UPDATE ON public.storage_facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_transport_routes_updated_at ON public.transport_routes;
CREATE TRIGGER update_transport_routes_updated_at BEFORE UPDATE ON public.transport_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_renewable_sources_updated_at ON public.renewable_sources;
CREATE TRIGGER update_renewable_sources_updated_at BEFORE UPDATE ON public.renewable_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_research_papers_updated_at ON public.research_papers;
CREATE TRIGGER update_research_papers_updated_at BEFORE UPDATE ON public.research_papers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Green Hydrogen Platform database setup completed successfully!' as message;
