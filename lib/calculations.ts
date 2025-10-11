// Hydrogen Production Calculations based on research papers

/**
 * Calculate hydrogen production from electrolysis
 * Based on: DOI: 10.1016/j.ijhydene.2020.08.253
 * Formula: H2 (kg) = (Energy (kWh) * Efficiency) / 39.4 kWh/kg
 */
export function calculateHydrogenProduction(
    energyInput: number, // kWh
    electrolyzerEfficiency: number // percentage (e.g., 70 for 70%)
): number {
    const ENERGY_PER_KG_H2 = 39.4 // kWh per kg of H2 (Lower Heating Value)
    const efficiency = electrolyzerEfficiency / 100
    return (energyInput * efficiency) / ENERGY_PER_KG_H2
}

/**
 * Calculate water consumption for hydrogen production
 * Based on: 9 liters of water per kg of H2 (theoretical)
 * Practical: ~10-12 liters including system losses
 */
export function calculateWaterConsumption(hydrogenKg: number): number {
    const WATER_PER_KG_H2 = 10.5 // liters per kg of H2
    return hydrogenKg * WATER_PER_KG_H2
}

/**
 * Calculate carbon offset from green hydrogen
 * Based on: Replacing gray hydrogen (9-12 kg CO2/kg H2)
 * Using average: 10.5 kg CO2 per kg H2
 * Reference: DOI: 10.1016/j.rser.2015.07.082
 */
export function calculateCarbonOffset(hydrogenKg: number): number {
    const CO2_PER_KG_H2_GRAY = 10.5 // kg CO2 per kg of gray H2
    return hydrogenKg * CO2_PER_KG_H2_GRAY
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
    const theoreticalH2 = calculateHydrogenProduction(energyUsedKWh, electrolyzerEfficiency)
    if (theoreticalH2 === 0) return 0
    return (actualH2Kg / theoreticalH2) * 100
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

/**
 * Calculate storage pressure energy requirement
 * Based on: DOI: 10.1016/j.est.2021.102591
 * Compression energy for different pressures
 */
export function calculateCompressionEnergy(
    hydrogenKg: number,
    targetPressureBar: number
): number {
    // Approximate energy for compression (kWh/kg)
    // Based on isothermal compression from 1 bar
    const COMPRESSION_ENERGY_MAP: Record<number, number> = {
        200: 2.21,  // 200 bar
        350: 2.94,  // 350 bar (common for tube trailers)
        700: 3.24,  // 700 bar (high pressure storage)
        870: 3.36   // 870 bar (advanced storage)
    }

    const energyPerKg = COMPRESSION_ENERGY_MAP[targetPressureBar] ||
        (targetPressureBar / 700) * 3.24 // Linear approximation for other pressures

    return hydrogenKg * energyPerKg
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

/**
 * Calculate transportation cost estimate
 * Based on: DOI: 10.1016/j.ijhydene.2019.07.169
 * Simplified model: cost per kg per km
 */
export function calculateTransportationCost(
    hydrogenKg: number,
    distanceKm: number,
    transportType: 'tube_trailer' | 'tanker' | 'pipeline'
): number {
    // Cost in USD per kg per km
    const COST_MAP: Record<string, number> = {
        tube_trailer: 0.15,  // Compressed gas in tubes
        tanker: 0.25,        // Liquid hydrogen tanker
        pipeline: 0.05       // Pipeline (amortized)
    }

    const costPerKgKm = COST_MAP[transportType] || 0.15
    return hydrogenKg * distanceKm * costPerKgKm
}

/**
 * Calculate levelized cost of hydrogen (LCOH)
 * Simplified formula based on CAPEX, OPEX, and production
 */
export function calculateLCOH(
    capexUSD: number,           // Capital expenditure
    annualOpexUSD: number,      // Annual operating expenditure
    annualProductionKg: number, // Annual H2 production
    lifetimeYears: number,      // Plant lifetime
    discountRate: number        // Discount rate (e.g., 0.08 for 8%)
): number {
    // Simplified LCOH calculation
    const annualizedCapex = capexUSD * (discountRate / (1 - Math.pow(1 + discountRate, -lifetimeYears)))
    const totalAnnualCost = annualizedCapex + annualOpexUSD
    return totalAnnualCost / annualProductionKg
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

    return calculateHydrogenProduction(totalDailyEnergy, electrolyzerEfficiency)
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