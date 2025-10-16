-- Green Hydrogen Platform - Enterprise Enhancements Database Schema
-- This file contains all the additional tables and features for enterprise deployment

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    sms_enabled BOOLEAN DEFAULT FALSE,
    production_alerts BOOLEAN DEFAULT TRUE,
    storage_alerts BOOLEAN DEFAULT TRUE,
    transport_alerts BOOLEAN DEFAULT TRUE,
    system_alerts BOOLEAN DEFAULT TRUE,
    maintenance_alerts BOOLEAN DEFAULT TRUE,
    threshold_alerts BOOLEAN DEFAULT TRUE,
    daily_summary BOOLEAN DEFAULT TRUE,
    weekly_report BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT AND LOGGING SYSTEM
-- =============================================

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
    message TEXT NOT NULL,
    component VARCHAR(100) NOT NULL,
    function_name VARCHAR(100),
    error_stack TEXT,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- KPI AND ANALYTICS ENHANCEMENT
-- =============================================

-- KPIs table
CREATE TABLE IF NOT EXISTS kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    formula TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    target_value DECIMAL(15,4),
    current_value DECIMAL(15,4) NOT NULL,
    trend VARCHAR(10) CHECK (trend IN ('up', 'down', 'stable')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('production', 'efficiency', 'cost', 'environmental', 'safety')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Benchmarks table
CREATE TABLE IF NOT EXISTS benchmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    industry_average DECIMAL(15,4) NOT NULL,
    best_in_class DECIMAL(15,4) NOT NULL,
    our_performance DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    source VARCHAR(255),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- DEMO MODE SYSTEM
-- =============================================

-- Demo configurations table
CREATE TABLE IF NOT EXISTS demo_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    duration_minutes INTEGER DEFAULT 60,
    reset_interval_hours INTEGER DEFAULT 24,
    sample_data_size VARCHAR(10) DEFAULT 'medium' CHECK (sample_data_size IN ('small', 'medium', 'large')),
    features_enabled TEXT[] DEFAULT '{}',
    restrictions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    config_id UUID REFERENCES demo_configs(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    actions_taken JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENHANCED SIMULATION SYSTEM
-- =============================================

-- Simulation scenarios table
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL DEFAULT 'custom' CHECK (type IN ('optimistic', 'base', 'pessimistic', 'custom')),
    parameters JSONB NOT NULL,
    results JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RESEARCH PAPER ENHANCEMENTS
-- =============================================

-- Research paper metadata table
CREATE TABLE IF NOT EXISTS research_paper_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID REFERENCES research_papers(id) ON DELETE CASCADE,
    file_size_bytes BIGINT,
    page_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    extracted_text TEXT,
    citations_count INTEGER DEFAULT 0,
    references TEXT[] DEFAULT '{}',
    figures_count INTEGER DEFAULT 0,
    tables_count INTEGER DEFAULT 0,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External datasets table
CREATE TABLE IF NOT EXISTS external_datasets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_url TEXT NOT NULL,
    api_endpoint TEXT,
    data_format VARCHAR(10) NOT NULL CHECK (data_format IN ('json', 'csv', 'xml', 'api')),
    update_frequency VARCHAR(20) NOT NULL CHECK (update_frequency IN ('real-time', 'hourly', 'daily', 'weekly', 'monthly')),
    last_sync TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONTRIBUTOR AND VERSION MANAGEMENT
-- =============================================

-- Contributors table
CREATE TABLE IF NOT EXISTS contributors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('developer', 'designer', 'analyst', 'tester', 'manager')),
    avatar_url TEXT,
    github_username VARCHAR(100),
    linkedin_url TEXT,
    bio TEXT,
    active BOOLEAN DEFAULT TRUE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contributions table
CREATE TABLE IF NOT EXISTS contributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contributor_id UUID REFERENCES contributors(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('feature', 'bugfix', 'documentation', 'design', 'analysis')),
    description TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    commit_hash VARCHAR(40),
    pull_request_url TEXT,
    lines_added INTEGER DEFAULT 0,
    lines_removed INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version VARCHAR(20) NOT NULL UNIQUE,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('major', 'minor', 'patch', 'hotfix')),
    changelog JSONB NOT NULL DEFAULT '[]',
    breaking_changes TEXT[] DEFAULT '{}',
    migration_notes TEXT,
    download_url TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PERFORMANCE MONITORING
-- =============================================

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    component VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id UUID,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RATE LIMITING
-- =============================================

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    limit_count INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,
    user_specific BOOLEAN DEFAULT TRUE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(endpoint, method)
);

-- Rate limit usage tracking
CREATE TABLE IF NOT EXISTS rate_limit_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_limit_id UUID REFERENCES rate_limits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ip_address INET,
    request_count INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MULTI-REGION SUPPORT
-- =============================================

-- Region configurations table
CREATE TABLE IF NOT EXISTS region_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    primary_region BOOLEAN DEFAULT FALSE,
    supabase_url TEXT NOT NULL,
    supabase_key TEXT NOT NULL,
    latency_ms INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'offline')),
    health_check_url TEXT,
    last_health_check TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- System log indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_component ON system_logs(component);

-- Performance metric indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);

-- Rate limit indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_user_id ON rate_limit_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_usage_window_start ON rate_limit_usage(window_start);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_paper_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_usage ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can manage their notification settings" ON notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- Audit log policies (admin only for viewing)
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.admin_status = 'active'
        )
    );

-- System log policies (admin only)
CREATE POLICY "Admins can view system logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin' 
            AND profiles.admin_status = 'active'
        )
    );

-- KPI policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view KPIs" ON kpis
    FOR SELECT USING (auth.role() = 'authenticated');

-- Benchmark policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view benchmarks" ON benchmarks
    FOR SELECT USING (auth.role() = 'authenticated');

-- Demo session policies
CREATE POLICY "Users can manage their demo sessions" ON demo_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Simulation scenario policies
CREATE POLICY "Users can manage their simulation scenarios" ON simulation_scenarios
    FOR ALL USING (auth.uid() = user_id);

-- Research paper metadata policies
CREATE POLICY "Users can view research paper metadata" ON research_paper_metadata
    FOR SELECT USING (auth.role() = 'authenticated');

-- Performance metrics policies
CREATE POLICY "Users can view their performance metrics" ON performance_metrics
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Rate limit usage policies
CREATE POLICY "Users can view their rate limit usage" ON rate_limit_usage
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_updated_at BEFORE UPDATE ON kpis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_configs_updated_at BEFORE UPDATE ON demo_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_simulation_scenarios_updated_at BEFORE UPDATE ON simulation_scenarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_datasets_updated_at BEFORE UPDATE ON external_datasets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at BEFORE UPDATE ON rate_limits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_region_configs_updated_at BEFORE UPDATE ON region_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS FOR ENTERPRISE FEATURES
-- =============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info',
    p_priority TEXT DEFAULT 'medium',
    p_action_url TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, title, message, type, priority, action_url, metadata)
    VALUES (p_user_id, p_title, p_message, p_type, p_priority, p_action_url, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_session_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, session_id)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_old_values, p_new_values, p_ip_address, p_user_agent, p_session_id)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_endpoint TEXT,
    p_method TEXT,
    p_user_id UUID,
    p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    rate_limit_record RECORD;
    current_usage INTEGER;
    window_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get rate limit configuration
    SELECT * INTO rate_limit_record
    FROM rate_limits
    WHERE endpoint = p_endpoint AND method = p_method AND enabled = TRUE;
    
    IF NOT FOUND THEN
        RETURN TRUE; -- No rate limit configured
    END IF;
    
    -- Calculate window start time
    window_start := NOW() - (rate_limit_record.window_seconds || ' seconds')::INTERVAL;
    
    -- Get current usage count
    SELECT COALESCE(SUM(request_count), 0) INTO current_usage
    FROM rate_limit_usage
    WHERE rate_limit_id = rate_limit_record.id
    AND (rate_limit_record.user_specific = FALSE OR user_id = p_user_id)
    AND window_start >= window_start;
    
    -- Check if limit exceeded
    IF current_usage >= rate_limit_record.limit_count THEN
        RETURN FALSE;
    END IF;
    
    -- Record this request
    INSERT INTO rate_limit_usage (rate_limit_id, user_id, ip_address, request_count, window_start)
    VALUES (rate_limit_record.id, p_user_id, p_ip_address, 1, NOW())
    ON CONFLICT (rate_limit_id, user_id, window_start) 
    DO UPDATE SET request_count = rate_limit_usage.request_count + 1;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default rate limits
INSERT INTO rate_limits (endpoint, method, limit_count, window_seconds, user_specific) VALUES
('/api/production', 'POST', 10, 60, TRUE),
('/api/storage', 'POST', 10, 60, TRUE),
('/api/transportation', 'POST', 5, 60, TRUE),
('/api/renewable-sources', 'POST', 10, 60, TRUE),
('/api/research-papers', 'POST', 5, 300, TRUE),
('/api/simulation', 'POST', 3, 300, TRUE),
('/api/analytics', 'GET', 30, 60, TRUE),
('/api/files', 'POST', 5, 300, TRUE)
ON CONFLICT (endpoint, method) DO NOTHING;

-- Insert default KPIs
INSERT INTO kpis (name, description, formula, unit, current_value, category) VALUES
('Hydrogen Production Efficiency', 'Overall efficiency of hydrogen production across all facilities', 'SUM(hydrogen_produced_kg) / SUM(energy_input_kwh) * 100', '%', 0, 'efficiency'),
('Carbon Offset Total', 'Total carbon offset achieved through green hydrogen production', 'SUM(carbon_offset_kg)', 'kg CO2', 0, 'environmental'),
('Production Capacity Utilization', 'Percentage of total production capacity being utilized', 'SUM(current_production) / SUM(max_capacity) * 100', '%', 0, 'production'),
('Storage Utilization Rate', 'Average storage facility utilization across the system', 'AVG(current_level_kg / capacity_kg) * 100', '%', 0, 'production'),
('Transport Efficiency', 'Efficiency of transportation routes based on capacity utilization', 'AVG(current_load_kg / capacity_kg) * 100', '%', 0, 'efficiency'),
('Renewable Energy Integration', 'Percentage of energy from renewable sources', 'renewable_energy_kwh / total_energy_kwh * 100', '%', 0, 'environmental'),
('System Uptime', 'Overall system availability and uptime', 'operational_hours / total_hours * 100', '%', 99.5, 'production'),
('Cost per kg H2', 'Average cost to produce one kilogram of hydrogen', 'total_production_cost / total_hydrogen_produced', 'USD/kg', 0, 'cost')
ON CONFLICT (name) DO NOTHING;

-- Insert industry benchmarks
INSERT INTO benchmarks (name, category, industry_average, best_in_class, our_performance, unit, source) VALUES
('Electrolyzer Efficiency', 'Production', 70.0, 85.0, 0, '%', 'IEA Hydrogen Report 2023'),
('Hydrogen Production Cost', 'Cost', 5.50, 3.20, 0, 'USD/kg', 'BloombergNEF 2023'),
('Storage Capacity Factor', 'Storage', 65.0, 80.0, 0, '%', 'Hydrogen Council 2023'),
('Transport Efficiency', 'Transportation', 75.0, 90.0, 0, '%', 'Industry Analysis 2023'),
('Carbon Intensity', 'Environmental', 2.1, 0.5, 0, 'kg CO2/kg H2', 'IRENA 2023'),
('System Availability', 'Production', 95.0, 99.0, 0, '%', 'Industrial Standards'),
('Energy Consumption', 'Efficiency', 55.0, 45.0, 0, 'kWh/kg H2', 'Technical Literature'),
('Renewable Integration', 'Environmental', 60.0, 95.0, 0, '%', 'Green Hydrogen Observatory')
ON CONFLICT (name, category) DO NOTHING;

-- Insert default demo configuration
INSERT INTO demo_configs (name, enabled, duration_minutes, sample_data_size, features_enabled) VALUES
('Standard Demo', FALSE, 60, 'medium', ARRAY['production', 'storage', 'transportation', 'analytics'])
ON CONFLICT DO NOTHING;

-- Create initial version record
INSERT INTO versions (version, type, changelog, published) VALUES
('2.0.0', 'major', '[
    {"type": "added", "description": "Enterprise notification system", "author": "System"},
    {"type": "added", "description": "Comprehensive audit logging", "author": "System"},
    {"type": "added", "description": "KPI and benchmark tracking", "author": "System"},
    {"type": "added", "description": "Demo mode functionality", "author": "System"},
    {"type": "added", "description": "Enhanced simulation scenarios", "author": "System"},
    {"type": "added", "description": "Rate limiting system", "author": "System"},
    {"type": "added", "description": "Multi-region support", "author": "System"},
    {"type": "added", "description": "Performance monitoring", "author": "System"}
]'::jsonb, TRUE)
ON CONFLICT (version) DO NOTHING;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE notifications IS 'System-wide notification management for users';
COMMENT ON TABLE notification_settings IS 'User preferences for notification delivery and types';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit trail for all system actions';
COMMENT ON TABLE system_logs IS 'System-level logging for debugging and monitoring';
COMMENT ON TABLE kpis IS 'Key Performance Indicators tracking';
COMMENT ON TABLE benchmarks IS 'Industry benchmark comparisons';
COMMENT ON TABLE demo_configs IS 'Demo mode configurations for system demonstrations';
COMMENT ON TABLE demo_sessions IS 'Active demo sessions tracking';
COMMENT ON TABLE simulation_scenarios IS 'Enhanced simulation scenario management';
COMMENT ON TABLE research_paper_metadata IS 'Extended metadata for research papers';
COMMENT ON TABLE external_datasets IS 'External data source integrations';
COMMENT ON TABLE contributors IS 'Platform contributor profiles';
COMMENT ON TABLE contributions IS 'Individual contribution tracking';
COMMENT ON TABLE versions IS 'Version management and changelog';
COMMENT ON TABLE performance_metrics IS 'System performance monitoring';
COMMENT ON TABLE rate_limits IS 'API rate limiting configurations';
COMMENT ON TABLE rate_limit_usage IS 'Rate limit usage tracking';
COMMENT ON TABLE region_configs IS 'Multi-region deployment configurations';

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Complete enterprise enhancement setup
SELECT 'Enterprise enhancements database setup completed successfully!' as status;
