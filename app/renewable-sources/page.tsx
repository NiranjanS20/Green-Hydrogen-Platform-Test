'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Sun, Wind, Droplets, Plus, Trash2, Activity, Leaf, MapPin } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';

type RenewableSource = {
  id: string;
  type: 'Solar' | 'Wind' | 'Hydro';
  capacity_kwh: number;
  uptime_percent: number;
  location: string;
  status: 'active' | 'offline' | 'maintenance';
  created_at: string;
};

export default function RenewableSourcesPage() {
  const [sources, setSources] = useState<RenewableSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSource, setNewSource] = useState({
    type: 'Solar' as RenewableSource['type'],
    capacity_kwh: 0,
    uptime_percent: 0,
    location: '',
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    // Replace with Supabase fetch if needed
    setSources([
      {
        id: 's1',
        type: 'Solar',
        capacity_kwh: 5000,
        uptime_percent: 85,
        location: 'Rajasthan',
        status: 'active',
        created_at: '2025-10-01',
      },
      {
        id: 's2',
        type: 'Wind',
        capacity_kwh: 3200,
        uptime_percent: 78,
        location: 'Gujarat',
        status: 'maintenance',
        created_at: '2025-09-28',
      },
    ]);
    setLoading(false);
  };

  const handleAddSource = () => {
    const newId = `s${sources.length + 1}`;
    setSources([
      ...sources,
      {
        id: newId,
        ...newSource,
        status: 'active',
        created_at: new Date().toISOString().split('T')[0],
      },
    ]);
    setShowAddModal(false);
    setNewSource({
      type: 'Solar',
      capacity_kwh: 0,
      uptime_percent: 0,
      location: '',
    });
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const totalCapacity = sources.reduce((sum, s) => sum + s.capacity_kwh, 0);
  const avgUptime = sources.length > 0 ? sources.reduce((sum, s) => sum + s.uptime_percent, 0) / sources.length : 0;

  const chartData = sources.map((s, i) => ({
    day: `Day ${i + 1}`,
    capacity: s.capacity_kwh,
    uptime: s.uptime_percent,
  }));

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Renewable Sources</h1>
          <p className="text-gray-700">Connect and monitor solar, wind, and hydro inputs</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Source
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(totalCapacity, 0)} kWh/day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{formatNumber(avgUptime, 1)}%</p>
            <Progress value={avgUptime} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{sources.filter((s) => s.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="capacity" stroke="#3B82F6" name="Capacity (kWh)" />
              <Line type="monotone" dataKey="uptime" stroke="#10B981" name="Uptime (%)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="p-4 rounded-xl border bg-white/40 hover:bg-white/60 transition">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 items-center">
                  {source.type === 'Solar' && <Sun className="w-5 h-5 text-yellow-500" />}
                  {source.type === 'Wind' && <Wind className="w-5 h-5 text-blue-500" />}
                  {source.type === 'Hydro' && <Droplets className="w-5 h-5 text-cyan-500" />}
                  <h3 className="text-lg font-bold">{source.type}</h3>
                  <Badge>{source.status}</Badge>
                </div>
                <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteSource(source.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
                <p><Leaf className="inline w-4 h-4 mr-1" /> {source.capacity_kwh} kWh</p>
                <p><Activity className="inline w-4 h-4 mr-1" /> {source.uptime_percent}% uptime</p>
                <p><MapPin className="inline w-4 h-4 mr-1" /> {source.location}</p>
                <p><span className="inline-block w-4 h-4 mr-1" /> {formatDate(source.created_at)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
