// Physical Constants and Reference Values
// Based on scientific research papers and industry standards

/**
 * Hydrogen Properties
 * Reference: DOI: 10.1016/j.ijhydene.2020.08.253
 */
export const HYDROGEN_CONSTANTS = {
  LOWER_HEATING_VALUE: 120, // MJ/kg (33.3 kWh/kg)
  HIGHER_HEATING_VALUE: 142, // MJ/kg (39.4 kWh/kg)
  ENERGY_PER_KG_LHV: 33.3, // kWh/kg
  ENERGY_PER_KG_HHV: 39.4, // kWh/kg
  DENSITY_GAS_STP: 0.0899, // kg/m³ at STP (Standard Temperature Pressure)
  DENSITY_LIQUID: 70.8, // kg/m³ at -253°C
  MOLECULAR_WEIGHT: 2.016, // g/mol
  BOILING_POINT: -252.87, // °C
  CRITICAL_TEMPERATURE: -240, // °C
  CRITICAL_PRESSURE: 13, // bar
} as const

/**
 * Water Electrolysis Constants
 * Reference: DOI: 10.1016/j.rser.2015.07.082
 */
export const ELECTROLYSIS_CONSTANTS = {
  WATER_PER_KG_H2_THEORETICAL: 9, // liters per kg H2
  WATER_PER_KG_H2_PRACTICAL: 10.5, // liters per kg H2 (including losses)
  OXYGEN_PRODUCED_PER_KG_H2: 8, // kg O2 per kg H2
  MIN_VOLTAGE_THEORETICAL: 1.23, // V (thermodynamic minimum)
  PRACTICAL_VOLTAGE_RANGE: [1.8, 2.2], // V (typical operating range)
  FARADAY_CONSTANT: 96485, // C/mol
  CELL_EFFICIENCY_TYPICAL: [60, 80], // % range
} as const

/**
 * Electrolyzer Types and Characteristics
 * Reference: DOI: 10.1016/j.enconman.2019.112108
 */
export const ELECTROLYZER_TYPES = {
  PEM: {
    name: 'Proton Exchange Membrane',
    efficiency: [60, 70], // % range
    operatingTemp: [50, 80], // °C
    operatingPressure: [30, 80], // bar
    currentDensity: [1, 3], // A/cm²
    responseTime: 'fast', // seconds to minutes
    partLoadCapability: 'excellent',
    advantages: ['Compact', 'High current density', 'Fast response', 'High pressure capability'],
    disadvantages: ['Expensive catalysts (Pt, Ir)', 'Acidic environment'],
    maturityLevel: 'Commercial',
    typicalCapacity: [1, 10], // MW range
  },
  Alkaline: {
    name: 'Alkaline Electrolyzer',
    efficiency: [50, 65], // % range
    operatingTemp: [60, 90], // °C
    operatingPressure: [1, 30], // bar
    currentDensity: [0.2, 0.4], // A/cm²
    responseTime: 'medium', // minutes to hours
    partLoadCapability: 'good',
    advantages: ['Mature technology', 'Low cost materials', 'Long lifetime'],
    disadvantages: ['Lower current density', 'Slower response', 'Caustic electrolyte'],
    maturityLevel: 'Mature',
    typicalCapacity: [0.5, 100], // MW range
  },
  SOEC: {
    name: 'Solid Oxide Electrolyzer Cell',
    efficiency: [80, 90], // % range (including heat utilization)
    operatingTemp: [700, 850], // °C
    operatingPressure: [1, 25], // bar
    currentDensity: [0.5, 1.5], // A/cm²
    responseTime: 'slow', // hours
    partLoadCapability: 'limited',
    advantages: ['Highest efficiency', 'Can use waste heat', 'No precious metals'],
    disadvantages: ['High temperature challenges', 'Long startup time', 'Less mature'],
    maturityLevel: 'Developing',
    typicalCapacity: [0.1, 1], // MW range
  },
} as const

/**
 * Storage Technologies
 * Reference: DOI: 10.1016/j.est.2021.102591
 */
export const STORAGE_TYPES = {
  compressed: {
    name: 'Compressed Gas Storage',
    typicalPressure: [200, 700], // bar
    energyDensity: [0.5, 1.3], // kWh/L
    gravimetricDensity: [4, 6], // wt%
    compressionEnergy: [2.21, 3.36], // kWh/kg (for 200-870 bar)
    advantages: ['Simple technology', 'Fast filling/extraction', 'Established'],
    disadvantages: ['Low volumetric density', 'High pressure safety concerns'],
    applications: ['Vehicles', 'Short-term storage', 'Tube trailers'],
    cost: 'Low',
  },
  liquid: {
    name: 'Liquid Hydrogen',
    temperature: -253, // °C
    pressure: 1, // bar (cryogenic)
    energyDensity: [2.4], // kWh/L
    gravimetricDensity: [100], // wt% (pure hydrogen)
    liquefactionEnergy: [10, 12], // kWh/kg
    boilOffRate: [0.3, 1.0], // % per day
    advantages: ['High density', 'Established for space', 'Long distance transport'],
    disadvantages: ['High energy for liquefaction', 'Boil-off losses', 'Cryogenic complexity'],
    applications: ['Long distance transport', 'Aerospace', 'Large scale storage'],
    cost: 'High',
  },
  metal_hydride: {
    name: 'Metal Hydride Storage',
    operatingTemp: [-40, 120], // °C
    pressure: [1, 30], // bar
    gravimetricDensity: [1, 7], // wt%
    volumetricDensity: [90, 150], // kg H2/m³
    advantages: ['Safe (low pressure)', 'Reversible', 'High volumetric density'],
    disadvantages: ['Heavy', 'Slow kinetics', 'Heat management required'],
    applications: ['Stationary storage', 'Small vehicles', 'Portable power'],
    cost: 'Medium',
  },
  underground: {
    name: 'Underground Storage (Salt Caverns)',
    depth: [500, 2000], // meters
    pressure: [50, 200], // bar
    capacity: [100000, 1000000], // kg (very large scale)
    advantages: ['Very large capacity', 'Low cost per kg', 'Geological containment'],
    disadvantages: ['Location dependent', 'Large capital cost', 'Geological risks'],
    applications: ['Seasonal storage', 'Grid balancing', 'Strategic reserves'],
    cost: 'Very Low (per kg)',
  },
} as const

/**
 * Renewable Energy Capacity Factors
 * Reference: DOI: 10.1016/j.ijhydene.2020.08.253
 */
export const RENEWABLE_CAPACITY_FACTORS = {
  solar: {
    typical: 0.25,
    range: [0.15, 0.35],
    location: 'Varies by latitude and climate',
    bestCase: 0.35, // Desert regions
    worstCase: 0.15, // Northern latitudes
  },
  wind: {
    typical: 0.35,
    range: [0.25, 0.50],
    location: 'Varies by wind resource',
    bestCase: 0.50, // Offshore, high wind areas
    worstCase: 0.25, // Low wind areas
  },
  hydro: {
    typical: 0.60,
    range: [0.40, 0.90],
    location: 'Varies by water availability',
    bestCase: 0.90, // Run-of-river with consistent flow
    worstCase: 0.40, // Seasonal variations
  },
} as const

/**
 * Carbon Emissions Comparison
 * Reference: DOI: 10.1016/j.rser.2015.07.082
 */
export const CARBON_EMISSIONS = {
  grayHydrogen: {
    source: 'Natural gas steam reforming',
    kgCO2PerKgH2: 10.5,
    range: [9, 12],
    share: 95, // % of current production
  },
  blueHydrogen: {
    source: 'Gray hydrogen + CCS',
    kgCO2PerKgH2: 3.5,
    range: [2, 5],
    captureRate: 85, // % CO2 captured
  },
  greenHydrogen: {
    source: 'Renewable electricity + electrolysis',
    kgCO2PerKgH2: 0.1,
    range: [0, 0.5], // Only from equipment manufacturing
    share: 0.1, // % of current production (growing)
  },
  fossilFuels: {
    coal: 101, // kg CO2 per GJ
    naturalGas: 56, // kg CO2 per GJ
    oil: 74, // kg CO2 per GJ
  },
} as const

/**
 * Transportation Methods
 * Reference: DOI: 10.1016/j.ijhydene.2019.07.169
 */
export const TRANSPORTATION_METHODS = {
  tube_trailer: {
    name: 'Compressed Gas Tube Trailer',
    pressure: [200, 500], // bar
    capacity: [200, 500], // kg per trailer
    distance: [0, 500], // km (economical range)
    costPerKgKm: 0.15, // USD
    advantages: ['Flexible', 'No special infrastructure'],
    disadvantages: ['Limited capacity', 'Heavy cylinders'],
  },
  tanker: {
    name: 'Liquid Hydrogen Tanker',
    temperature: -253, // °C
    capacity: [3000, 4500], // kg per tanker
    distance: [500, 5000], // km
    costPerKgKm: 0.25, // USD
    boilOffRate: 0.3, // % per day
    advantages: ['High capacity', 'Long distance'],
    disadvantages: ['Boil-off losses', 'Cryogenic equipment'],
  },
  pipeline: {
    name: 'Hydrogen Pipeline',
    pressure: [10, 100], // bar
    diameter: [100, 600], // mm
    capacity: 'Continuous', // kg per hour (variable)
    distance: [0, 1000], // km (can be longer)
    costPerKgKm: 0.05, // USD (amortized)
    advantages: ['Continuous', 'Low operating cost', 'Large scale'],
    disadvantages: ['High capital cost', 'Fixed route', 'Material embrittlement'],
  },
} as const

/**
 * Economic Parameters
 */
export const ECONOMIC_PARAMETERS = {
  capex: {
    PEM: [800, 1400], // USD/kW
    Alkaline: [500, 900], // USD/kW
    SOEC: [1000, 2000], // USD/kW
    compressedStorage: [500, 1000], // USD/kg capacity
    liquidStorage: [1500, 2500], // USD/kg capacity
  },
  opex: {
    fixedPercentCapex: [2, 4], // % of CAPEX per year
    electricityCost: [0.02, 0.10], // USD/kWh (renewable)
    waterCost: [0.001, 0.005], // USD/liter
    maintenancePercentCapex: [1.5, 3], // % of CAPEX per year
  },
  plantLifetime: [20, 30], // years
  discountRate: [0.05, 0.10], // 5-10%
  targetLCOH: [2, 4], // USD/kg (competitive range)
} as const

/**
 * Application Areas
 */
export const APPLICATION_AREAS = {
  transportation: {
    vehicles: ['Cars', 'Buses', 'Trucks', 'Trains'],
    aviation: ['Short-haul aircraft', 'Drones'],
    maritime: ['Ships', 'Ferries', 'Cargo vessels'],
    potentialDemand: 'High',
  },
  industry: {
    chemicals: ['Ammonia production', 'Methanol synthesis', 'Hydrogenation'],
    refining: ['Petroleum refining', 'Hydrocracking'],
    steelmaking: ['Direct reduction of iron', 'Zero-carbon steel'],
    electronics: ['Semiconductor manufacturing'],
    potentialDemand: 'Very High',
  },
  power: {
    gridStorage: ['Seasonal storage', 'Peak shaving', 'Grid balancing'],
    fuelCells: ['Stationary power', 'Backup power', 'Microgrids'],
    powerToGas: ['Grid integration', 'Gas grid injection'],
    potentialDemand: 'Medium',
  },
  buildings: {
    heating: ['District heating', 'Industrial heating'],
    CHP: ['Combined heat and power', 'Fuel cells'],
    potentialDemand: 'Low to Medium',
  },
} as const

/**
 * Research Paper Categories
 */
export const RESEARCH_CATEGORIES = {
  production: 'Hydrogen Production Technologies',
  storage: 'Storage Technologies and Methods',
  transportation: 'Transportation and Distribution',
  efficiency: 'Efficiency and Optimization',
  economics: 'Economic Analysis and LCOH',
  policy: 'Policy and Regulations',
  safety: 'Safety and Risk Assessment',
  applications: 'End-Use Applications',
} as const

/**
 * Status Values
 */
export const STATUS_VALUES = {
  renewable_sources: ['active', 'maintenance', 'inactive'] as const,
  facilities: ['operational', 'maintenance', 'commissioning', 'decommissioned'] as const,
  vehicles: ['available', 'in_transit', 'maintenance', 'offline'] as const,
  routes: ['scheduled', 'in_transit', 'completed', 'cancelled', 'delayed'] as const,
} as const

/**
 * Color Schemes for UI
 */
export const COLOR_SCHEMES = {
  hydrogen: {
    primary: ['#3B82F6', '#2563EB', '#1D4ED8'], // Blue shades
    secondary: ['#06B6D4', '#0891B2', '#0E7490'], // Cyan shades
    accent: ['#10B981', '#059669', '#047857'], // Green shades (renewable)
  },
  energy: {
    solar: '#F59E0B', // Amber/yellow
    wind: '#6366F1', // Indigo
    hydro: '#3B82F6', // Blue
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const

/**
 * Unit Conversions
 */
export const UNIT_CONVERSIONS = {
  energy: {
    kWhToMJ: 3.6,
    MJTokWh: 0.2778,
    kWhToGJ: 0.0036,
    GJTokWh: 277.78,
  },
  mass: {
    kgToTon: 0.001,
    tonToKg: 1000,
    kgToLb: 2.20462,
    lbToKg: 0.453592,
  },
  volume: {
    literToM3: 0.001,
    m3ToLiter: 1000,
    literToGallon: 0.264172,
    gallonToLiter: 3.78541,
  },
  pressure: {
    barToPsi: 14.5038,
    psiToBar: 0.0689476,
    barToMPa: 0.1,
    MPaToBar: 10,
  },
} as const