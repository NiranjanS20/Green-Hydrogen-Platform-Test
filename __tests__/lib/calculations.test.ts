import { 
  calculateHydrogenProduction,
  calculateWaterConsumption,
  calculateCarbonOffset,
  calculateLCOH,
  calculateCompressionEnergy,
  calculateTransportationCost,
  PHYSICAL_CONSTANTS
} from '@/lib/calculations';

describe('Hydrogen Calculations', () => {
  describe('calculateHydrogenProduction', () => {
    it('calculates hydrogen production correctly for PEM electrolyzer', () => {
      const result = calculateHydrogenProduction({
        energyInput: 1000, // kWh
        efficiency: 70, // %
        electrolyzerType: 'PEM'
      });

      // Expected: 1000 kWh * 0.70 efficiency / 50 kWh/kg = 14 kg
      expect(result.hydrogenProduced).toBeCloseTo(14, 1);
      expect(result.energyEfficiency).toBe(70);
    });

    it('calculates hydrogen production correctly for Alkaline electrolyzer', () => {
      const result = calculateHydrogenProduction({
        energyInput: 1000,
        efficiency: 65,
        electrolyzerType: 'Alkaline'
      });

      // Alkaline has slightly different energy consumption
      expect(result.hydrogenProduced).toBeCloseTo(13.54, 1);
      expect(result.energyEfficiency).toBe(65);
    });

    it('calculates hydrogen production correctly for SOEC electrolyzer', () => {
      const result = calculateHydrogenProduction({
        energyInput: 1000,
        efficiency: 85,
        electrolyzerType: 'SOEC'
      });

      // SOEC is more efficient
      expect(result.hydrogenProduced).toBeCloseTo(18.89, 1);
      expect(result.energyEfficiency).toBe(85);
    });

    it('handles temperature and pressure effects', () => {
      const baseResult = calculateHydrogenProduction({
        energyInput: 1000,
        efficiency: 70,
        electrolyzerType: 'PEM'
      });

      const highTempResult = calculateHydrogenProduction({
        energyInput: 1000,
        efficiency: 70,
        electrolyzerType: 'PEM',
        temperature: 80 // Higher temperature should improve efficiency
      });

      expect(highTempResult.hydrogenProduced).toBeGreaterThan(baseResult.hydrogenProduced);
    });

    it('throws error for invalid inputs', () => {
      expect(() => {
        calculateHydrogenProduction({
          energyInput: -100,
          efficiency: 70
        });
      }).toThrow('Energy input must be positive');

      expect(() => {
        calculateHydrogenProduction({
          energyInput: 1000,
          efficiency: 150
        });
      }).toThrow('Efficiency must be between 0 and 100');
    });
  });

  describe('calculateWaterConsumption', () => {
    it('calculates water consumption correctly', () => {
      const waterConsumption = calculateWaterConsumption(10); // 10 kg H2

      // Theoretical: 10 kg H2 * 9 L/kg = 90 L
      // Practical with 10% overhead: 90 * 1.1 = 99 L
      expect(waterConsumption.theoretical).toBeCloseTo(90, 1);
      expect(waterConsumption.practical).toBeCloseTo(99, 1);
    });

    it('handles zero hydrogen production', () => {
      const waterConsumption = calculateWaterConsumption(0);
      
      expect(waterConsumption.theoretical).toBe(0);
      expect(waterConsumption.practical).toBe(0);
    });
  });

  describe('calculateCarbonOffset', () => {
    it('calculates carbon offset correctly', () => {
      const carbonOffset = calculateCarbonOffset(10, 'green'); // 10 kg H2, green production

      // 10 kg H2 * 9.3 kg CO2/kg H2 (gray hydrogen emissions) = 93 kg CO2 offset
      expect(carbonOffset.totalOffset).toBeCloseTo(93, 1);
      expect(carbonOffset.offsetPerKg).toBeCloseTo(9.3, 1);
    });

    it('calculates different offsets for different production types', () => {
      const greenOffset = calculateCarbonOffset(10, 'green');
      const blueOffset = calculateCarbonOffset(10, 'blue');

      expect(greenOffset.totalOffset).toBeGreaterThan(blueOffset.totalOffset);
    });
  });

  describe('calculateLCOH', () => {
    it('calculates LCOH correctly', () => {
      const lcoh = calculateLCOH({
        capexUSD: 1000000, // $1M
        annualOpexUSD: 100000, // $100k/year
        annualProductionKg: 10000, // 10,000 kg/year
        lifetimeYears: 20,
        discountRate: 0.08 // 8%
      });

      // Should return reasonable LCOH value
      expect(lcoh.lcohhUSDPerKg).toBeGreaterThan(0);
      expect(lcoh.lcohhUSDPerKg).toBeLessThan(20); // Should be reasonable
      expect(lcoh.totalNPV).toBeGreaterThan(0);
    });

    it('handles different discount rates', () => {
      const lowRate = calculateLCOH({
        capexUSD: 1000000,
        annualOpexUSD: 100000,
        annualProductionKg: 10000,
        lifetimeYears: 20,
        discountRate: 0.05
      });

      const highRate = calculateLCOH({
        capexUSD: 1000000,
        annualOpexUSD: 100000,
        annualProductionKg: 10000,
        lifetimeYears: 20,
        discountRate: 0.12
      });

      expect(lowRate.lcohhUSDPerKg).toBeLessThan(highRate.lcohhUSDPerKg);
    });
  });

  describe('calculateCompressionEnergy', () => {
    it('calculates compression energy correctly', () => {
      const compressionEnergy = calculateCompressionEnergy(100, 1, 350); // 100 kg, 1 bar to 350 bar

      expect(compressionEnergy.energyRequired).toBeGreaterThan(0);
      expect(compressionEnergy.energyPerKg).toBeGreaterThan(0);
      expect(compressionEnergy.compressionRatio).toBe(350);
    });

    it('handles different pressure levels', () => {
      const lowPressure = calculateCompressionEnergy(100, 1, 200);
      const highPressure = calculateCompressionEnergy(100, 1, 700);

      expect(highPressure.energyRequired).toBeGreaterThan(lowPressure.energyRequired);
    });
  });

  describe('calculateTransportationCost', () => {
    it('calculates tube trailer transportation cost', () => {
      const cost = calculateTransportationCost({
        hydrogenKg: 500,
        distanceKm: 100,
        transportType: 'tube_trailer'
      });

      expect(cost.totalCost).toBeGreaterThan(0);
      expect(cost.costPerKg).toBeGreaterThan(0);
      expect(cost.costPerKm).toBeGreaterThan(0);
    });

    it('calculates different costs for different transport types', () => {
      const tubeTrailerCost = calculateTransportationCost({
        hydrogenKg: 500,
        distanceKm: 100,
        transportType: 'tube_trailer'
      });

      const pipelineCost = calculateTransportationCost({
        hydrogenKg: 500,
        distanceKm: 100,
        transportType: 'pipeline'
      });

      // Pipeline should be more cost-effective for longer distances
      expect(pipelineCost.costPerKg).toBeLessThan(tubeTrailerCost.costPerKg);
    });
  });

  describe('Physical Constants', () => {
    it('has correct physical constants', () => {
      expect(PHYSICAL_CONSTANTS.HYDROGEN_HHV_KWH_PER_KG).toBeCloseTo(39.4, 1);
      expect(PHYSICAL_CONSTANTS.HYDROGEN_LHV_KWH_PER_KG).toBeCloseTo(33.3, 1);
      expect(PHYSICAL_CONSTANTS.WATER_CONSUMPTION_L_PER_KG_H2).toBe(9);
      expect(PHYSICAL_CONSTANTS.GRAY_HYDROGEN_CO2_KG_PER_KG_H2).toBeCloseTo(9.3, 1);
    });
  });
});
