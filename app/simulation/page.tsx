'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { FlaskConical, Play, RotateCcw, Save, Download, TrendingUp, Zap, Droplets, Factory, Leaf, DollarSign } from 'lucide-react';
import { calculateHydrogenProduction, calculateWaterConsumption, calculateCarbonOffset, estimateDailyProduction, calculateLCOH } from '@/lib/calculations';
import { ELECTROLYZER_TYPES, RENEWABLE_CAPACITY_FACTORS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export default function SimulationPage() {
  const [simulationParams, setSimulationParams] = useState({
    name: 'New Simulation',
    solarCapacity: 50,
    windCapacity: 75,
    hydroCapacity: 100,
    electrolyzerType: 'PEM' as 'PEM' | 'Alkaline' | 'SOEC',
    electrolyzerEfficiency: 70,
    productionTarget: 500,
    operatingHours: 24,
    capexUSD: 1000000,
    annualOpexUSD: 50000,
    plantLifetime: 20,
    discountRate: 0.08
  });

  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Calculate results
    const dailyProduction = estimateDailyProduction(
      simulationParams.solarCapacity,
      simulationParams.windCapacity,
      simulationParams.hydroCapacity,
      RENEWABLE_CAPACITY_FACTORS.solar.typical,
      RENEWABLE_CAPACITY_FACTORS.wind.typical,
      RENEWABLE_CAPACITY_FACTORS.hydro.typical,
      simulationParams.electrolyzerEfficiency
    );

    const annualProduction = dailyProduction * 365;
    const waterConsumption = calculateWaterConsumption(dailyProduction);
    const carbonOffset = calculateCarbonOffset(dailyProduction);
    const totalEnergy = (simulationParams.solarCapacity + simulationParams.windCapacity + simulationParams.hydroCapacity) * 24;
    const energyEfficiency = (dailyProduction * 33.3) / totalEnergy * 100;
    
    const lcoh = calculateLCOH(
      simulationParams.capexUSD,
      simulationParams.annualOpexUSD,
      annualProduction,
      simulationParams.plantLifetime,
      simulationParams.discountRate
    );

    const monthlyProduction = Array.from({ length: 12 }, (_, i) => ({
      month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
      production: dailyProduction * [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i],
      target: simulationParams.productionTarget * [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][i],
    }));

    const energyMix = [
      { source: 'Solar', contribution: (simulationParams.solarCapacity / (simulationParams.solarCapacity + simulationParams.windCapacity + simulationParams.hydroCapacity)) * 100, capacity: simulationParams.solarCapacity },
      { source: 'Wind', contribution: (simulationParams.windCapacity / (simulationParams.solarCapacity + simulationParams.windCapacity + simulationParams.hydroCapacity)) * 100, capacity: simulationParams.windCapacity },
      { source: 'Hydro', contribution: (simulationParams.hydroCapacity / (simulationParams.solarCapacity + simulationParams.windCapacity + simulationParams.hydroCapacity)) * 100, capacity: simulationParams.hydroCapacity }
    ];

    const performanceMetrics = [
      { metric: 'Efficiency', value: Math.min(simulationParams.electrolyzerEfficiency, 100) },
      { metric: 'Reliability', value: 92 },
      { metric: 'Capacity Factor', value: 78 },
      { metric: 'Sustainability', value: 95 },
      { metric: 'Economics', value: lcoh < 3 ? 85 : 65 },
    ];

    setSimulationResults({
      dailyProduction,
      annualProduction,
      waterConsumption,
      carbonOffset,
      totalEnergy,
      energyEfficiency,
      lcoh,
      monthlyProduction,
      energyMix,
      performanceMetrics,
      targetAchievement: (dailyProduction / simulationParams.productionTarget) * 100
    });

    setLoading(false);
  };

  const resetSimulation = () => {
    setSimulationParams({
      name: 'New Simulation',
      solarCapacity: 50,
      windCapacity: 75,
      hydroCapacity: 100,
      electrolyzerType: 'PEM',
      electrolyzerEfficiency: 70,
      productionTarget: 500,
      operatingHours: 24,
      capexUSD: 1000000,
      annualOpexUSD: 50000,
      plantLifetime: 20,
      discountRate: 0.08
    });
    setSimulationResults(null);
  };

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="glassmorphic-strong rounded-2xl p-6">
        <h1 className="text-4xl font-bold gradient-text mb-2">Process Simulation</h1>
        <p className="text-gray-700">Design and simulate hydrogen production scenarios with different configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Simulation Parameters */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glassmorphic-strong border-2 border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-blue-600" />
                Simulation Parameters
              </CardTitle>
              <CardDescription>Configure your production scenario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Simulation Name</label>
                <Input
                  placeholder="e.g., Optimal Mix Scenario"
                  value={simulationParams.name}
                  onChange={(e) => setSimulationParams({ ...simulationParams, name: e.target.value })}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Renewable Energy Sources</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Solar Capacity (MW)</label>
                    <Input
                      type="number"
                      value={simulationParams.solarCapacity}
                      onChange={(e) => setSimulationParams({ ...simulationParams, solarCapacity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Wind Capacity (MW)</label>
                    <Input
                      type="number"
                      value={simulationParams.windCapacity}
                      onChange={(e) => setSimulationParams({ ...simulationParams, windCapacity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Hydro Capacity (MW)</label>
                    <Input
                      type="number"
                      value={simulationParams.hydroCapacity}
                      onChange={(e) => setSimulationParams({ ...simulationParams, hydroCapacity: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Electrolyzer Configuration</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Electrolyzer Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={simulationParams.electrolyzerType}
                      onChange={(e) => {
                        const type = e.target.value as 'PEM' | 'Alkaline' | 'SOEC';
                        const avgEff = type === 'PEM' ? 65 : type === 'Alkaline' ? 57 : 85;
                        setSimulationParams({ 
                          ...simulationParams, 
                          electrolyzerType: type,
                          electrolyzerEfficiency: avgEff
                        });
                      }}
                    >
                      <option value="PEM">PEM (60-70%)</option>
                      <option value="Alkaline">Alkaline (50-65%)</option>
                      <option value="SOEC">SOEC (80-90%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Efficiency (%)</label>
                    <Input
                      type="number"
                      value={simulationParams.electrolyzerEfficiency}
                      onChange={(e) => setSimulationParams({ ...simulationParams, electrolyzerEfficiency: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Production Target</h4>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Daily Target (kg H₂)</label>
                  <Input
                    type="number"
                    value={simulationParams.productionTarget}
                    onChange={(e) => setSimulationParams({ ...simulationParams, productionTarget: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-semibold text-gray-800 mb-3">Economic Parameters</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">CAPEX (USD)</label>
                    <Input
                      type="number"
                      value={simulationParams.capexUSD}
                      onChange={(e) => setSimulationParams({ ...simulationParams, capexUSD: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Annual OPEX (USD)</label>
                    <Input
                      type="number"
                      value={simulationParams.annualOpexUSD}
                      onChange={(e) => setSimulationParams({ ...simulationParams, annualOpexUSD: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Plant Lifetime (years)</label>
                    <Input
                      type="number"
                      value={simulationParams.plantLifetime}
                      onChange={(e) => setSimulationParams({ ...simulationParams, plantLifetime: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={runSimulation} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2" />
                      Simulating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Simulation
                    </>
                  )}
                </Button>
                <Button onClick={resetSimulation} variant="outline">
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulation Results */}
        <div className="lg:col-span-2 space-y-6">
          {!simulationResults ? (
            <Card className="glassmorphic-strong border-2 border-white/40">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <FlaskConical className="w-20 h-20 text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">Ready to Simulate</h3>
                <p className="text-gray-600 text-center max-w-md">
                  Configure your parameters and click "Run Simulation" to see predicted performance, economics, and environmental impact
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Key Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glassmorphic-strong border-2 border-white/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Factory className="w-4 h-4 text-blue-600" />
                      Daily Production
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(simulationResults.dailyProduction, 0)} kg</div>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatNumber(simulationResults.targetAchievement, 1)}% of target
                    </p>
                  </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-cyan-600" />
                      Water Needed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-600">{formatNumber(simulationResults.waterConsumption, 0)} L/day</div>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatNumber(simulationResults.waterConsumption * 365 / 1000, 0)} m³/year
                    </p>
                  </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      Carbon Offset
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatNumber(simulationResults