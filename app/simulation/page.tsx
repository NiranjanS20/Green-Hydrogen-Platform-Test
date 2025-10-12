'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Slider } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Input } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Progress } from '@heroui/react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { Play, Pause, RotateCcw, Zap, Droplets, Leaf, Factory, Database, TrendingUp, AlertTriangle, CheckCircle2, Settings } from 'lucide-react';
import { calculateWaterConsumption, calculateCarbonOffset } from '@/lib/calculations';
import { formatNumber } from '@/lib/utils';

export default function SimulationPage() {
  // Simulation parameters
  const [energyInput, setEnergyInput] = useState(25000); // kWh/day
  const [efficiency, setEfficiency] = useState(72); // %
  const [storageType, setStorageType] = useState('compressed');
  const [electrolyzerType, setElectrolyzerType] = useState('pem');
  const [weatherCondition, setWeatherCondition] = useState('optimal');
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [currentDay, setCurrentDay] = useState(0);
  const [simulationData, setSimulationData] = useState([]);
  const [totalStats, setTotalStats] = useState({
    totalHydrogen: 0,
    totalEnergy: 0,
    totalWater: 0,
    totalCarbonOffset: 0
  });

  // Weather impact factors
  const weatherFactors = {
    optimal: { solar: 1.0, wind: 1.0, efficiency: 1.0 },
    cloudy: { solar: 0.6, wind: 0.8, efficiency: 0.95 },
    stormy: { solar: 0.3, wind: 1.2, efficiency: 0.9 },
    sunny: { solar: 1.2, wind: 0.7, efficiency: 1.05 }
  };

  // Electrolyzer specifications
  const electrolyzerSpecs = {
    pem: { baseEfficiency: 75, cost: 1200, maintenance: 0.02 },
    alkaline: { baseEfficiency: 65, cost: 800, maintenance: 0.015 },
    soec: { baseEfficiency: 85, cost: 2000, maintenance: 0.025 }
  };

  // Calculate current production metrics
  const currentWeather = weatherFactors[weatherCondition];
  const currentElectrolyzer = electrolyzerSpecs[electrolyzerType];
  const adjustedEfficiency = (efficiency * currentWeather.efficiency * currentElectrolyzer.baseEfficiency) / 100;
  const adjustedEnergyInput = energyInput * currentWeather.solar * currentWeather.wind;
  
  const hydrogenProduced = (adjustedEnergyInput * adjustedEfficiency) / (100 * 39.4); // kg/day
  const waterUsed = calculateWaterConsumption(hydrogenProduced);
  const carbonOffset = calculateCarbonOffset(hydrogenProduced);

  // Simulation runner
  useEffect(() => {
    let interval;
    if (isRunning && currentDay < 30) {
      interval = setInterval(() => {
        const day = currentDay + 1;
        
        // Random weather variations
        const weatherVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const maintenanceIssue = Math.random() < 0.05; // 5% chance of maintenance
        
        const dailyEnergyInput = adjustedEnergyInput * weatherVariation;
        const dailyEfficiency = maintenanceIssue ? adjustedEfficiency * 0.7 : adjustedEfficiency;
        const dailyHydrogen = (dailyEnergyInput * dailyEfficiency) / (100 * 39.4);
        const dailyWater = calculateWaterConsumption(dailyHydrogen);
        const dailyCarbon = calculateCarbonOffset(dailyHydrogen);
        
        const newDataPoint = {
          day: `Day ${day}`,
          hydrogen: dailyHydrogen,
          energy: dailyEnergyInput,
          water: dailyWater,
          carbonOffset: dailyCarbon,
          efficiency: dailyEfficiency,
          status: maintenanceIssue ? 'maintenance' : 'operational',
          weather: weatherCondition
        };
        
        setSimulationData(prev => [...prev, newDataPoint]);
        setCurrentDay(day);
        
        setTotalStats(prev => ({
          totalHydrogen: prev.totalHydrogen + dailyHydrogen,
          totalEnergy: prev.totalEnergy + dailyEnergyInput,
          totalWater: prev.totalWater + dailyWater,
          totalCarbonOffset: prev.totalCarbonOffset + dailyCarbon
        }));
        
        if (day >= 30) {
          setIsRunning(false);
        }
      }, 1000 / simulationSpeed);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, currentDay, simulationSpeed, adjustedEnergyInput, adjustedEfficiency, weatherCondition]);

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentDay(0);
    setSimulationData([]);
    setTotalStats({ totalHydrogen: 0, totalEnergy: 0, totalWater: 0, totalCarbonOffset: 0 });
  };

  const costAnalysis = {
    dailyOperatingCost: (adjustedEnergyInput * 0.12) + (currentElectrolyzer.maintenance * 1000), // $0.12/kWh + maintenance
    hydrogenValue: hydrogenProduced * 6, // $6/kg H2
    dailyProfit: (hydrogenProduced * 6) - ((adjustedEnergyInput * 0.12) + (currentElectrolyzer.maintenance * 1000))
  };

  const efficiencyBreakdown = [
    { name: 'Electrolyzer', value: currentElectrolyzer.baseEfficiency, color: '#3B82F6' },
    { name: 'Weather Impact', value: currentWeather.efficiency * 100, color: '#10B981' },
    { name: 'System Loss', value: 15, color: '#F59E0B' },
    { name: 'Storage Loss', value: 8, color: '#EF4444' }
  ];

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-blue-50 to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🧪 Hydrogen Production Simulator
          </h1>
          <p className="text-gray-600 mt-2">Real-time simulation with dynamic weather and market conditions</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setIsRunning(!isRunning)} 
            color={isRunning ? 'danger' : 'success'}
            size="lg"
            startContent={isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          >
            {isRunning ? 'Pause' : 'Start'} Simulation
          </Button>
          <Button 
            onClick={resetSimulation} 
            variant="bordered"
            size="lg"
            startContent={<RotateCcw className="w-5 h-5" />}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Simulation Status */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" />
              Simulation Status
            </h3>
            <div className="flex items-center gap-4">
              <Chip color={isRunning ? 'success' : 'default'} variant="flat">
                {isRunning ? 'Running' : 'Stopped'}
              </Chip>
              <span className="text-sm text-gray-600">Day {currentDay}/30</span>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Progress 
            value={(currentDay / 30) * 100} 
            className="mb-4"
            color="success"
            size="lg"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{formatNumber(totalStats.totalHydrogen, 1)} kg</p>
              <p className="text-sm text-gray-600">Total H₂ Produced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatNumber(totalStats.totalCarbonOffset, 0)} kg</p>
              <p className="text-sm text-gray-600">CO₂ Offset</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{formatNumber(totalStats.totalEnergy, 0)} kWh</p>
              <p className="text-sm text-gray-600">Energy Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-cyan-600">{formatNumber(totalStats.totalWater, 0)} L</p>
              <p className="text-sm text-gray-600">Water Used</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Control Panel */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/40">
        <CardHeader>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600" />
            Simulation Parameters
          </h3>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Energy Input (kWh/day)</label>
              <Input 
                type="number" 
                value={energyInput} 
                onChange={(e) => setEnergyInput(Number(e.target.value))}
                startContent={<Zap className="w-4 h-4 text-yellow-600" />}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">System Efficiency: {efficiency}%</label>
              <Slider 
                value={efficiency}
                onChange={setEfficiency}
                minValue={50}
                maxValue={95}
                step={1}
                className="mt-2"
                color="primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Electrolyzer Type</label>
              <Select 
                value={electrolyzerType}
                onChange={(e) => setElectrolyzerType(e.target.value)}
                placeholder="Select electrolyzer"
              >
                <SelectItem key="pem" value="pem">PEM (75% eff, $1200/kW)</SelectItem>
                <SelectItem key="alkaline" value="alkaline">Alkaline (65% eff, $800/kW)</SelectItem>
                <SelectItem key="soec" value="soec">SOEC (85% eff, $2000/kW)</SelectItem>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Weather Condition</label>
              <Select 
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                placeholder="Select weather"
              >
                <SelectItem key="optimal" value="optimal">☀️ Optimal</SelectItem>
                <SelectItem key="sunny" value="sunny">🌞 Very Sunny</SelectItem>
                <SelectItem key="cloudy" value="cloudy">☁️ Cloudy</SelectItem>
                <SelectItem key="stormy" value="stormy">⛈️ Stormy</SelectItem>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Storage Type</label>
              <Select 
                value={storageType}
                onChange={(e) => setStorageType(e.target.value)}
                placeholder="Select storage"
              >
                <SelectItem key="compressed" value="compressed">🗜️ Compressed Gas</SelectItem>
                <SelectItem key="liquid" value="liquid">❄️ Liquid H₂</SelectItem>
                <SelectItem key="metal_hydride" value="metal_hydride">🔗 Metal Hydride</SelectItem>
                <SelectItem key="underground" value="underground">🕳️ Underground</SelectItem>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Simulation Speed: {simulationSpeed}x</label>
              <Slider 
                value={simulationSpeed}
                onChange={setSimulationSpeed}
                minValue={0.5}
                maxValue={5}
                step={0.5}
                className="mt-2"
                color="secondary"
              />
            </div>
          </div>

        </CardBody>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardBody className="text-center">
            <Factory className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold opacity-90">H₂ Production</h3>
            <p className="text-3xl font-bold">{formatNumber(hydrogenProduced, 1)} kg/day</p>
            <p className="text-sm opacity-75">Current Rate</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
          <CardBody className="text-center">
            <Droplets className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold opacity-90">Water Usage</h3>
            <p className="text-3xl font-bold">{formatNumber(waterUsed, 0)} L/day</p>
            <p className="text-sm opacity-75">Consumption</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardBody className="text-center">
            <Leaf className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold opacity-90">CO₂ Offset</h3>
            <p className="text-3xl font-bold">{formatNumber(carbonOffset, 0)} kg/day</p>
            <p className="text-sm opacity-75">Environmental Impact</p>
          </CardBody>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardBody className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <h3 className="font-semibold opacity-90">Daily Profit</h3>
            <p className="text-3xl font-bold">${formatNumber(costAnalysis.dailyProfit, 0)}</p>
            <p className="text-sm opacity-75">Revenue - Costs</p>
          </CardBody>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trends */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/40">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Production Trends
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb' 
                  }} 
                />
                <Line type="monotone" dataKey="hydrogen" stroke="#3B82F6" strokeWidth={3} name="H₂ (kg)" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={2} name="Efficiency (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
        
        {/* Efficiency Breakdown */}
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/40">
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Efficiency Breakdown
            </h3>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={efficiencyBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {efficiencyBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Cost Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/40">
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Economic Analysis
          </h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
              <h4 className="font-semibold text-red-800">Operating Costs</h4>
              <p className="text-2xl font-bold text-red-600">${formatNumber(costAnalysis.dailyOperatingCost, 0)}/day</p>
              <p className="text-sm text-red-600">Energy + Maintenance</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <h4 className="font-semibold text-blue-800">H₂ Revenue</h4>
              <p className="text-2xl font-bold text-blue-600">${formatNumber(costAnalysis.hydrogenValue, 0)}/day</p>
              <p className="text-sm text-blue-600">@ $6/kg H₂</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <h4 className="font-semibold text-green-800">Net Profit</h4>
              <p className={`text-2xl font-bold ${costAnalysis.dailyProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${formatNumber(costAnalysis.dailyProfit, 0)}/day
              </p>
              <p className="text-sm text-green-600">Revenue - Costs</p>
            </div>
          </div>
        </CardBody>
      </Card>

    </div>
  );
}
