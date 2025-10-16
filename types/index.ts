// Core User and Authentication Types
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'admin' | 'operator' | 'researcher' | 'viewer';
  created_at: string;
  updated_at: string;
}

// Production Facility Types
export interface ProductionFacility {
  id: string;
  name: string;
  location: string;
  electrolyzer_type: 'PEM' | 'Alkaline' | 'SOEC';
  capacity_kg_per_day: number;
  efficiency_percent: number;
  status: 'operational' | 'maintenance' | 'offline';
  energy_input_kwh: number;
  hydrogen_produced_kg: number;
  water_consumption_liters: number;
  carbon_offset_kg: number;
  temperature_celsius?: number;
  pressure_bar?: number;
  current_density_acm2?: number;
  operating_hours: number;
  created_at: string;
  updated_at: string;
}

// Storage Facility Types
export interface StorageFacility {
  id: string;
  name: string;
  location: string;
  storage_type: 'compressed' | 'liquid' | 'underground' | 'metal_hydride';
  capacity_kg: number;
  current_level_kg: number;
  pressure_bar?: number;
  temperature_celsius?: number;
  utilization_percent: number;
  status: 'operational' | 'maintenance' | 'offline';
  safety_status: 'normal' | 'warning' | 'critical';
  last_inspection_date?: string;
  created_at: string;
  updated_at: string;
}

// Transportation Route Types
export interface TransportRoute {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  transport_type: 'tube_trailer' | 'tanker' | 'pipeline';
  vehicle_id?: string;
  distance_km: number;
  capacity_kg: number;
  current_load_kg: number;
  status: 'scheduled' | 'in_transit' | 'delivered' | 'active';
  estimated_arrival?: string;
  cost_per_kg_km: number;
  energy_cost_kwh?: number;
  pressure_loss_bar?: number;
  created_at: string;
  updated_at: string;
}

// Renewable Energy Source Types
export interface RenewableSource {
  id: string;
  name: string;
  location: string;
  source_type: 'solar' | 'wind' | 'hydro';
  capacity_mw: number;
  capacity_factor: number;
  current_output_mw: number;
  uptime_percent: number;
  energy_produced_kwh: number;
  status: 'operational' | 'maintenance' | 'offline';
  weather_dependent: boolean;
  installation_date: string;
  created_at: string;
  updated_at: string;
}

// Research Paper Types
export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  journal?: string;
  publication_date: string;
  doi?: string;
  abstract: string;
  keywords: string[];
  category: 'production' | 'storage' | 'transportation' | 'safety' | 'economics' | 'environmental';
  pdf_url?: string;
  relevance_score?: number;
  created_at: string;
  updated_at: string;
}

// Simulation Types
export interface SimulationInput {
  energy_input_kwh: number;
  electrolyzer_efficiency: number;
  electrolyzer_type?: 'PEM' | 'Alkaline' | 'SOEC';
  temperature_celsius?: number;
  pressure_bar?: number;
  current_density_acm2?: number;
  operating_hours?: number;
}

export interface SimulationResult {
  hydrogen_produced_kg: number;
  water_consumption_liters: number;
  carbon_offset_kg: number;
  energy_efficiency_percent: number;
  production_cost_usd?: number;
  compression_energy_kwh?: number;
  liquefaction_energy_kwh?: number;
}

// Analytics and Metrics Types
export interface SystemMetrics {
  id: string;
  user_id?: string;
  metric_date: string;
  total_production_kg: number;
  total_energy_consumed_kwh: number;
  total_carbon_offset_kg: number;
  average_efficiency_percent: number;
  active_facilities_count: number;
  storage_utilization_percent: number;
  renewable_energy_percent: number;
  created_at: string;
}

export interface ProductionMetrics {
  energy_input_kwh: number;
  hydrogen_produced_kg: number;
  carbon_offset_kg: number;
  efficiency_percent: number;
  water_consumption_liters: number;
}

export interface AnalyticsSummary {
  total_facilities: number;
  total_production_kg: number;
  total_storage_capacity_kg: number;
  average_efficiency: number;
  renewable_energy_percentage: number;
  carbon_offset_total_kg: number;
  monthly_trends: MonthlyTrend[];
  energy_source_breakdown: EnergySourceBreakdown[];
}

export interface MonthlyTrend {
  month: string;
  production_kg: number;
  energy_kwh: number;
  efficiency_percent: number;
  target_kg?: number;
}

export interface EnergySourceBreakdown {
  name: string;
  type: 'solar' | 'wind' | 'hydro';
  value: number;
  percentage: number;
  color: string;
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface EfficiencyData {
  day: string;
  pem: number;
  alkaline: number;
  soec: number;
}

export interface ProductionData {
  month: string;
  production: number;
  target: number;
  energy?: number;
}

// Component Props Types
export interface ProductionMetricsProps {
  energyInputKwh?: number;
  electrolyzerEfficiency?: number;
}

export interface StorageStatusProps {
  name?: string;
  currentLevelKg?: number;
  capacityKg?: number;
  pressureBar?: number;
}

export interface EnergySourceCardProps {
  name?: string;
  type?: 'solar' | 'wind' | 'hydro' | string;
  capacityMw?: number;
}

// Calculation Function Types
export interface CalculationParams {
  energyInput: number;
  efficiency: number;
  electrolyzerType?: 'PEM' | 'Alkaline' | 'SOEC';
  temperature?: number;
  pressure?: number;
  currentDensity?: number;
}

export interface LCOHParams {
  capexUSD: number;
  annualOpexUSD: number;
  annualProductionKg: number;
  lifetimeYears: number;
  discountRate: number;
}

export interface TransportationCostParams {
  hydrogenKg: number;
  distanceKm: number;
  transportType: 'tube_trailer' | 'tanker' | 'pipeline';
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface ProductionFacilityForm {
  name: string;
  location: string;
  electrolyzer_type: 'PEM' | 'Alkaline' | 'SOEC';
  capacity_kg_per_day: number;
  efficiency_percent: number;
  operating_hours: number;
}

export interface StorageFacilityForm {
  name: string;
  location: string;
  storage_type: 'compressed' | 'liquid' | 'underground' | 'metal_hydride';
  capacity_kg: number;
  pressure_bar?: number;
  temperature_celsius?: number;
}

export interface TransportRouteForm {
  route_name: string;
  origin: string;
  destination: string;
  transport_type: 'tube_trailer' | 'tanker' | 'pipeline';
  distance_km: number;
  capacity_kg: number;
}

export interface RenewableSourceForm {
  name: string;
  location: string;
  source_type: 'solar' | 'wind' | 'hydro';
  capacity_mw: number;
  capacity_factor: number;
  installation_date: string;
}

// Status and State Types
export type FacilityStatus = 'operational' | 'maintenance' | 'offline';
export type SafetyStatus = 'normal' | 'warning' | 'critical';
export type TransportStatus = 'scheduled' | 'in_transit' | 'delivered' | 'active';
export type ElectrolyzerType = 'PEM' | 'Alkaline' | 'SOEC';
export type StorageType = 'compressed' | 'liquid' | 'underground' | 'metal_hydride';
export type TransportType = 'tube_trailer' | 'tanker' | 'pipeline';
export type RenewableType = 'solar' | 'wind' | 'hydro';
export type UserRole = 'admin' | 'operator' | 'researcher' | 'viewer';
export type ResearchCategory = 'production' | 'storage' | 'transportation' | 'safety' | 'economics' | 'environmental';

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Database Table Names (for type safety with Supabase)
export type DatabaseTables = 
  | 'production_facilities'
  | 'storage_facilities' 
  | 'transport_routes'
  | 'renewable_sources'
  | 'research_papers'
  | 'system_metrics'
  | 'users';

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

// Navigation and UI Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: any;
  current?: boolean;
  children?: NavigationItem[];
}

export interface DashboardCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: any;
  description?: string;
}

// Enhanced Enterprise Features Types

// Notification System Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface NotificationSettings {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled?: boolean;
  production_alerts: boolean;
  storage_alerts: boolean;
  transport_alerts: boolean;
  system_alerts: boolean;
  maintenance_alerts: boolean;
  threshold_alerts: boolean;
  daily_summary: boolean;
  weekly_report: boolean;
}

// Data Import/Export Types
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  tables: DatabaseTables[];
  includeMetadata: boolean;
  compression?: boolean;
}

export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  recordsImported: number;
  errors: ImportError[];
  warnings: string[];
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

// Demo Mode Types
export interface DemoConfig {
  enabled: boolean;
  duration_minutes: number;
  reset_interval_hours: number;
  sample_data_size: 'small' | 'medium' | 'large';
  features_enabled: string[];
  restrictions: string[];
}

export interface DemoSession {
  id: string;
  user_id: string;
  started_at: string;
  expires_at: string;
  config: DemoConfig;
  actions_taken: DemoAction[];
}

export interface DemoAction {
  timestamp: string;
  action: string;
  entity_type: string;
  entity_id: string;
  data: Record<string, any>;
}

// Audit and Logging Types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  session_id?: string;
}

export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  component: string;
  function_name?: string;
  error_stack?: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// Rate Limiting Types
export interface RateLimit {
  endpoint: string;
  method: string;
  limit: number;
  window_seconds: number;
  user_specific: boolean;
}

export interface RateLimitStatus {
  remaining: number;
  reset_time: string;
  limit: number;
}

// KPI and Analytics Enhancement Types
export interface KPI {
  id: string;
  name: string;
  description: string;
  formula: string;
  unit: string;
  target_value?: number;
  current_value: number;
  trend: 'up' | 'down' | 'stable';
  category: 'production' | 'efficiency' | 'cost' | 'environmental' | 'safety';
  updated_at: string;
}

export interface Benchmark {
  id: string;
  name: string;
  category: string;
  industry_average: number;
  best_in_class: number;
  our_performance: number;
  unit: string;
  source: string;
  last_updated: string;
}

// Supply Chain Simulation Types
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: 'optimistic' | 'base' | 'pessimistic' | 'custom';
  parameters: SimulationParameters;
  results?: SimulationResults;
  created_at: string;
}

export interface SimulationParameters {
  duration_days: number;
  production_multiplier: number;
  energy_cost_multiplier: number;
  demand_multiplier: number;
  weather_impact: boolean;
  maintenance_schedule: boolean;
  market_volatility: number;
}

export interface SimulationResults {
  total_production_kg: number;
  total_cost_usd: number;
  average_efficiency: number;
  carbon_offset_kg: number;
  revenue_usd: number;
  profit_margin: number;
  roi_percent: number;
  daily_breakdown: DailySimulationResult[];
}

export interface DailySimulationResult {
  date: string;
  production_kg: number;
  energy_consumed_kwh: number;
  cost_usd: number;
  efficiency_percent: number;
  weather_factor: number;
}

// Research Paper Enhancement Types
export interface ResearchPaperMetadata {
  id: string;
  paper_id: string;
  file_size_bytes: number;
  page_count: number;
  language: string;
  extracted_text?: string;
  citations_count: number;
  references: string[];
  figures_count: number;
  tables_count: number;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ExternalDataset {
  id: string;
  name: string;
  description: string;
  source_url: string;
  api_endpoint?: string;
  data_format: 'json' | 'csv' | 'xml' | 'api';
  update_frequency: 'real-time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  last_sync: string;
  status: 'active' | 'inactive' | 'error';
}

// Contributor and Version Management Types
export interface Contributor {
  id: string;
  name: string;
  email: string;
  role: 'developer' | 'designer' | 'analyst' | 'tester' | 'manager';
  avatar_url?: string;
  github_username?: string;
  linkedin_url?: string;
  contributions: Contribution[];
  joined_at: string;
}

export interface Contribution {
  type: 'feature' | 'bugfix' | 'documentation' | 'design' | 'analysis';
  description: string;
  date: string;
  commit_hash?: string;
  pull_request_url?: string;
}

export interface Version {
  version: string;
  release_date: string;
  type: 'major' | 'minor' | 'patch' | 'hotfix';
  changelog: ChangelogEntry[];
  breaking_changes: string[];
  migration_notes?: string;
  download_url?: string;
}

export interface ChangelogEntry {
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  description: string;
  issue_number?: string;
  author: string;
}

// Error Boundary Types
export interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
}

// Performance Monitoring Types
export interface PerformanceMetric {
  id: string;
  metric_name: string;
  value: number;
  unit: string;
  timestamp: string;
  component?: string;
  user_id?: string;
  session_id?: string;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
  error?: string;
}

// Theme and Accessibility Types
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  reduced_motion: boolean;
}

export interface AccessibilitySettings {
  screen_reader: boolean;
  keyboard_navigation: boolean;
  high_contrast: boolean;
  large_text: boolean;
  reduced_motion: boolean;
  focus_indicators: boolean;
  alt_text_enabled: boolean;
}

// Multi-region and Failover Types
export interface RegionConfig {
  id: string;
  name: string;
  code: string;
  primary: boolean;
  supabase_url: string;
  supabase_key: string;
  latency_ms: number;
  status: 'active' | 'maintenance' | 'offline';
}

export interface FailoverConfig {
  enabled: boolean;
  health_check_interval_seconds: number;
  failover_threshold_ms: number;
  auto_recovery: boolean;
  notification_enabled: boolean;
}

// All types are exported above with their individual export statements
// This provides better IDE support and avoids export conflicts