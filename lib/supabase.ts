import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Types for database tables
export interface Profile {
  id: string
  email: string
  full_name: string | null
  organization: string | null
  role: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface RenewableSource {
  id: string
  user_id: string
  name: string
  type: 'solar' | 'wind' | 'hydro'
  capacity_mw: number
  location: string | null
  latitude: number | null
  longitude: number | null
  efficiency_percent: number | null
  status: 'active' | 'maintenance' | 'inactive'
  installation_date: string | null
  created_at: string
  updated_at: string
}

export interface ProductionFacility {
  id: string
  user_id: string
  name: string
  location: string
  electrolyzer_type: 'PEM' | 'Alkaline' | 'SOEC'
  capacity_kg_per_day: number
  energy_source_id: string | null
  efficiency_percent: number | null
  status: string
  commissioned_date: string | null
  created_at: string
  updated_at: string
}

export interface ProductionRecord {
  id: string
  facility_id: string
  production_date: string
  hydrogen_produced_kg: number
  energy_consumed_kwh: number
  water_consumed_liters: number | null
  efficiency_percent: number | null
  carbon_offset_kg: number | null
  operating_hours: number | null
  notes: string | null
  created_at: string
}

export interface StorageFacility {
  id: string
  user_id: string
  name: string
  location: string
  storage_type: 'compressed' | 'liquid' | 'metal_hydride' | 'underground'
  capacity_kg: number
  current_level_kg: number
  pressure_bar: number | null
  temperature_celsius: number | null
  status: string
  last_inspection_date: string | null
  created_at: string
  updated_at: string
}

export interface StorageRecord {
  id: string
  storage_id: string
  record_date: string
  transaction_type: 'input' | 'output'
  quantity_kg: number
  pressure_bar: number | null
  temperature_celsius: number | null
  energy_used_kwh: number | null
  notes: string | null
  created_at: string
}

export interface TransportationVehicle {
  id: string
  user_id: string
  vehicle_id: string
  vehicle_type: 'tube_trailer' | 'tanker' | 'pipeline'
  capacity_kg: number
  status: 'available' | 'in_transit' | 'maintenance'
  current_location: string | null
  last_maintenance_date: string | null
  created_at: string
  updated_at: string
}

export interface TransportationRoute {
  id: string
  vehicle_id: string
  origin_storage_id: string | null
  destination: string
  departure_time: string | null
  estimated_arrival: string | null
  actual_arrival: string | null
  quantity_kg: number
  distance_km: number | null
  status: 'scheduled' | 'in_transit' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Simulation {
  id: string
  user_id: string
  name: string
  description: string | null
  energy_source_type: string
  energy_capacity_mw: number
  electrolyzer_type: string
  electrolyzer_efficiency: number | null
  production_target_kg_per_day: number | null
  simulation_results: Record<string, unknown>
  created_at: string
}

export interface ResearchPaper {
  id: string
  title: string
  authors: string[]
  publication_year: number | null
  journal: string | null
  doi: string | null
  abstract: string | null
  category: 'production' | 'storage' | 'transportation' | 'efficiency'
  pdf_url: string | null
  citation_count: number
  created_at: string
}

export interface SystemMetrics {
  id: string
  user_id: string
  metric_date: string
  total_production_kg: number | null
  total_energy_consumed_kwh: number | null
  total_carbon_offset_kg: number | null
  average_efficiency_percent: number | null
  storage_utilization_percent: number | null
  active_facilities_count: number | null
  created_at: string
}

// Auth helper functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}