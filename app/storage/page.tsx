'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Database, Plus, TrendingUp, Thermometer, Gauge, AlertTriangle, CheckCircle2, Edit, Trash2, MapPin, Calendar, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { supabase, getCurrentUser, StorageFacility, StorageRecord } from '@/lib/supabase';
import { calculateStorageUtilization, calculateCompressionEnergy, calculateLiquefactionEnergy } from '@/lib/calculations';
import { formatNumber, formatDate, formatDateTime, getStatusColor } from '@/lib/utils';

export default function StoragePage() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<StorageFacility[]>([]);
  const [storageRecords, setStorageRecords] = useState<StorageRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<StorageFacility | null>(null);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const [newFacility, setNewFacility] = useState({
    name: '',
    location: '',
    storage_type: 'compressed' as 'compressed' | 'liquid' | 'metal_hydride' | 'underground',
    capacity_kg: 0,
    pressure_bar: 350,
    temperature_celsius: 20
  });

  const [transaction, setTransaction] = useState({
    transaction_type: 'input' as 'input' | 'output',
    quantity_kg: 0,
    notes: ''
  });

  const storageUtilizationData = [
    { name: 'Compressed A', value: 76, color: '#3B82F6' },
    { name: 'Liquid B', value: 82, color: '#8B5CF6' },
    { name: 'Underground C', value: 64, color: '#10B981' }
  ];

  const storageTransactions = [
    { date: '2024-01-01', input: 450, output: 320, net: 130 },
    { date: '2024-01-02', input: 480, output: 350, net: 130 },
    { date: '2024-01-03', input: 520, output: 380, net: 140 },
    { date: '2024-01-04', input: 495, output: 400, net: 95 },
    { date: '2024-01-05', input: 540, output: 420, net: 120 },
    { date: '2024-01-06', input: 565, output: 450, net: 115 },
    { date: '2024-01-07', input: 590, output: 480, net: 110 }
  ];

  const temperaturePressureData = [
    { time: '00:00', temp: 20, pressure: 350 },
    { time: '04:00', temp: 21, pressure: 352 },
    { time: '08:00', temp: 23, pressure: 355 },
    { time: '12:00', temp: 25, pressure: 358 },
    { time: '16:00', temp: 24, pressure: 356 },
    { time: '20:00', temp: 22, pressure: 353 },
    { time: '24:00', temp: 20, pressure: 350 }
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
          .from('storage_facilities')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (facilitiesError) throw facilitiesError;
        setFacilities(facilitiesData || []);

        if (facilitiesData && facilitiesData.length > 0) {
          const { data: recordsData, error: recordsError } = await supabase
            .from('storage_records')
            .select('*')
            .in('storage_id', facilitiesData.map(f => f.id))
            .order('record_date', { ascending: false })
            .limit(50);

          if (recordsError) throw recordsError;
          setStorageRecords(recordsData || []);
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
        .from('storage_facilities')
        .insert([{
          user_id: user.id,
          name: newFacility.name,
          location: newFacility.location,
          storage_type: newFacility.storage_type,
          capacity_kg: newFacility.capacity_kg,
          current_level_kg: 0,
          pressure_bar: newFacility.pressure_bar,
          temperature_celsius: newFacility.temperature_celsius,
          status: 'operational',
          last_inspection_date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) throw error;

      setFacilities([...facilities, data[0]]);
      setShowAddModal(false);
      setNewFacility({
        name: '',
        location: '',
        storage_type: 'compressed',
        capacity_kg: 0,
        pressure_bar: 350,
        temperature_celsius: 20
      });
    } catch (error) {
      console.error('Error adding facility:', error);
    }
  };

  const handleAddTransaction = async () => {
    if (!selectedFacility || !user) return;

    try {
      const newLevel = transaction.transaction_type === 'input'
        ? selectedFacility.current_level_kg + transaction.quantity_kg
        : selectedFacility.current_level_kg - transaction.quantity_kg;

      if (newLevel < 0 || newLevel > selectedFacility.capacity_kg) {
        alert('Invalid transaction: would exceed storage limits');
        return;
      }

      const { data: recordData, error: recordError } = await supabase
        .from('storage_records')
        .insert([{
          storage_id: selectedFacility.id,
          record_date: new Date().toISOString(),
          transaction_type: transaction.transaction_type,
          quantity_kg: transaction.quantity_kg,
          pressure_bar: selectedFacility.pressure_bar,
          temperature_celsius: selectedFacility.temperature_celsius,
          notes: transaction.notes
        }])
        .select();

      if (recordError) throw recordError;

      const { error: updateError } = await supabase
        .from('storage_facilities')
        .update({ current_level_kg: newLevel })
        .eq('id', selectedFacility.id);

      if (updateError) throw updateError;

      const updatedFacilities = facilities.map(f =>
        f.id === selectedFacility.id ? { ...f, current_level_kg: newLevel } : f
      );
      setFacilities(updatedFacilities);
      setStorageRecords([recordData[0], ...storageRecords]);
      setShowTransactionModal(false);
      setTransaction({ transaction_type: 'input', quantity_kg: 0, notes: '' });
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      const { error } = await supabase
        .from('storage_facilities')
        .delete()
        .eq('id', facilityId);

      if (error) throw error;
      setFacilities(facilities.filter(f => f.id !== facilityId));
    } catch (error) {
      console.error('Error deleting facility:', error);
    }
  };

  const getTotalCapacity = () => {
    return facilities.reduce((sum, f) => sum + f.capacity_kg, 0);
  };

  const getTotalStored = () => {
    return facilities.reduce((sum, f) => sum + f.current_level_kg, 0);
  };

  const getAverageUtilization = () => {
    if (facilities.length === 0) return 0;
    const totalUtil = facilities.reduce((sum, f) => sum + calculateStorageUtilization(f.current_level_kg, f.capacity_kg), 0);
    return totalUtil / facilities.length;
  };

  const getTotalCompressionEnergy = () => {
    return facilities
      .filter(f => f.storage_type === 'compressed')
      .reduce((sum, f) => sum + calculateCompressionEnergy(f.current_level_kg, f.pressure_bar || 350), 0);
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
          <h1 className="text-4xl font-bold gradient-text mb-2">Storage Management</h1>
          <p className="text-gray-700">Monitor hydrogen storage facilities and inventory levels</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <Plus className="w-5 h-5 mr-2" />
          Add Storage
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Capacity</CardTitle>
            <Database className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{formatNumber(getTotalCapacity(), 0)} kg</div>
            <p className="text-xs text-gray-600 mt-2">{facilities.length} storage facilities</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Current Stored</CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatNumber(getTotalStored(), 0)} kg</div>
            <p className="text-xs text-gray-600 mt-2">{formatNumber((getTotalStored() / getTotalCapacity()) * 100, 1)}% of capacity</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Avg Utilization</CardTitle>
            <Gauge className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatNumber(getAverageUtilization(), 1)}%</div>
            <Progress value={getAverageUtilization()} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Compression Energy</CardTitle>
            <Thermometer className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{formatNumber(getTotalCompressionEnergy(), 0)} kWh</div>
            <p className="text-xs text-gray-600 mt-2">For stored volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage Transactions Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Storage Transactions (Last 7 Days)
            </CardTitle>
            <CardDescription>Input, output, and net storage changes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storageTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" tickFormatter={(val) => new Date(val).getDate().toString()} />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="input" fill="#10B981" name="Input (kg)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="output" fill="#EF4444" name="Output (kg)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="net" fill="#3B82F6" name="Net Change (kg)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-purple-600" />
              Storage Utilization
            </CardTitle>
            <CardDescription>Capacity utilization by facility</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={storageUtilizationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {storageUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Temperature and Pressure Monitoring */}
      <Card className="glassmorphic-strong border-2 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-600" />
            Temperature & Pressure Monitoring
          </CardTitle>
          <CardDescription>Real-time environmental conditions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={temperaturePressureData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" label={{ value: 'Pressure (bar)', angle: 90, position: 'insideRight' }} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#F59E0B" strokeWidth={3} name="Temperature (°C)" dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="pressure" stroke="#8B5CF6" strokeWidth={3} name="Pressure (bar)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Storage Facilities List */}
      <Card className="glassmorphic-strong border-2 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Storage Facilities
          </CardTitle>
          <CardDescription>Manage your hydrogen storage infrastructure</CardDescription>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Storage Facilities</h3>
              <p className="text-gray-600 mb-6">Add your first storage facility to start managing inventory</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Add Storage
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {facilities.map((facility) => {
                const utilization = calculateStorageUtilization(facility.current_level_kg, facility.capacity_kg);
                const available = facility.capacity_kg - facility.current_level_kg;

                return (
                  <div key={facility.id} className="p-6 bg-white/40 rounded-xl border-2 border-white/60 hover:bg-white/60 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{facility.name}</h3>
                          <Badge className={getStatusColor(facility.status)}>
                            {facility.status}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                            {facility.storage_type.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {facility.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Last Inspection: {formatDate(facility.last_inspection_date || facility.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          className="border border-white/10"
                          onClick={() => {
                            setSelectedFacility(facility);
                            setShowTransactionModal(true);
                          }}
                        >
                          <ArrowUp className="w-4 h-4 mr-1" />
                          Add/Remove
                        </Button>
                        <Button variant="ghost" className="border border-white/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="border border-white/10" onClick={() => handleDeleteFacility(facility.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Storage Level</span>
                        <span className="text-sm font-bold text-purple-600">{formatNumber(utilization, 1)}%</span>
                      </div>
                      <Progress value={utilization} className="h-3" />
                      <div className="flex justify-between mt-1 text-xs text-gray-600">
                        <span>{formatNumber(facility.current_level_kg, 0)} kg stored</span>
                        <span>{formatNumber(available, 0)} kg available</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-xs text-purple-600 font-medium mb-1">Total Capacity</p>
                        <p className="text-lg font-bold text-purple-800">{formatNumber(facility.capacity_kg, 0)} kg</p>
                      </div>
                      {facility.pressure_bar && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium mb-1">Pressure</p>
                          <p className="text-lg font-bold text-blue-800">{facility.pressure_bar} bar</p>
                        </div>
                      )}
                      {facility.temperature_celsius && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <p className="text-xs text-orange-600 font-medium mb-1">Temperature</p>
                          <p className="text-lg font-bold text-orange-800">{facility.temperature_celsius}°C</p>
                        </div>
                      )}
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-600 font-medium mb-1">Utilization</p>
                        <p className="text-lg font-bold text-green-800">{formatNumber(utilization, 1)}%</p>
                      </div>
                    </div>

                    {utilization > 90 && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-900">High Utilization Warning</p>
                          <p className="text-xs text-yellow-700">Storage facility is at {formatNumber(utilization, 1)}% capacity. Consider offloading soon.</p>
                        </div>
                      </div>
                    )}

                    {utilization < 20 && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">Low Utilization</p>
                          <p className="text-xs text-blue-700">Storage facility has {formatNumber(available, 0)} kg available capacity.</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Technology Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glassmorphic-strong border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Compressed Gas</CardTitle>
            <CardDescription>High pressure storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-blue-800">200-700 bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Density:</span>
                <span className="font-semibold text-blue-800">0.5-1.3 kWh/L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compression:</span>
                <span className="font-semibold text-blue-800">2.2-3.4 kWh/kg</span>
              </div>
              <Badge className="w-full justify-center bg-blue-100 text-blue-800 border-blue-200 mt-3">Most Common</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="text-purple-800">Liquid H₂</CardTitle>
            <CardDescription>Cryogenic storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-semibold text-purple-800">-253°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Energy Density:</span>
                <span className="font-semibold text-purple-800">2.4 kWh/L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Liquefaction:</span>
                <span className="font-semibold text-purple-800">10-12 kWh/kg</span>
              </div>
              <Badge className="w-full justify-center bg-purple-100 text-purple-800 border-purple-200 mt-3">High Density</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Metal Hydride</CardTitle>
            <CardDescription>Solid state storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-green-800">1-30 bar</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold text-green-800">1-7 wt%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Temperature:</span>
                <span className="font-semibold text-green-800">-40 to 120°C</span>
              </div>
              <Badge className="w-full justify-center bg-green-100 text-green-800 border-green-200 mt-3">Safe & Stable</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-cyan-200">
          <CardHeader>
            <CardTitle className="text-cyan-800">Underground</CardTitle>
            <CardDescription>Salt cavern storage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Depth:</span>
                <span className="font-semibold text-cyan-800">500-2000 m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Capacity:</span>
                <span className="font-semibold text-cyan-800">100-1000 tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pressure:</span>
                <span className="font-semibold text-cyan-800">50-200 bar</span>
              </div>
              <Badge className="w-full justify-center bg-cyan-100 text-cyan-800 border-cyan-200 mt-3">Large Scale</Badge>
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
                <Database className="w-6 h-6 text-purple-600" />
                Add Storage Facility
              </CardTitle>
              <CardDescription>Create a new hydrogen storage facility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Facility Name</label>
                  <Input
                    placeholder="e.g., Compressed Storage Alpha"
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
                  <Input
                    placeholder="e.g., Texas, USA"
                    value={newFacility.location}
                    onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Storage Type</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      value={newFacility.storage_type}
                      onChange={(e) => setNewFacility({ ...newFacility, storage_type: e.target.value as 'compressed' | 'liquid' | 'metal_hydride' | 'underground' })}
                    >
                      <option value="compressed">Compressed Gas</option>
                      <option value="liquid">Liquid Hydrogen</option>
                      <option value="metal_hydride">Metal Hydride</option>
                      <option value="underground">Underground Cavern</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Capacity (kg)</label>
                    <Input
                      type="number"
                      placeholder="5000"
                      value={newFacility.capacity_kg || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, capacity_kg: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
                {newFacility.storage_type === 'compressed' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Pressure (bar)</label>
                    <Input
                      type="number"
                      placeholder="350"
                      value={newFacility.pressure_bar || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, pressure_bar: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
                {newFacility.storage_type === 'liquid' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Temperature (°C)</label>
                    <Input
                      type="number"
                      placeholder="-253"
                      value={newFacility.temperature_celsius || ''}
                      onChange={(e) => setNewFacility({ ...newFacility, temperature_celsius: parseFloat(e.target.value) })}
                    />
                  </div>
                )}
                {newFacility.capacity_kg > 0 && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Storage Information:</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-purple-600">Type: </span>
                        <span className="font-semibold text-purple-800">{newFacility.storage_type.replace('_', ' ')}</span>
                      </div>
                      {newFacility.storage_type === 'compressed' && newFacility.capacity_kg > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-600">Compression Energy: </span>
                          <span className="font-semibold text-purple-800">{formatNumber(calculateCompressionEnergy(newFacility.capacity_kg, newFacility.pressure_bar), 0)} kWh</span>
                        </div>
                      )}
                      {newFacility.storage_type === 'liquid' && newFacility.capacity_kg > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-600">Liquefaction Energy: </span>
                          <span className="font-semibold text-purple-800">{formatNumber(calculateLiquefactionEnergy(newFacility.capacity_kg), 0)} kWh</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

                <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowAddModal(false)} variant="ghost" className="flex-1 border border-white/10">
                  Cancel
                </Button>
                <Button onClick={handleAddFacility} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white" disabled={!newFacility.name || !newFacility.location || newFacility.capacity_kg <= 0}>
                  Add Facility
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTransactionModal && selectedFacility && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg glassmorphic-strong border-2 border-white/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-6 h-6 text-blue-600" />
                Storage Transaction
              </CardTitle>
              <CardDescription>{selectedFacility.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-600 mb-1">Current Level</p>
                    <p className="text-xl font-bold text-blue-800">{formatNumber(selectedFacility.current_level_kg, 0)} kg</p>
                  </div>
                  <div>
                    <p className="text-blue-600 mb-1">Available Capacity</p>
                    <p className="text-xl font-bold text-blue-800">{formatNumber(selectedFacility.capacity_kg - selectedFacility.current_level_kg, 0)} kg</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Transaction Type</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    value={transaction.transaction_type}
                    onChange={(e) => setTransaction({ ...transaction, transaction_type: e.target.value as 'input' | 'output' })}
                  >
                    <option value="input">Input (Add H₂)</option>
                    <option value="output">Output (Remove H₂)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity (kg)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={transaction.quantity_kg || ''}
                    onChange={(e) => setTransaction({ ...transaction, quantity_kg: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Max {transaction.transaction_type === 'input'
                      ? formatNumber(selectedFacility.capacity_kg - selectedFacility.current_level_kg, 0)
                      : formatNumber(selectedFacility.current_level_kg, 0)} kg
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Notes (Optional)</label>
                  <Input
                    placeholder="e.g., Daily production batch"
                    value={transaction.notes}
                    onChange={(e) => setTransaction({ ...transaction, notes: e.target.value })}
                  />
                </div>

                {transaction.quantity_kg > 0 && (
                  <div className={`p-4 rounded-lg border ${transaction.transaction_type === 'input'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    }`}>
                    <p className="text-sm font-medium mb-2">
                      {transaction.transaction_type === 'input' ? 'After Adding:' : 'After Removing:'}
                    </p>
                    <div className="flex justify-between text-sm">
                      <span>New Level:</span>
                      <span className="font-bold">
                        {formatNumber(
                          transaction.transaction_type === 'input'
                            ? selectedFacility.current_level_kg + transaction.quantity_kg
                            : selectedFacility.current_level_kg - transaction.quantity_kg,
                          0
                        )} kg
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Utilization:</span>
                      <span className="font-bold">
                        {formatNumber(
                          calculateStorageUtilization(
                            transaction.transaction_type === 'input'
                              ? selectedFacility.current_level_kg + transaction.quantity_kg
                              : selectedFacility.current_level_kg - transaction.quantity_kg,
                            selectedFacility.capacity_kg
                          ),
                          1
                        )}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={() => {
                  setShowTransactionModal(false);
                  setTransaction({ transaction_type: 'input', quantity_kg: 0, notes: '' });
                }} variant="ghost" className="flex-1 border border-white/10">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddTransaction}
                  className={`flex-1 ${transaction.transaction_type === 'input'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                      : 'bg-gradient-to-r from-red-600 to-orange-600'
                    } text-white`}
                  disabled={transaction.quantity_kg <= 0}
                >
                  {transaction.transaction_type === 'input' ? (
                    <>
                      <ArrowUp className="w-4 h-4 mr-2" />
                      Add to Storage
                    </>
                  ) : (
                    <>
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Remove from Storage
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      {storageRecords.length > 0 && (
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Recent Transactions
            </CardTitle>
            <CardDescription>Latest storage input/output activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {storageRecords.slice(0, 10).map((record) => {
                const facility = facilities.find(f => f.id === record.storage_id);
                return (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-white/40 rounded-lg hover:bg-white/60 transition-all">
                    <div className="flex items-center gap-3">
                      {record.transaction_type === 'input' ? (
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <ArrowUp className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <ArrowDown className="w-5 h-5 text-red-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-800">
                          {record.transaction_type === 'input' ? 'Added' : 'Removed'} {formatNumber(record.quantity_kg, 0)} kg
                        </p>
                        <p className="text-sm text-gray-600">{facility?.name || 'Unknown Facility'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">{formatDateTime(record.record_date)}</p>
                      {record.notes && (
                        <p className="text-xs text-gray-600">{record.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}