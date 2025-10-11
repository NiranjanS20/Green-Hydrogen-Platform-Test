'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Truck, MapPin, Plus, Trash2, Activity, Zap, ShieldCheck } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

type TransportRoute = {
  id: string;
  method: 'Trailer' | 'Pipeline' | 'Tanker' | 'Underground';
  distance_km: number;
  pressure_loss_percent: number;
  energy_cost_kwh: number;
  status: 'active' | 'maintenance' | 'offline';
  origin: string;
  destination: string;
  created_at: string;
};

export default function TransportationPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({
    method: 'Trailer' as TransportRoute['method'],
    distance_km: 0,
    pressure_loss_percent: 0,
    energy_cost_kwh: 0,
    origin: '',
    destination: '',
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    // Replace with Supabase fetch if needed
    setRoutes([
      {
        id: 'r1',
        method: 'Pipeline',
        distance_km: 120,
        pressure_loss_percent: 5,
        energy_cost_kwh: 800,
        status: 'active',
        origin: 'Plant A',
        destination: 'Storage B',
        created_at: '2025-10-01',
      },
      {
        id: 'r2',
        method: 'Trailer',
        distance_km: 60,
        pressure_loss_percent: 2,
        energy_cost_kwh: 300,
        status: 'maintenance',
        origin: 'Plant C',
        destination: 'Station D',
        created_at: '2025-09-28',
      },
    ]);
    setLoading(false);
  };

  const handleAddRoute = () => {
    const newId = `r${routes.length + 1}`;
    setRoutes([
      ...routes,
      {
        id: newId,
        ...newRoute,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowAddModal(false);
    setNewRoute({
      method: 'Trailer',
      distance_km: 0,
      pressure_loss_percent: 0,
      energy_cost_kwh: 0,
      origin: '',
      destination: '',
    });
  };

  const handleDeleteRoute = (id: string) => {
    setRoutes(routes.filter((r) => r.id !== id));
  };

  const totalEnergy = routes.reduce((sum, r) => sum + r.energy_cost_kwh, 0);
  const avgPressureLoss = routes.length > 0 ? routes.reduce((sum, r) => sum + r.pressure_loss_percent, 0) / routes.length : 0;

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Hydrogen Transportation</h1>
          <p className="text-gray-700">Manage routes and monitor energy efficiency</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Energy Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{formatNumber(totalEnergy, 0)} kWh/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Pressure Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatNumber(avgPressureLoss, 1)}%</p>
            <Progress value={avgPressureLoss} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{routes.filter((r) => r.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Route Efficiency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={routes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="method" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="energy_cost_kwh" fill="#3B82F6" name="Energy Cost" />
              <Bar dataKey="pressure_loss_percent" fill="#EF4444" name="Pressure Loss (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transport Routes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {routes.map((route) => (
            <div key={route.id} className="p-4 rounded-xl border bg-white/40 hover:bg-white/60 transition">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 items-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold">{route.method}</h3>
                  <Badge>{route.status}</Badge>
                </div>
                <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteRoute(route.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <p><MapPin className="inline w-4 h-4 mr-1" /> {route.origin} → {route.destination}</p>
                <p><Zap className="inline w-4 h-4 mr-1" /> {route.energy_cost_kwh} kWh</p>
                <p><Activity className="inline w-4 h-4 mr-1" /> {route.pressure_loss_percent}% loss</p>
                <p><ShieldCheck className="inline w-4 h-4 mr-1" /> {formatDate(route.created_at)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
