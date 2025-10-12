'use client';

import { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { calculateWaterConsumption, calculateCarbonOffset } from '@/lib/calculations';
import { formatNumber } from '@/lib/utils';

export default function SimulationPage() {
  const [energyInput, setEnergyInput] = useState(20000); // kWh/day
  const [efficiency, setEfficiency] = useState(70); // %
  const [storageType, setStorageType] = useState('Compressed');

  const hydrogenProduced = (energyInput * efficiency) / (100 * 39.4); // kg/day
  const waterUsed = calculateWaterConsumption(hydrogenProduced);
  const carbonOffset = calculateCarbonOffset(hydrogenProduced);

  const simulationData = Array.from({ length: 7 }, (_, i) => {
    const day = `Day ${i + 1}`;
    // Simulate daily fluctuation in energy input (e.g., solar availability)
    const dailyEnergyFluctuation = Math.sin((i / 6) * Math.PI) * 0.2 + 0.9; // Varies between 0.9 and 1.1
    const dailyEnergyInput = energyInput * dailyEnergyFluctuation;
    const dailyHydrogenProduced = (dailyEnergyInput * efficiency) / (100 * 39.4);

    return {
      day,
      hydrogen: dailyHydrogenProduced,
      energy: dailyEnergyInput,
    };
  });

  return (
    <div className="p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Hydrogen Simulation</CardTitle>
          <CardDescription>Adjust parameters to simulate production</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium">Energy Input (kWh/day)</label>
              <Input type="number" value={energyInput} onChange={(e) => setEnergyInput(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-sm font-medium">Efficiency (%)</label>
              <Slider value={[efficiency]} min={50} max={90} step={1} onValueChange={(val) => setEfficiency(val[0])} />
              <p className="text-sm mt-2">{efficiency}%</p>
            </div>
            <div>
              <label className="text-sm font-medium">Storage Type</label>
              <Select value={storageType} onChange={(e) => setStorageType(e.target.value)}>
                <option value="Compressed">Compressed</option>
                <option value="Liquid">Liquid</option>
                <option value="Metal Hydride">Metal Hydride</option>
                <option value="Underground">Underground</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hydrogen Produced</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(hydrogenProduced, 1)} kg/day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Water Used</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-cyan-600">{formatNumber(waterUsed, 0)} L/day</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Carbon Offset</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{formatNumber(carbonOffset, 0)} kg CO₂/day</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Simulated Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={simulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="hydrogen" stroke="#3B82F6" name="H₂ Produced (kg)" />
                  <Line type="monotone" dataKey="energy" stroke="#F59E0B" name="Energy Input (kWh)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
