// Hydrogen Production Calculations based on research papers

// Physical constants
export const PHYSICAL_CONSTANTS = {
  HYDROGEN_HHV_KWH_PER_KG: 39.4, // Higher Heating Value
  HYDROGEN_LHV_KWH_PER_KG: 33.3, // Lower Heating Value
  WATER_CONSUMPTION_L_PER_KG_H2: 9, // Theoretical water consumption
  GRAY_HYDROGEN_CO2_KG_PER_KG_H2: 9.3, // CO2 emissions from gray hydrogen
  BLUE_HYDROGEN_CO2_KG_PER_KG_H2: 2.0, // CO2 emissions from blue hydrogen (with CCS)
};

interface HydrogenProductionParams {
  energyInput: number; // kWh
  efficiency: number; // percentage (e.g., 70 for 70%)
  electrolyzerType?: 'PEM' | 'Alkaline' | 'SOEC';
  temperature?: number; // Celsius
  pressure?: number; // bar
}

interface HydrogenProductionResult {
  hydrogenProduced: number; // kg
  energyEfficiency: number; // %
  waterRequired: number; // liters
  carbonOffset: number; // kg CO2
}

/**
 * Calculate hydrogen production from electrolysis
 * Based on: DOI: 10.1016/j.ijhydene.2020.08.253
 */
export function calculateHydrogenProduction(params: HydrogenProductionParams): HydrogenProductionResult {
  if (params.energyInput < 0) {
    throw new Error('Energy input must be positive');
  }
  if (params.efficiency < 0 || params.efficiency > 100) {
    throw new Error('Efficiency must be between 0 and 100');
  }

  let energyPerKg = PHYSICAL_CONSTANTS.HYDROGEN_LHV_KWH_PER_KG;
  
  // Adjust for electrolyzer type
  switch (params.electrolyzerType) {
    case 'Alkaline':
      energyPerKg = 48; // kWh/kg
      break;
    case 'SOEC':
      energyPerKg = 45; // kWh/kg (more efficient at high temp)
      break;
    case 'PEM':
    default:
      energyPerKg = 50; // kWh/kg
      break;
  }

  // Temperature effect
  let tempFactor = 1.0;
  if (params.temperature) {
    if (params.temperature > 25) {
      tempFactor = 1 + (params.temperature - 25) * 0.001; // Slight improvement with temperature
    }
  }

  const efficiency = (params.efficiency / 100) * tempFactor;
  const hydrogenProduced = (params.energyInput * efficiency) / energyPerKg;
  
  return {
    hydrogenProduced,
    energyEfficiency: params.efficiency,
    waterRequired: hydrogenProduced * PHYSICAL_CONSTANTS.WATER_CONSUMPTION_L_PER_KG_H2,
    carbonOffset: hydrogenProduced * PHYSICAL_CONSTANTS.GRAY_HYDROGEN_CO2_KG_PER_KG_H2,
  };
}

interface WaterConsumptionResult {
  theoretical: number;
  practical: number;
}

/**
 * Calculate water consumption for hydrogen production
 * Based on: 9 liters of water per kg of H2 (theoretical)
 * Practical: ~10-12 liters including system losses
 */
export function calculateWaterConsumption(hydrogenKg: number): WaterConsumptionResult {
    const theoretical = hydrogenKg * PHYSICAL_CONSTANTS.WATER_CONSUMPTION_L_PER_KG_H2;
    const practical = theoretical * 1.1; // 10% overhead
    return { theoretical, practical };
}

interface CarbonOffsetResult {
  totalOffset: number;
  offsetPerKg: number;
}

/**
 * Calculate carbon offset from green hydrogen
 * Based on: Replacing gray hydrogen (9-12 kg CO2/kg H2)
 * Reference: DOI: 10.1016/j.rser.2015.07.082
 */
export function calculateCarbonOffset(hydrogenKg: number, productionType: 'green' | 'blue' = 'green'): CarbonOffsetResult {
    const offsetPerKg = productionType === 'green' 
      ? PHYSICAL_CONSTANTS.GRAY_HYDROGEN_CO2_KG_PER_KG_H2
      : PHYSICAL_CONSTANTS.GRAY_HYDROGEN_CO2_KG_PER_KG_H2 - PHYSICAL_CONSTANTS.BLUE_HYDROGEN_CO2_KG_PER_KG_H2;
    
    return {
      totalOffset: hydrogenKg * offsetPerKg,
      offsetPerKg
    };
}

/**
 * Calculate production efficiency
 * Efficiency = (Actual H2 produced / Theoretical H2 possible) * 100
 */
export function calculateProductionEfficiency(
    actualH2Kg: number,
    energyUsedKWh: number,
    electrolyzerEfficiency: number
): number {
    const theoreticalResult = calculateHydrogenProduction({
      energyInput: energyUsedKWh,
      efficiency: electrolyzerEfficiency
    });
    if (theoreticalResult.hydrogenProduced === 0) return 0
    return (actualH2Kg / theoreticalResult.hydrogenProduced) * 100
}

/**
 * Calculate electrolyzer power requirement
 * Based on capacity and operating hours
 */
export function calculatePowerRequirement(
    capacityKgPerDay: number,
    operatingHours: number,
    electrolyzerEfficiency: number
): number {
    const ENERGY_PER_KG_H2 = 39.4
    const efficiency = electrolyzerEfficiency / 100
    const hourlyProduction = capacityKgPerDay / operatingHours
    return (hourlyProduction * ENERGY_PER_KG_H2) / efficiency
}

/**
 * Calculate renewable energy capacity needed
 * Based on: DOI: 10.1016/j.enconman.2019.112108
 */
export function calculateRenewableEnergyCapacity(
    targetH2KgPerDay: number,
    electrolyzerEfficiency: number,
    capacityFactor: number // 0.2-0.3 for solar, 0.3-0.5 for wind, 0.4-0.9 for hydro
): number {
    const ENERGY_PER_KG_H2 = 39.4
    const efficiency = electrolyzerEfficiency / 100
    const dailyEnergyNeed = (targetH2KgPerDay * ENERGY_PER_KG_H2) / efficiency
    const capacityMW = (dailyEnergyNeed / (24 * capacityFactor)) / 1000
    return capacityMW
}

interface CompressionEnergyResult {
  energyRequired: number;
  energyPerKg: number;
  compressionRatio: number;
}

/**
 * Calculate storage pressure energy requirement
 * Based on: DOI: 10.1016/j.est.2021.102591
 * Compression energy for different pressures
 */
export function calculateCompressionEnergy(
    hydrogenKg: number,
    fromPressureBar: number,
    toPressureBar: number
): CompressionEnergyResult {
    // Approximate energy for compression (kWh/kg)
    const COMPRESSION_ENERGY_MAP: Record<number, number> = {
        200: 2.21,  // 200 bar
        350: 2.94,  // 350 bar (common for tube trailers)
        700: 3.24,  // 700 bar (high pressure storage)
        870: 3.36   // 870 bar (advanced storage)
    }

    const energyPerKg = COMPRESSION_ENERGY_MAP[toPressureBar] ||
        (toPressureBar / 700) * 3.24; // Linear approximation

    return {
      energyRequired: hydrogenKg * energyPerKg,
      energyPerKg,
      compressionRatio: toPressureBar / fromPressureBar
    };
}

/**
 * Calculate liquefaction energy requirement
 * Based on: ~10-12 kWh/kg for hydrogen liquefaction
 */
export function calculateLiquefactionEnergy(hydrogenKg: number): number {
    const LIQUEFACTION_ENERGY = 11 // kWh/kg (average)
    return hydrogenKg * LIQUEFACTION_ENERGY
}

/**
 * Calculate storage capacity utilization
 */
export function calculateStorageUtilization(
    currentLevelKg: number,
    totalCapacityKg: number
): number {
    if (totalCapacityKg === 0) return 0
    return (currentLevelKg / totalCapacityKg) * 100
}

interface TransportationCostParams {
  hydrogenKg: number;
  distanceKm: number;
  transportType: 'tube_trailer' | 'tanker' | 'pipeline';
}

interface TransportationCostResult {
  totalCost: number;
  costPerKg: number;
  costPerKm: number;
}

/**
 * Calculate transportation cost estimate
 * Based on: DOI: 10.1016/j.ijhydene.2019.07.169
 */
export function calculateTransportationCost(params: TransportationCostParams): TransportationCostResult {
    const COST_MAP: Record<string, number> = {
        tube_trailer: 0.15,  // Compressed gas in tubes
        tanker: 0.25,        // Liquid hydrogen tanker
        pipeline: 0.05       // Pipeline (amortized)
    }

    const costPerKgKm = COST_MAP[params.transportType] || 0.15;
    const totalCost = params.hydrogenKg * params.distanceKm * costPerKgKm;
    
    return {
      totalCost,
      costPerKg: totalCost / params.hydrogenKg,
      costPerKm: totalCost / params.distanceKm
    };
}

interface LCOHParams {
  capexUSD: number;
  annualOpexUSD: number;
  annualProductionKg: number;
  lifetimeYears: number;
  discountRate: number;
}

interface LCOHResult {
  lcohhUSDPerKg: number;
  totalNPV: number;
}

/**
 * Calculate levelized cost of hydrogen (LCOH)
 * Simplified formula based on CAPEX, OPEX, and production
 */
export function calculateLCOH(params: LCOHParams): LCOHResult {
    const annualizedCapex = params.capexUSD * (params.discountRate / (1 - Math.pow(1 + params.discountRate, -params.lifetimeYears)));
    const totalAnnualCost = annualizedCapex + params.annualOpexUSD;
    const lcohhUSDPerKg = totalAnnualCost / params.annualProductionKg;
    const totalNPV = params.capexUSD + (params.annualOpexUSD * params.lifetimeYears);
    
    return { lcohhUSDPerKg, totalNPV };
}

/**
 * Calculate PEM electrolyzer performance
 * Based on temperature and pressure effects
 */
export function calculatePEMPerformance(
    baseEfficiency: number,
    temperatureCelsius: number,
    pressureBar: number
): number {
    // Temperature effect (optimal: 50-80°C)
    const tempFactor = temperatureCelsius >= 50 && temperatureCelsius <= 80
        ? 1.0
        : 1.0 - (Math.abs(65 - temperatureCelsius) * 0.002)

    // Pressure effect (higher pressure slightly reduces efficiency)
    const pressureFactor = 1.0 - (pressureBar / 100) * 0.01

    return baseEfficiency * tempFactor * pressureFactor
}

/**
 * Calculate Alkaline electrolyzer performance
 * Based on current density and temperature
 */
export function calculateAlkalinePerformance(
    baseEfficiency: number,
    currentDensityAcm2: number,
    temperatureCelsius: number
): number {
    // Optimal current density: 200-400 A/cm²
    const currentFactor = currentDensityAcm2 >= 200 && currentDensityAcm2 <= 400
        ? 1.0
        : 1.0 - (Math.abs(300 - currentDensityAcm2) * 0.0005)

    // Temperature effect (optimal: 70-90°C)
    const tempFactor = temperatureCelsius >= 70 && temperatureCelsius <= 90
        ? 1.0
        : 1.0 - (Math.abs(80 - temperatureCelsius) * 0.003)

    return baseEfficiency * currentFactor * tempFactor
}

/**
 * Calculate SOEC (Solid Oxide Electrolyzer) performance
 * High temperature operation (700-850°C)
 */
export function calculateSOECPerformance(
    baseEfficiency: number,
    temperatureCelsius: number
): number {
    // Optimal temperature: 750-850°C
    const tempFactor = temperatureCelsius >= 750 && temperatureCelsius <= 850
        ? 1.0
        : 1.0 - (Math.abs(800 - temperatureCelsius) * 0.005)

    return baseEfficiency * tempFactor
}

/**
 * Calculate energy return on investment (EROI) for hydrogen
 */
export function calculateEROI(
    energyProducedMJ: number,
    energyInvestedMJ: number
): number {
    if (energyInvestedMJ === 0) return 0
    return energyProducedMJ / energyInvestedMJ
}

/**
 * Calculate capacity factor for renewable sources
 * Based on actual vs theoretical maximum production
 */
export function calculateCapacityFactor(
    actualEnergyProducedKWh: number,
    installedCapacityKW: number,
    hoursInPeriod: number
): number {
    const theoreticalMaxKWh = installedCapacityKW * hoursInPeriod
    if (theoreticalMaxKWh === 0) return 0
    return (actualEnergyProducedKWh / theoreticalMaxKWh) * 100
}

/**
 * Estimate daily production based on renewable energy availability
 */
export function estimateDailyProduction(
    solarCapacityMW: number,
    windCapacityMW: number,
    hydroCapacityMW: number,
    solarCapacityFactor: number = 0.25,
    windCapacityFactor: number = 0.35,
    hydroCapacityFactor: number = 0.6,
    electrolyzerEfficiency: number = 70
): number {
    const dailySolarEnergy = solarCapacityMW * 1000 * 24 * solarCapacityFactor
    const dailyWindEnergy = windCapacityMW * 1000 * 24 * windCapacityFactor
    const dailyHydroEnergy = hydroCapacityMW * 1000 * 24 * hydroCapacityFactor

    const totalDailyEnergy = dailySolarEnergy + dailyWindEnergy + dailyHydroEnergy

    return calculateHydrogenProduction({
        energyInput: totalDailyEnergy,
        efficiency: electrolyzerEfficiency
    }).hydrogenProduced
}

/**
 * Calculate round-trip efficiency for hydrogen as energy storage
 * Includes production, storage, and conversion back to electricity
 */
export function calculateRoundTripEfficiency(
    productionEfficiency: number,    // Electrolyzer efficiency
    storageEfficiency: number,       // Storage losses (compression/liquefaction)
    conversionEfficiency: number     // Fuel cell efficiency
): number {
    return (productionEfficiency / 100) * (storageEfficiency / 100) * (conversionEfficiency / 100) * 100
}