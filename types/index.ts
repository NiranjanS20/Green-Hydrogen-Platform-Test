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

// All types are exported above with their individual export statements
// This provides better IDE support and avoids export conflicts