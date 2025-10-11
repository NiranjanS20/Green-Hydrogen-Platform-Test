'use client';

import { useState } from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Progress } from '@/components/ui/progress';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Droplets, Zap, Leaf, Factory } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });

  const kpis = {
    hydrogenProduced: 4200,
    energyUsed: 165000,
    waterUsed: 44000,
    carbonOffset: 9800,
  };

  const productionTrend = [
    { date: '2025-10-01', h2: 600, energy: 24000 },
    { date: '2025-10-02', h2: 580, energy: 23200 },
    { date: '2025-10-03', h2: 620, energy: 24800 },
    { date: '2025-10-04', h2: 610, energy: 24400 },
    { date: '2025-10-05', h2: 590, energy: 23600 },
  ];

  const sourceBreakdown = [
    { name: 'Solar', value: 45 },
    { name: 'Wind', value: 30 },
    { name: 'Hydro', value: 15 },
    { name: 'Grid', value: 10 },
  ];

  const facilityPerformance = [
    { name: 'Plant A', efficiency: 72, uptime: 90 },
    { name: 'Plant B', efficiency: 68, uptime: 85 },
    { name: 'Plant C', efficiency: 75, uptime: 92 },
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-gray-700">Visualize performance across your hydrogen platform</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Hydrogen Produced</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(kpis.hydrogenProduced, 0)} kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Energy Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{formatNumber(kpis.energyUsed, 0)} kWh</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Water Consumed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cyan-600">{formatNumber(kpis.waterUsed, 0)} L</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Carbon Offset</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatNumber(kpis.carbonOffset, 0)} kg CO₂</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Production Trends</CardTitle>
            <CardDescription>Hydrogen vs Energy over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="h2" stroke="#3B82F6" name="H₂ Produced" />
                <Line type="monotone" dataKey="energy" stroke="#F59E0B" name="Energy Used" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Energy Source Breakdown</CardTitle>
            <CardDescription>Contribution by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sourceBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {sourceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facility Performance</CardTitle>
          <CardDescription>Efficiency and uptime</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={facilityPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="efficiency" fill="#10B981" name="Efficiency (%)" />
              <Bar dataKey="uptime" fill="#3B82F6" name="Uptime (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
