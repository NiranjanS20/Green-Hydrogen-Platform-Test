'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Factory, Plus, TrendingUp, Zap, Droplets, Activity, Edit, Trash2, Calendar, MapPin, Settings } from 'lucide-react';
import { supabase, getCurrentUser, ProductionFacility, ProductionRecord } from '@/lib/supabase';
import { calculateWaterConsumption, calculateCarbonOffset } from '@/lib/calculations';
import { formatNumber, formatDate, getStatusColor } from '@/lib/utils';

export default function ProductionPage() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<ProductionFacility[]>([]);
  const [, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [, setSelectedFacility] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const [newFacility, setNewFacility] = useState({
    name: '',
    location: '',
    electrolyzer_type: 'PEM' as 'PEM' | 'Alkaline' | 'SOEC',
    capacity_kg_per_day: 0,
    efficiency_percent: 70
  });

  const productionTrends = [
    { date: '2024-01-01', h2_produced: 450, energy_used: 17730, efficiency: 68 },
    { date: '2024-01-02', h2_produced: 480, energy_used: 18912, efficiency: 69 },
    { date: '2024-01-03', h2_produced: 520, energy_used: 20488, efficiency: 70 },
    { date: '2024-01-04', h2_produced: 495, energy_used: 19503, efficiency: 69 },
    { date: '2024-01-05', h2_produced: 540, energy_used: 21276, efficiency: 71 },
    { date: '2024-01-06', h2_produced: 565, energy_used: 22249, efficiency: 71 },
    { date: '2024-01-07', h2_produced: 590, energy_used: 23248, efficiency: 72 }
  ];

  const electrolyzerComparison = [
    { type: 'PEM', current: 68, target: 70, optimal: 75 },
    { type: 'Alkaline', current: 62, target: 65, optimal: 68 },
    { type: 'SOEC', current: 85, target: 88, optimal: 90 }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const { data: facilitiesData, error: facilitiesError } = await supabase
          .from('production_facilities')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (facilitiesError) throw facilitiesError;
        setFacilities(facilitiesData || []);

        if (facilitiesData && facilitiesData.length > 0) {
          setSelectedFacility(facilitiesData[0].id);

          const { data: recordsData, error: recordsError } = await supabase
            .from('production_records')
            .select('*')
            .eq('facility_id', facilitiesData[0].id)
            .order('production_date', { ascending: false })
            .limit(30);

          if (recordsError) throw recordsError;
          setProductionRecords(recordsData || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('production_facilities')
        .insert([{
          user_id: user.id,
          name: newFacility.name,
          location: newFacility.location,
          electrolyzer_type: newFacility.electrolyzer_type,
          capacity_kg_per_day: newFacility.capacity_kg_per_day,
          efficiency_percent: newFacility.efficiency_percent,
          status: 'operational',
          commissioned_date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) throw error;

      setFacilities([...facilities, data[0]]);
      setShowAddModal(false);
      setNewFacility({
        name: '',
        location: '',
        electrolyzer_type: 'PEM',
        capacity_kg_per_day: 0,
        efficiency_percent: 70
      });
    } catch (error) {
      console.error('Error adding facility:', error);
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      const { error } = await supabase
        .from('production_facilities')
        .delete()
        .eq('id', facilityId);

      if (error) throw error;
      setFacilities(facilities.filter(f => f.id !== facilityId));
    } catch (error) {
      console.error('Error deleting facility:', error);
    }
  };

  const getTotalProduction = () => {
    return facilities.reduce((sum, f) => sum + (f.capacity_kg_per_day || 0), 0);
  };

  const getAverageEfficiency = () => {
    if (facilities.length === 0) return 0;
    const sum = facilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0);
    return sum / facilities.length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Hydrogen Production</h1>
          <p className="text-gray-700">Manage electrolyzers and monitor production efficiency</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Facility
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Capacity</CardTitle>
            <Factory className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatNumber(getTotalProduction(), 0)} kg/day</div>
            <p className="text-xs text-gray-600 mt-2">{facilities.length} active facilities</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Efficiency</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatNumber(getAverageEfficiency(), 1)}%</div>
            <Progress value={getAverageEfficiency()} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Energy Required</CardTitle>
            <Zap className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{formatNumber(getTotalProduction() * 39.4, 0)} kWh/day</div>
            <p className="text-xs text-gray-600 mt-2">Based on capacity</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Water Needed</CardTitle>
            <Droplets className="w-4 h-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-cyan-600">{formatNumber(getTotalProduction() * 10.5, 0)} L/day</div>
            <p className="text-xs text-gray-600 mt-2">For max capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Production Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Production Trends (Last 7 Days)
            </CardTitle>
            <CardDescription>Hydrogen production and efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" tickFormatter={(val) => new Date(val).getDate().toString()} />
                <YAxis yAxisId="left" stroke="#6b7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="h2_produced" stroke="#3B82F6" strokeWidth={3} name="H₂ Produced (kg)" dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="efficiency" stroke="#10B981" strokeWidth={3} name="Efficiency (%)" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Electrolyzer Performance
            </CardTitle>
            <CardDescription>Current vs target efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={electrolyzerComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="type" stroke="#6b7280" />
                <YAxis stroke="#6b7280" domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="current" fill="#3B82F6" name="Current" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#10B981" name="Target" radius={[8, 8, 0, 0]} />
                <Bar dataKey="optimal" fill="#F59E0B" name="Optimal" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Facilities List */}
      <Card className="glassmorphic-strong border-2 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            Production Facilities
          </CardTitle>
          <CardDescription>Manage your hydrogen production sites</CardDescription>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <div className="text-center py-12">
              <Factory className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Production Facilities</h3>
              <p className="text-gray-600 mb-6">Add your first facility to start tracking hydrogen production</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Add Facility
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {facilities.map((facility) => (
                <div key={facility.id} className="p-6 bg-white/40 rounded-xl border-2 border-white/60 hover:bg-white/60 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{facility.name}</h3>
                        <Badge className={getStatusColor(facility.status)}>
                          {facility.status}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {facility.electrolyzer_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {facility.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Since {formatDate(facility.commissioned_date || facility.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" className="border border-white/10">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteFacility(facility.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Daily Capacity</p>
                      <p className="text-lg font-bold text-blue-800">{formatNumber(facility.capacity_kg_per_day, 0)} kg</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">Efficiency</p>
                      <p className="text-lg font-bold text-green-800">{facility.efficiency_percent}%</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-medium mb-1">Energy/Day</p>
                      <p className="text-lg font-bold text-yellow-800">{formatNumber(facility.capacity_kg_per_day * 39.4, 0)} kWh</p>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                      <p className="text-xs text-cyan-600 font-medium mb-1">Water/Day</p>
                      <p className="text-lg font-bold text-cyan-800">{formatNumber(calculateWaterConsumption(facility.capacity_kg_per_day), 0)} L</p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">Carbon Offset Potential</p>
                        <p className="text-xs text-green-600">Based on replacing gray hydrogen</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-800">{formatNumber(calculateCarbonOffset(facility.capacity_kg_per_day), 0)} kg CO₂/day</p>
                        <p className="text-xs text-green-600">{formatNumber(calculateCarbonOffset(facility.capacity_kg_per_day) * 365 / 1000, 1)} tons/year</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Electrolyzer Technology Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glassmorphic-strong border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Settings className="w-5 h-5" />
              PEM Electrolyzer
            </CardTitle>
            <CardDescription>Proton Exchange Membrane</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efficiency Range:</span>
                <span className="font-semibold text-blue-800">60-70%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Operating Temp:</span>
                <span className="font-semibold text-blue-800">50-80°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-blue-800">30-80 bar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-semibold text-blue-800">Fast</span>
              </div>
              <Badge className="w-full justify-center bg-blue-100 text-blue-800 border-blue-200">Commercial</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Settings className="w-5 h-5" />
              Alkaline Electrolyzer
            </CardTitle>
            <CardDescription>Traditional Technology</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efficiency Range:</span>
                <span className="font-semibold text-green-800">50-65%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Operating Temp:</span>
                <span className="font-semibold text-green-800">60-90°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-green-800">1-30 bar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-semibold text-green-800">Medium</span>
              </div>
              <Badge className="w-full justify-center bg-green-100 text-green-800 border-green-200">Mature</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Settings className="w-5 h-5" />
              SOEC Electrolyzer
            </CardTitle>
            <CardDescription>Solid Oxide Cell</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Efficiency Range:</span>
                <span className="font-semibold text-orange-800">80-90%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Operating Temp:</span>
                <span className="font-semibold text-orange-800">700-850°C</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-orange-800">1-25 bar</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Response Time:</span>
                <span className="font-semibold text-orange-800">Slow</span>
              </div>
              <Badge className="w-full justify-center bg-orange-100 text-orange-800 border-orange-200">Developing</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl glassmorphic-strong border-2 border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="w-6 h-6 text-blue-600" />
                Add Production Facility
              </CardTitle>
              <CardDescription>Create a new hydrogen production facility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Facility Name</label>
                  <Input
                    placeholder="e.g., Solar H2 Plant Alpha"
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <Input
                    placeholder="e.g., California, USA"
                    value={newFacility.location}
                    onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Electrolyzer Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={newFacility.electrolyzer_type}
                      onChange={(e) => setNewFacility({ ...newFacility, electrolyzer_type: e.target.value as 'PEM' | 'Alkaline' | 'SOEC' })}
                    >
                      <option value="PEM">PEM</option>
                      <option value="Alkaline">Alkaline</option>
                      <option value="SOEC">SOEC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Efficiency (%)</label>
                    <Input
                      type="number"
                      placeholder="70"
                      value={newFacility.efficiency_percent || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, efficiency_percent: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Daily Capacity (kg H₂)</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={newFacility.capacity_kg_per_day || ''}
                    onChange={(e) => setNewFacility({ ...newFacility, capacity_kg_per_day: parseFloat(e.target.value) })}
                  />
                </div>

                {newFacility.capacity_kg_per_day > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Calculated Requirements:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-blue-600">Energy: </span>
                        <span className="font-semibold text-blue-800">{formatNumber(newFacility.capacity_kg_per_day * 39.4, 0)} kWh/day</span>
                      </div>
                      <div>
                        <span className="text-blue-600">Water: </span>
                        <span className="font-semibold text-blue-800">{formatNumber(calculateWaterConsumption(newFacility.capacity_kg_per_day), 0)} L/day</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 border border-white/10">
                  Cancel
                </Button>
                <Button onClick={handleAddFacility} className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white" disabled={!newFacility.name || !newFacility.location || newFacility.capacity_kg_per_day <= 0}>
                  Add Facility
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}