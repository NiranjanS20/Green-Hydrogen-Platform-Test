'use client';

import { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import Select from '@/components/ui/select';
import Modal from '@/components/ui/modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Truck, MapPin, Plus, Trash2, Activity, Zap, Package, Route, Play, Pause, CheckCircle2, Clock, Navigation, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils';
import { supabase, getCurrentUser } from '@/lib/supabase';

type TransportRoute = {
  id: string;
  route_name: string;
  origin: string;
  destination: string;
  transport_type: 'tube_trailer' | 'tanker' | 'pipeline';
  distance_km: number;
  capacity_kg: number;
  current_load_kg: number;
  status: 'scheduled' | 'in_transit' | 'completed';
  energy_cost_kwh: number | null;
  pressure_loss_bar: number | null;
  created_at: string;
  updated_at?: string;
};

export default function TransportationPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newRoute, setNewRoute] = useState({
    route_name: '',
    origin: '',
    destination: '',
    transport_type: 'tube_trailer' as TransportRoute['transport_type'],
    distance_km: '',
    capacity_kg: '',
    energy_cost_kwh: '',
    pressure_loss_bar: '',
  });
  
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState({
    load_kg: '',
    priority: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    estimated_time: '',
    notes: ''
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      const { user } = await getCurrentUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading routes:', error);
      } else if (data) {
        setRoutes(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async (): Promise<void> => {
    if (!newRoute.route_name || !newRoute.origin || !newRoute.destination) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const { user } = await getCurrentUser();
      if (!user) {
        alert('Please login to add routes');
        return;
      }

      const { error } = await supabase.from('transport_routes').insert({
        user_id: user.id,
        route_name: newRoute.route_name,
        origin: newRoute.origin,
        destination: newRoute.destination,
        transport_type: newRoute.transport_type,
        distance_km: parseFloat(newRoute.distance_km) || 0,
        capacity_kg: parseFloat(newRoute.capacity_kg) || 0,
        current_load_kg: 0,
        status: 'scheduled',
        energy_cost_kwh: parseFloat(newRoute.energy_cost_kwh) || null,
        pressure_loss_bar: parseFloat(newRoute.pressure_loss_bar) || null,
      });

      if (error) {
        console.error('Error adding route:', error);
        alert('Failed to add route: ' + error.message);
      } else {
        await loadRoutes();
        setShowAddModal(false);
        setNewRoute({
          route_name: '',
          origin: '',
          destination: '',
          transport_type: 'tube_trailer',
          distance_km: '',
          capacity_kg: '',
          energy_cost_kwh: '',
          pressure_loss_bar: '',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (!confirm('Are you sure you want to delete this route?')) return;
    
    const { error } = await supabase.from('transport_routes').delete().eq('id', id);
    
    if (error) {
      console.error('Error deleting route:', error);
      alert('Failed to delete route');
    } else {
      await loadRoutes();
    }
  };

  const startDelivery = (route: TransportRoute) => {
    setSelectedRoute(route);
    setDeliveryDetails({
      load_kg: route.capacity_kg.toString(),
      priority: 'normal',
      estimated_time: calculateEstimatedTime(route).toString(),
      notes: ''
    });
    setShowDeliveryModal(true);
  };

  const handleStartDelivery = async () => {
    if (!selectedRoute) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('transport_routes')
        .update({
          status: 'in_transit',
          current_load_kg: parseFloat(deliveryDetails.load_kg),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRoute.id);

      if (error) throw error;

      // Create delivery record
      await supabase.from('delivery_records').insert({
        route_id: selectedRoute.id,
        load_kg: parseFloat(deliveryDetails.load_kg),
        priority: deliveryDetails.priority,
        estimated_delivery: new Date(Date.now() + parseFloat(deliveryDetails.estimated_time) * 60 * 60 * 1000).toISOString(),
        status: 'in_transit',
        notes: deliveryDetails.notes
      });

      await loadRoutes();
      setShowDeliveryModal(false);
      alert('Delivery started successfully!');
    } catch (error) {
      console.error('Error starting delivery:', error);
      alert('Failed to start delivery');
    } finally {
      setSaving(false);
    }
  };

  const completeDelivery = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from('transport_routes')
        .update({
          status: 'completed',
          current_load_kg: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      if (error) throw error;
      await loadRoutes();
      alert('Delivery completed!');
    } catch (error) {
      console.error('Error completing delivery:', error);
      alert('Failed to complete delivery');
    }
  };

  const calculateEstimatedTime = (route: TransportRoute): number => {
    // Simple calculation: distance / average speed + loading time
    const avgSpeed = route.transport_type === 'pipeline' ? 50 : 60; // km/h
    const loadingTime = 0.5; // hours
    return Math.round((route.distance_km / avgSpeed + loadingTime) * 10) / 10;
  };

  const optimizeRoutes = () => {
    // Sort routes by efficiency (distance vs capacity)
    const optimized = [...routes].sort((a, b) => {
      const efficiencyA = a.capacity_kg / (a.distance_km || 1);
      const efficiencyB = b.capacity_kg / (b.distance_km || 1);
      return efficiencyB - efficiencyA;
    });
    
    setRoutes(optimized);
    alert('Routes optimized by efficiency!');
  };

  const totalEnergy = routes.reduce((sum, r) => sum + (r.energy_cost_kwh || 0), 0);
  const avgPressureLoss = routes.length > 0 ? routes.reduce((sum, r) => sum + (r.pressure_loss_bar || 0), 0) / routes.length : 0;
  const activeRoutes = routes.filter((r) => r.status === 'in_transit');
  const totalCapacity = routes.reduce((sum, r) => sum + r.capacity_kg, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTransportIcon = (type: string) => {
    switch (type) {
      case 'pipeline': return '🔧';
      case 'tanker': return '🚛';
      case 'tube_trailer': return '🚚';
      default: return '📦';
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
      {/* Header */}
      <div className="flex items-center justify-between glassmorphic-strong rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">🚚 Hydrogen Transportation</h1>
          <p className="text-gray-700">Manage routes and monitor distribution efficiency</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={optimizeRoutes}
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Optimize Routes
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)} 
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-600" />
              Total Energy Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{formatNumber(totalEnergy, 0)} kWh</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-600" />
              Avg Pressure Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{formatNumber(avgPressureLoss, 1)} bar</p>
            <Progress value={Math.min(avgPressureLoss * 10, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Truck className="w-4 h-4 text-green-600" />
              Active Routes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{activeRoutes.length}</p>
            <p className="text-xs text-gray-600 mt-1">of {routes.length} total</p>
          </CardContent>
        </Card>

        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Total Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">{formatNumber(totalCapacity, 0)} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Route Efficiency Chart */}
      {routes.length > 0 && (
        <Card className="glassmorphic-strong border-2 border-white/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Route Efficiency Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routes.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="route_name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="energy_cost_kwh" fill="#3B82F6" name="Energy Cost (kWh)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="distance_km" fill="#10B981" name="Distance (km)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Transport Routes List */}
      <Card className="glassmorphic-strong border-2 border-white/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="w-5 h-5 text-orange-600" />
            Transport Routes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {routes.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No routes added yet</p>
              <p className="text-gray-400 text-sm mb-4">Click "Add Route" to create your first transportation route</p>
              <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Route
              </Button>
            </div>
          ) : (
            routes.map((route) => (
              <div key={route.id} className="p-5 rounded-xl border-2 border-white/40 bg-white/40 hover:bg-white/60 transition-all hover:shadow-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center flex-1">
                    <div className="text-3xl">{getTransportIcon(route.transport_type)}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">{route.route_name}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getStatusColor(route.status)}>
                          {route.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="info" className="text-xs">
                          {route.transport_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {route.status === 'scheduled' && (
                      <Button 
                        onClick={() => startDelivery(route)}
                        className="bg-green-600 text-white hover:bg-green-700"
                        size="sm"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Delivery
                      </Button>
                    )}
                    {route.status === 'in_transit' && (
                      <Button 
                        onClick={() => completeDelivery(route.id)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                      onClick={() => handleDeleteRoute(route.id)}
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{route.origin} → {route.destination}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span>{route.distance_km} km</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Package className="w-4 h-4 text-purple-600" />
                    <span>{formatNumber(route.current_load_kg || 0, 0)} / {formatNumber(route.capacity_kg, 0)} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>ETA: {calculateEstimatedTime(route)}h</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Zap className="w-4 h-4 text-yellow-600" />
                    <span>{route.energy_cost_kwh || 0} kWh</span>
                  </div>
                </div>
                
                {/* Progress bar for in-transit routes */}
                {route.status === 'in_transit' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Delivery Progress</span>
                      <span>{Math.round((route.current_load_kg / route.capacity_kg) * 100)}% loaded</span>
                    </div>
                    <Progress value={(route.current_load_kg / route.capacity_kg) * 100} className="h-2" />
                  </div>
                )}

                {route.pressure_loss_bar && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Pressure Loss: {route.pressure_loss_bar} bar</span>
                      <span>Added: {formatDate(route.created_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add Route Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Transport Route" className="glassmorphic-strong">
        <p className="text-sm text-gray-600 mb-2">
          Create a new hydrogen transportation route. Fill in the details below.
        </p>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <label htmlFor="route_name" className="text-sm font-medium text-gray-700">Route Name *</label>
            <Input
              id="route_name"
              placeholder="e.g., Plant A to Storage B"
              value={newRoute.route_name}
              onChange={(e) => setNewRoute({ ...newRoute, route_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="origin" className="text-sm font-medium text-gray-700">Origin *</label>
              <Input
                id="origin"
                placeholder="e.g., Production Facility"
                value={newRoute.origin}
                onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="destination" className="text-sm font-medium text-gray-700">Destination *</label>
              <Input
                id="destination"
                placeholder="e.g., Storage Site"
                value={newRoute.destination}
                onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Select
              value={newRoute.transport_type}
              onChange={(e) => setNewRoute({ ...newRoute, transport_type: e.target.value as TransportRoute['transport_type'] })}
              label="Transport Type *"
            >
              <option value="tube_trailer">🚚 Tube Trailer</option>
              <option value="tanker">🚛 Tanker</option>
              <option value="pipeline">🔧 Pipeline</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="distance_km" className="text-sm font-medium text-gray-700">Distance (km)</label>
              <Input
                id="distance_km"
                type="number"
                placeholder="120"
                value={newRoute.distance_km}
                onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="capacity_kg" className="text-sm font-medium text-gray-700">Capacity (kg)</label>
              <Input
                id="capacity_kg"
                type="number"
                placeholder="500"
                value={newRoute.capacity_kg}
                onChange={(e) => setNewRoute({ ...newRoute, capacity_kg: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label htmlFor="energy_cost_kwh" className="text-sm font-medium text-gray-700">Energy Cost (kWh)</label>
              <Input
                id="energy_cost_kwh"
                type="number"
                placeholder="800"
                value={newRoute.energy_cost_kwh}
                onChange={(e) => setNewRoute({ ...newRoute, energy_cost_kwh: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="pressure_loss_bar" className="text-sm font-medium text-gray-700">Pressure Loss (bar)</label>
              <Input
                id="pressure_loss_bar"
                type="number"
                step="0.1"
                placeholder="5.5"
                value={newRoute.pressure_loss_bar}
                onChange={(e) => setNewRoute({ ...newRoute, pressure_loss_bar: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setShowAddModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleAddRoute} className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white" disabled={saving}>
            {saving ? 'Adding...' : 'Add Route'}
          </Button>
        </div>
      </Modal>

      {/* Start Delivery Modal */}
      <Modal open={showDeliveryModal} onClose={() => setShowDeliveryModal(false)} title="Start Delivery" className="glassmorphic-strong">
        {selectedRoute && (
          <>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">{selectedRoute.route_name}</h4>
              <p className="text-sm text-blue-600">{selectedRoute.origin} → {selectedRoute.destination}</p>
            </div>
            
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Load Amount (kg) *</label>
                <Input
                  type="number"
                  placeholder={selectedRoute.capacity_kg.toString()}
                  value={deliveryDetails.load_kg}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, load_kg: e.target.value })}
                  max={selectedRoute.capacity_kg}
                />
                <p className="text-xs text-gray-500">Max capacity: {selectedRoute.capacity_kg} kg</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Priority Level</label>
                <Select
                  value={deliveryDetails.priority}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, priority: e.target.value as any })}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="normal">🟡 Normal Priority</option>
                  <option value="high">🟠 High Priority</option>
                  <option value="urgent">🔴 Urgent</option>
                </Select>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Estimated Time (hours)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={deliveryDetails.estimated_time}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, estimated_time: e.target.value })}
                />
                <p className="text-xs text-gray-500">Auto-calculated: {calculateEstimatedTime(selectedRoute)} hours</p>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Delivery Notes</label>
                <Input
                  placeholder="Special instructions, contact info, etc."
                  value={deliveryDetails.notes}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, notes: e.target.value })}
                />
              </div>

              {/* Route Optimization Suggestions */}
              <div className="p-3 bg-green-50 rounded-lg">
                <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Optimization Suggestions
                </h5>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Efficiency: {Math.round(selectedRoute.capacity_kg / selectedRoute.distance_km * 100) / 100} kg/km</li>
                  <li>• Energy cost: {Math.round((selectedRoute.energy_cost_kwh || 0) / selectedRoute.capacity_kg * 100) / 100} kWh/kg</li>
                  {selectedRoute.pressure_loss_bar && selectedRoute.pressure_loss_bar > 10 && (
                    <li className="text-amber-600">⚠️ High pressure loss detected - consider route optimization</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setShowDeliveryModal(false)} disabled={saving}>
                Cancel
              </Button>
              <Button 
                onClick={handleStartDelivery} 
                className="bg-green-600 text-white hover:bg-green-700" 
                disabled={saving || !deliveryDetails.load_kg}
              >
                {saving ? 'Starting...' : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Delivery
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
