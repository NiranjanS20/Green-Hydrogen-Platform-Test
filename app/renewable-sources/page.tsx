'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import Modal from '@/components/ui/modal';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Sun, Wind, Droplets, Plus, TrendingUp, Activity, Zap, MapPin, Calendar, Edit, Trash2, AlertTriangle, CheckCircle2, Leaf } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils';

type RenewableSource = {
  id: string;
  user_id: string;
  name: string;
  location: string;
  source_type: 'solar' | 'wind' | 'hydro';
  capacity_mw: number;
  capacity_factor: number;
  current_output_mw: number;
  uptime_percent: number;
  energy_produced_kwh: number;
  status: string;
  weather_dependent: boolean;
  installation_date: string;
  created_at: string;
};

export default function RenewableSourcesPage() {
  const [sources, setSources] = useState<RenewableSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const [newSource, setNewSource] = useState({
    name: '',
    location: '',
    source_type: 'solar' as RenewableSource['source_type'],
    capacity_mw: '',
    capacity_factor: '0.25',
    installation_date: ''
  });

  // Mock data for demonstration
  const energyProductionData = [
    { time: '00:00', solar: 0, wind: 45, hydro: 80 },
    { time: '06:00', solar: 20, wind: 52, hydro: 80 },
    { time: '12:00', solar: 85, wind: 38, hydro: 80 },
    { time: '18:00', solar: 15, wind: 65, hydro: 80 },
    { time: '24:00', solar: 0, wind: 48, hydro: 80 }
  ];

  const sourceTypeDistribution = [
    { name: 'Solar', value: 45, color: '#F59E0B' },
    { name: 'Wind', value: 35, color: '#3B82F6' },
    { name: 'Hydro', value: 20, color: '#10B981' }
  ];

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data, error } = await supabase
          .from('renewable_sources')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSources(data || []);
      }
    } catch (error) {
      console.error('Error loading renewable sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSource = async () => {
    if (!user || !newSource.name || !newSource.location || !newSource.capacity_mw) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('renewable_sources')
        .insert([{
          user_id: user.id,
          name: newSource.name,
          location: newSource.location,
          source_type: newSource.source_type,
          capacity_mw: parseFloat(newSource.capacity_mw),
          capacity_factor: parseFloat(newSource.capacity_factor),
          current_output_mw: 0,
          uptime_percent: 100,
          energy_produced_kwh: 0,
          status: 'operational',
          weather_dependent: newSource.source_type !== 'hydro',
          installation_date: newSource.installation_date || new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) throw error;

      setSources([data[0], ...sources]);
      setShowAddModal(false);
      setNewSource({
        name: '',
        location: '',
        source_type: 'solar',
        capacity_mw: '',
        capacity_factor: '0.25',
        installation_date: ''
      });
    } catch (error) {
      console.error('Error adding renewable source:', error);
      alert('Failed to add renewable source: ' + (error as any)?.message || 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this renewable source?')) return;

    try {
      const { error } = await supabase
        .from('renewable_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSources(sources.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting renewable source:', error);
      alert('Failed to delete renewable source');
    }
  };

  const getTotalCapacity = () => {
    return sources.reduce((sum, s) => sum + s.capacity_mw, 0);
  };

  const getCurrentOutput = () => {
    return sources.reduce((sum, s) => sum + s.current_output_mw, 0);
  };

  const getAverageCapacityFactor = () => {
    if (sources.length === 0) return 0;
    return sources.reduce((sum, s) => sum + s.capacity_factor, 0) / sources.length;
  };

  const getTotalEnergyProduced = () => {
    return sources.reduce((sum, s) => sum + s.energy_produced_kwh, 0);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'solar': return <Sun className="w-5 h-5 text-yellow-600" />;
      case 'wind': return <Wind className="w-5 h-5 text-blue-600" />;
      case 'hydro': return <Droplets className="w-5 h-5 text-cyan-600" />;
      default: return <Zap className="w-5 h-5 text-purple-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Capacity</CardTitle>
            <Zap className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatNumber(getTotalCapacity(), 1)} MW</div>
            <p className="text-xs text-gray-600 mt-2">{sources.length} sources connected</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Current Output</CardTitle>
            <Activity className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatNumber(getCurrentOutput(), 1)} MW</div>
            <p className="text-xs text-gray-600 mt-2">{getTotalCapacity() > 0 ? formatNumber((getCurrentOutput() / getTotalCapacity()) * 100, 1) : 0}% of capacity</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Capacity Factor</CardTitle>
            <TrendingUp className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{formatNumber(getAverageCapacityFactor() * 100, 1)}%</div>
            <Progress value={getAverageCapacityFactor() * 100} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Energy Produced</CardTitle>
            <Sun className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{formatNumber(getTotalEnergyProduced(), 0)} kWh</div>
            <p className="text-xs text-gray-600 mt-2">Total lifetime</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Energy Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={energyProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="solar" stroke="#F59E0B" name="Solar" />
              <Line type="monotone" dataKey="wind" stroke="#3B82F6" name="Wind" />
              <Line type="monotone" dataKey="hydro" stroke="#10B981" name="Hydro" />
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
            <div key={source.id} className="p-4 rounded-xl border bg-white/40 hover:bg-white/60 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-3 items-center">
                  {getSourceIcon(source.source_type)}
                  <h3 className="text-lg font-bold">{source.name}</h3>
                  <Badge>{source.status}</Badge>
                </div>
                <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteSource(source.id)}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                <p><Leaf className="inline w-4 h-4 mr-1" /> {source.capacity_mw} MW</p>
                <p><Activity className="inline w-4 h-4 mr-1" /> {source.uptime_percent}% uptime</p>
                <p><MapPin className="inline w-4 h-4 mr-1" /> {source.location}</p>
                <p><span className="inline-block w-4 h-4 mr-1" /> {formatDate(source.created_at)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glassmorphic-strong border-2 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-600" />
            Renewable Energy Sources
          </CardTitle>
          <CardDescription>Connected renewable energy installations</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <div className="text-center py-12">
              <Sun className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Renewable Sources</h3>
              <p className="text-gray-600 mb-6">Connect your first renewable energy source to start tracking clean energy production</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Add Source
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sources.map((source) => (
                <div key={source.id} className="p-6 bg-white/40 rounded-xl border-2 border-white/60 hover:bg-white/60 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {getSourceIcon(source.source_type)}
                        <h3 className="text-xl font-bold text-gray-800">{source.name}</h3>
                        <Badge className={getStatusColor(source.status)}>
                          {source.status}
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          {source.source_type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {source.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Since {formatDate(source.installation_date)}
                        </span>
                        {source.weather_dependent && (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="w-4 h-4" />
                            Weather Dependent
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="border border-white/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteSource(source.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">Capacity</p>
                      <p className="text-lg font-bold text-green-800">{formatNumber(source.capacity_mw, 1)} MW</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Current Output</p>
                      <p className="text-lg font-bold text-blue-800">{formatNumber(source.current_output_mw, 1)} MW</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-medium mb-1">Capacity Factor</p>
                      <p className="text-lg font-bold text-yellow-800">{formatNumber(source.capacity_factor * 100, 1)}%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs text-purple-600 font-medium mb-1">Uptime</p>
                      <p className="text-lg font-bold text-purple-800">{formatNumber(source.uptime_percent, 1)}%</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Energy Produced: {formatNumber(source.energy_produced_kwh, 0)} kWh</span>
                      <span>Added: {formatDate(source.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Renewable Energy Source">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={newSource.name}
              onChange={(e) => setNewSource({...newSource, name: e.target.value})}
              placeholder="e.g., Solar Farm Alpha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <Input
              value={newSource.location}
              onChange={(e) => setNewSource({...newSource, location: e.target.value})}
              placeholder="e.g., Rajasthan, India"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Select
                value={newSource.source_type}
                onChange={(e) => setNewSource({...newSource, source_type: e.target.value as RenewableSource['source_type']})}
                label="Source Type"
              >
                <option value="solar">☀️ Solar</option>
                <option value="wind">💨 Wind</option>
                <option value="hydro">💧 Hydro</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Capacity (MW) *</label>
              <Input
                type="number"
                value={newSource.capacity_mw}
                onChange={(e) => setNewSource({...newSource, capacity_mw: e.target.value})}
                placeholder="50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Capacity Factor</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={newSource.capacity_factor}
                onChange={(e) => setNewSource({...newSource, capacity_factor: e.target.value})}
                placeholder="0.25"
              />
              <p className="text-xs text-gray-500 mt-1">Typical: Solar 0.22, Wind 0.35, Hydro 0.40</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Installation Date</label>
              <Input
                type="date"
                value={newSource.installation_date}
                onChange={(e) => setNewSource({...newSource, installation_date: e.target.value})}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAddSource} className="bg-green-600 text-white" disabled={saving}>
            {saving ? 'Adding...' : 'Add Source'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
