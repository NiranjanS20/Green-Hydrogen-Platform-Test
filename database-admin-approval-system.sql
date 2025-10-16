-- Admin Approval System Database Migration
-- This adds approval workflow for all facility installations and admin authorization

-- Add admin_status column to profiles table if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS admin_status TEXT CHECK (admin_status IN ('pending', 'active', 'suspended')) DEFAULT NULL;

-- Add approval workflow columns to all facility tables
ALTER TABLE public.production_facilities 
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.storage_facilities 
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.renewable_sources 
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE public.transport_routes 
ADD COLUMN IF NOT EXISTS approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS vehicle_filled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS admin_authorized BOOLEAN DEFAULT FALSE;

-- Create alerts table for real-time notifications
CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT CHECK (alert_type IN ('approval_request', 'facility_approved', 'facility_rejected', 'production_alert', 'transport_alert', 'system_alert')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  related_table TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create daily production tracking table
CREATE TABLE IF NOT EXISTS public.daily_production_targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID REFERENCES public.production_facilities(id) ON DELETE CASCADE NOT NULL,
  target_date DATE NOT NULL,
  target_production_kg NUMERIC DEFAULT 2,
  actual_production_kg NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'completed', 'missed')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(facility_id, target_date)
);

-- Add RLS policies for new tables
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_production_targets ENABLE ROW LEVEL SECURITY;

-- Alerts policies
CREATE POLICY "Users can view own alerts" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert alerts" ON public.alerts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own alerts" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily production targets policies
CREATE POLICY "Users can view production targets for own facilities" ON public.daily_production_targets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.production_facilities 
      WHERE id = daily_production_targets.facility_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage production targets" ON public.daily_production_targets
  FOR ALL USING (true);

-- Admin policies for approval workflow
CREATE POLICY "Admins can view all facilities for approval" ON public.production_facilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can approve production facilities" ON public.production_facilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

-- Similar policies for other facility types
CREATE POLICY "Admins can view all storage for approval" ON public.storage_facilities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can approve storage facilities" ON public.storage_facilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can view all renewable for approval" ON public.renewable_sources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can approve renewable sources" ON public.renewable_sources
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can view all transport for approval" ON public.transport_routes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

CREATE POLICY "Admins can authorize transport routes" ON public.transport_routes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'admin' 
      AND admin_status = 'active'
    )
  );

-- Function to create alert when facility needs approval
CREATE OR REPLACE FUNCTION create_approval_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Create alert for admins when new facility is created
  INSERT INTO public.alerts (
    alert_type,
    title,
    message,
    severity,
    related_table,
    related_id
  ) VALUES (
    'approval_request',
    'New Facility Approval Required',
    'A new ' || TG_TABLE_NAME || ' "' || NEW.name || '" requires admin approval.',
    'warning',
    TG_TABLE_NAME,
    NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for approval alerts
DROP TRIGGER IF EXISTS production_approval_alert ON public.production_facilities;
CREATE TRIGGER production_approval_alert
  AFTER INSERT ON public.production_facilities
  FOR EACH ROW EXECUTE FUNCTION create_approval_alert();

DROP TRIGGER IF EXISTS storage_approval_alert ON public.storage_facilities;
CREATE TRIGGER storage_approval_alert
  AFTER INSERT ON public.storage_facilities
  FOR EACH ROW EXECUTE FUNCTION create_approval_alert();

DROP TRIGGER IF EXISTS renewable_approval_alert ON public.renewable_sources;
CREATE TRIGGER renewable_approval_alert
  AFTER INSERT ON public.renewable_sources
  FOR EACH ROW EXECUTE FUNCTION create_approval_alert();

DROP TRIGGER IF EXISTS transport_approval_alert ON public.transport_routes;
CREATE TRIGGER transport_approval_alert
  AFTER INSERT ON public.transport_routes
  FOR EACH ROW EXECUTE FUNCTION create_approval_alert();

-- Function to create daily production targets
CREATE OR REPLACE FUNCTION create_daily_production_targets()
RETURNS void AS $$
DECLARE
  facility_record RECORD;
  target_date DATE := CURRENT_DATE;
BEGIN
  -- Create daily targets for all approved production facilities
  FOR facility_record IN 
    SELECT id FROM public.production_facilities 
    WHERE approval_status = 'approved' AND status = 'operational'
  LOOP
    INSERT INTO public.daily_production_targets (facility_id, target_date, target_production_kg)
    VALUES (facility_record.id, target_date, 2)
    ON CONFLICT (facility_id, target_date) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_read ON public.alerts(read);
CREATE INDEX IF NOT EXISTS idx_daily_production_facility_date ON public.daily_production_targets(facility_id, target_date);
CREATE INDEX IF NOT EXISTS idx_production_approval_status ON public.production_facilities(approval_status);
CREATE INDEX IF NOT EXISTS idx_storage_approval_status ON public.storage_facilities(approval_status);
CREATE INDEX IF NOT EXISTS idx_renewable_approval_status ON public.renewable_sources(approval_status);
CREATE INDEX IF NOT EXISTS idx_transport_approval_status ON public.transport_routes(approval_status);

-- Success message
SELECT 'Admin approval system setup completed successfully!' as message;
