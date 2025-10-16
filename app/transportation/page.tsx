'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Progress } from '@heroui/react';
import { Input } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Divider } from '@heroui/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Truck, MapPin, Plus, Trash2, Activity, Zap, Package, Route, Play, Pause, CheckCircle2, Clock, Navigation, TrendingUp, AlertTriangle, Timer, Fuel, Database } from 'lucide-react';
import { motion } from 'framer-motion';
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
  status: 'scheduled' | 'in_transit' | 'completed' | 'delayed' | 'delivered';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  energy_cost_kwh: number | null;
  pressure_loss_bar: number | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  progress_percent: number;
  fuel_efficiency: number | null;
  destination_storage_id?: string | null;
  pending_delivery_kg?: number;
  created_at: string;
  updated_at?: string;
};

type DeliveryMetrics = {
  totalRoutes: number;
  activeDeliveries: number;
  completedToday: number;
  averageEfficiency: number;
  totalDistance: number;
  carbonSaved: number;
};

export default function TransportationPage() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [metrics, setMetrics] = useState<DeliveryMetrics>({
    totalRoutes: 0,
    activeDeliveries: 0,
    completedToday: 0,
    averageEfficiency: 85.2,
    totalDistance: 0,
    carbonSaved: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; role?: string } | null>(null);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isDeliveryOpen, onOpen: onDeliveryOpen, onClose: onDeliveryClose } = useDisclosure();
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  
  const [newRoute, setNewRoute] = useState({
    route_name: '',
    origin: '',
    destination: '',
    transport_type: 'tube_trailer',
    distance_km: '',
    capacity_kg: '',
    priority: 'medium',
    energy_cost_kwh: '',
    pressure_loss_bar: ''
  });

  const [deliveryDetails, setDeliveryDetails] = useState({
    load_kg: '',
    estimated_time: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        // Get user profile to check role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, admin_status')
          .eq('id', currentUser.id)
          .single();
        
        setUser({ 
          ...currentUser, 
          role: profile?.role,
          admin_status: profile?.admin_status 
        });
        
        await loadRoutes();
        await loadMetrics();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoutes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('user_id', user.id)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add mock data for demo
      const enhancedRoutes = (data || []).map(route => ({
        ...route,
        priority: route.priority || 'medium',
        progress_percent: route.status === 'completed' ? 100 : 
                         route.status === 'in_transit' ? Math.floor(Math.random() * 80) + 10 : 0,
        fuel_efficiency: Math.floor(Math.random() * 20) + 80,
        estimated_arrival: route.estimated_arrival || new Date(Date.now() + Math.random() * 86400000 * 2).toISOString()
      }));

      setRoutes(enhancedRoutes);
    } catch (error) {
      console.error('Error loading routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: routesData } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('user_id', user.id);

      if (routesData) {
        const totalRoutes = routesData.length;
        const activeDeliveries = routesData.filter(r => r.status === 'in_transit').length;
        const completedToday = routesData.filter(r => 
          r.status === 'completed' && 
          new Date(r.updated_at || r.created_at).toDateString() === new Date().toDateString()
        ).length;
        const totalDistance = routesData.reduce((sum, r) => sum + (r.distance_km || 0), 0);
        const carbonSaved = totalDistance * 0.12; // kg CO2 saved per km

        setMetrics({
          totalRoutes,
          activeDeliveries,
          completedToday,
          averageEfficiency: 85.2,
          totalDistance,
          carbonSaved: Math.round(carbonSaved)
        });
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const calculateEnergyCost = (distance: number, capacity: number, transportType: string) => {
    // Energy cost calculation based on transport type and distance
    const energyFactors = {
      tube_trailer: 0.8, // kWh per km per kg capacity
      tanker: 1.2,
      pipeline: 0.3
    };
    
    const baseFactor = energyFactors[transportType as keyof typeof energyFactors] || 0.8;
    const energyCost = distance * capacity * baseFactor;
    
    return Math.round(energyCost);
  };

  const handleAddRoute = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const distance = parseFloat(newRoute.distance_km) || 0;
      const capacity = parseFloat(newRoute.capacity_kg) || 0;
      
      // Validate inputs
      if (!newRoute.route_name.trim()) {
        alert('Please enter a route name');
        return;
      }
      if (!newRoute.origin.trim()) {
        alert('Please enter an origin location');
        return;
      }
      if (!newRoute.destination.trim()) {
        alert('Please enter a destination location');
        return;
      }
      if (distance <= 0) {
        alert('Please enter a valid distance greater than 0');
        return;
      }
      if (capacity <= 0) {
        alert('Please enter a valid capacity greater than 0');
        return;
      }
      
      // Calculate energy cost automatically
      const calculatedEnergyCost = calculateEnergyCost(distance, capacity, newRoute.transport_type);
      
      // Calculate estimated travel time (assuming average speed of 60 km/h)
      const estimatedHours = distance / 60;
      const estimatedArrival = new Date(Date.now() + estimatedHours * 60 * 60 * 1000).toISOString();

      // Insert with correct column names matching database schema
      const { data, error } = await supabase
        .from('transport_routes')
        .insert([{
          user_id: user.id,
          route_name: newRoute.route_name,
          origin: newRoute.origin,
          destination: newRoute.destination,
          transport_type: newRoute.transport_type,
          distance_km: distance,
          capacity_kg: capacity,
          current_load_kg: 0,
          status: 'scheduled',
          estimated_arrival: estimatedArrival,
          energy_cost_kwh: calculatedEnergyCost,
          cost_per_kg_km: distance > 0 && capacity > 0 ? calculatedEnergyCost / (distance * capacity) : 0
        }])
        .select();

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If table doesn't exist, create mock data for demo
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          console.log('Transport routes table not found, using mock data for demo');
          const mockRoute = {
            id: Date.now().toString(),
            user_id: user.id,
            route_name: newRoute.route_name,
            origin: newRoute.origin,
            destination: newRoute.destination,
            transport_type: newRoute.transport_type,
            distance_km: distance,
            capacity_kg: capacity,
            status: 'scheduled',
            created_at: new Date().toISOString()
          };
          
          // Add to local state for demo purposes
          setRoutes(prev => [...prev, mockRoute as any]);
          
          setNewRoute({
            route_name: '',
            origin: '',
            destination: '',
            transport_type: 'tube_trailer',
            distance_km: '',
            capacity_kg: '',
            priority: 'medium',
            energy_cost_kwh: '',
            pressure_loss_bar: ''
          });
          onAddClose();
          loadMetrics();
          return;
        }
        
        throw error;
      }

      setNewRoute({
        route_name: '',
        origin: '',
        destination: '',
        transport_type: 'tube_trailer',
        distance_km: '',
        capacity_kg: '',
        priority: 'medium',
        energy_cost_kwh: '',
        pressure_loss_bar: ''
      });
      onAddClose();
      loadRoutes();
      loadMetrics();
    } catch (error) {
      console.error('Error adding route:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Show user-friendly error message
      alert('Failed to add route. Please check the console for details and try again.');
    } finally {
      setSaving(false);
    }
  };

  const startDelivery = async (route: TransportRoute) => {
    try {
      // Check if user is admin
      if (user?.role !== 'admin' || user?.admin_status !== 'active') {
        alert('Only authorized admins can start transport routes. Please contact an administrator.');
        return;
      }

      // Check if vehicle is filled (at least 70% capacity)
      const loadAmount = parseFloat(deliveryDetails.load_kg) || 0;
      const minLoad = route.capacity_kg * 0.7;
      
      if (loadAmount < minLoad) {
        alert(`Vehicle must be filled to at least 70% capacity (${minLoad} kg) before starting transport.`);
        return;
      }

      const { error } = await supabase
        .from('transport_routes')
        .update({ 
          status: 'in_transit',
          current_load_kg: loadAmount,
          vehicle_filled: true,
          progress_percent: 5,
          updated_at: new Date().toISOString()
        })
        .eq('id', route.id);

      if (error) throw error;
      
      onDeliveryClose();
      loadRoutes();
      loadMetrics();
    } catch (error) {
      console.error('Error starting delivery:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Show user-friendly error message
      alert('Failed to start delivery. Please check the console for details and try again.');
    }
  };

  const completeDelivery = async (routeId: string) => {
    try {
      // First, get the route details to update storage
      const { data: route, error: fetchError } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('id', routeId)
        .single();

      if (fetchError) {
        console.error('Error fetching route details:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        });
        throw fetchError;
      }

      // Update destination storage facility if there's a pending delivery
      if (route.destination_storage_id && route.pending_delivery_kg) {
        // First get current storage level
        const { data: storageData, error: storageGetError } = await supabase
          .from('storage_facilities')
          .select('current_level_kg')
          .eq('id', route.destination_storage_id)
          .single();

        if (storageGetError) {
          console.error('Error getting storage data:', storageGetError);
          throw storageGetError;
        }

        // Update with new level
        const newLevel = (storageData.current_level_kg || 0) + route.pending_delivery_kg;
        const { error: storageError } = await supabase
          .from('storage_facilities')
          .update({
            current_level_kg: newLevel,
            updated_at: new Date().toISOString()
          })
          .eq('id', route.destination_storage_id);

        if (storageError) {
          console.error('Error updating destination storage:', storageError);
          throw storageError;
        }

        console.log(`✅ Delivered ${route.pending_delivery_kg} kg H₂ to storage facility`);
      }

      // Update the route status to completed
      const { error: updateError } = await supabase
        .from('transport_routes')
        .update({ 
          status: 'completed',
          current_load_kg: 0, // Delivery completed, load is now 0
          destination_storage_id: null, // Clear destination
          pending_delivery_kg: 0, // Clear pending delivery
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);

      if (updateError) {
        console.error('Error updating route status:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          code: updateError.code
        });
        throw updateError;
      }

      console.log(`✅ Delivery completed successfully for route: ${route?.route_name || routeId}`);
      
      loadRoutes();
      loadMetrics();
    } catch (error) {
      console.error('Error completing delivery:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        routeId
      });
      
      // Show user-friendly error message
      alert('Failed to complete delivery. Please check the console for details and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'in_transit': return 'primary';
      case 'completed': return 'success';
      case 'delayed': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'default';
      case 'medium': return 'primary';
      case 'high': return 'warning';
      case 'urgent': return 'danger';
      default: return 'default';
    }
  };

  const formatETA = (eta: string | null) => {
    if (!eta) return 'TBD';
    const date = new Date(eta);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Soon';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  // Mock chart data
  const efficiencyData = [
    { month: 'Jan', efficiency: 82 },
    { month: 'Feb', efficiency: 85 },
    { month: 'Mar', efficiency: 88 },
    { month: 'Apr', efficiency: 86 },
    { month: 'May', efficiency: 90 },
    { month: 'Jun', efficiency: 87 }
  ];

  const deliveryData = [
    { day: 'Mon', completed: 12, scheduled: 15 },
    { day: 'Tue', completed: 15, scheduled: 18 },
    { day: 'Wed', completed: 18, scheduled: 20 },
    { day: 'Thu', completed: 14, scheduled: 16 },
    { day: 'Fri', completed: 20, scheduled: 22 },
    { day: 'Sat', completed: 8, scheduled: 10 },
    { day: 'Sun', completed: 6, scheduled: 8 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 max-w-md mx-auto">
          <CardBody className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to access transportation management features.</p>
            <Button 
              as="a" 
              href="/login" 
              color="primary"
              className="w-full"
            >
              Sign In
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🚛 Transportation Management</h1>
          <p className="text-gray-600 mt-1">Advanced delivery tracking and route optimization</p>
        </div>
        <Button 
          color="primary" 
          onPress={onAddOpen}
          startContent={<Plus className="w-4 h-4" />}
        >
          Add Route
        </Button>
      </motion.div>

      {/* Metrics Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalRoutes}</p>
                <p className="text-xs text-gray-600">Total Routes</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeDeliveries}</p>
                <p className="text-xs text-gray-600">Active</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.completedToday}</p>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageEfficiency}%</p>
                <p className="text-xs text-gray-600">Efficiency</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Navigation className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalDistance.toLocaleString()}</p>
                <p className="text-xs text-gray-600">km Total</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Fuel className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{metrics.carbonSaved}</p>
                <p className="text-xs text-gray-600">kg CO₂ Saved</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Route Efficiency Trends
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={efficiencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="efficiency" stroke="#3B82F6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Weekly Delivery Performance
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10B981" name="Completed" />
                  <Bar dataKey="scheduled" fill="#3B82F6" name="Scheduled" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Routes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Active Routes & Deliveries
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {routes.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No routes found. Create your first route to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {routes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <CardBody className="p-0">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{route.route_name}</h4>
                              <Chip size="sm" color={getStatusColor(route.status)}>
                                {route.status}
                              </Chip>
                              <Chip size="sm" color={getPriorityColor(route.priority)} variant="flat">
                                {route.priority}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {route.origin} → {route.destination}
                              </span>
                              <span>{route.distance_km} km</span>
                              <span>{route.transport_type?.replace('_', ' ') || 'N/A'}</span>
                            </div>
                            
                            {/* Vehicle Fill Level */}
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Vehicle Load</span>
                                <span>{route.current_load_kg || 0} / {route.capacity_kg} kg</span>
                              </div>
                              <Progress 
                                value={((route.current_load_kg || 0) / route.capacity_kg) * 100} 
                                color={
                                  ((route.current_load_kg || 0) / route.capacity_kg) >= 0.9 ? 'danger' :
                                  ((route.current_load_kg || 0) / route.capacity_kg) >= 0.7 ? 'warning' :
                                  'primary'
                                }
                                size="sm" 
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Fill Level: {(((route.current_load_kg || 0) / route.capacity_kg) * 100).toFixed(1)}%</span>
                                <span>Available: {route.capacity_kg - (route.current_load_kg || 0)} kg</span>
                              </div>
                            </div>
                            {route.status === 'in_transit' && (
                              <div className="mt-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Delivery Progress</span>
                                  <span>{route.progress_percent || 0}%</span>
                                </div>
                                <Progress value={route.progress_percent || 0} color="primary" size="sm" />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>🚚 In Transit</span>
                                  <span>ETA: {route.estimated_arrival ? new Date(route.estimated_arrival).toLocaleTimeString() : 'Calculating...'}</span>
                                </div>
                              </div>
                            )}

                            {/* Pending Delivery Indicator */}
                            {route.pending_delivery_kg && route.pending_delivery_kg > 0 && (
                              <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                                <div className="flex items-center gap-2 text-sm text-yellow-800">
                                  <span>📦</span>
                                  <span>Pending Delivery: {route.pending_delivery_kg} kg H₂</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right text-sm">
                              <p className="font-medium">{route.current_load_kg} / {route.capacity_kg} kg</p>
                              <p className="text-gray-500">ETA: {formatETA(route.estimated_arrival)}</p>
                            </div>
                            
                            <div className="flex gap-2">
                              {route.status === 'scheduled' && (
                                <Button
                                  size="sm"
                                  color={user?.role === 'admin' && user?.admin_status === 'active' ? 'primary' : 'default'}
                                  variant={user?.role === 'admin' && user?.admin_status === 'active' ? 'flat' : 'bordered'}
                                  onPress={() => {
                                    if (user?.role !== 'admin' || user?.admin_status !== 'active') {
                                      alert('Only authorized admins can start transport routes.');
                                      return;
                                    }
                                    setSelectedRoute(route);
                                    onDeliveryOpen();
                                  }}
                                  startContent={<Play className="w-4 h-4" />}
                                  isDisabled={user?.role !== 'admin' || user?.admin_status !== 'active'}
                                >
                                  {user?.role === 'admin' && user?.admin_status === 'active' ? 'Start' : 'Admin Only'}
                                </Button>
                              )}
                              {route.status === 'in_transit' && (
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="flat"
                                  onPress={() => completeDelivery(route.id)}
                                  startContent={<CheckCircle2 className="w-4 h-4" />}
                                >
                                  Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                color="danger"
                                variant="light"
                                isIconOnly
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Add Route Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          <ModalHeader>Add New Route</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Route Name"
                placeholder="e.g., Mumbai to Pune Express"
                value={newRoute.route_name}
                onChange={(e) => setNewRoute({ ...newRoute, route_name: e.target.value })}
              />
              <Select
                label="Transport Type"
                selectedKeys={[newRoute.transport_type]}
                onSelectionChange={(keys) => setNewRoute({ ...newRoute, transport_type: Array.from(keys)[0] as string })}
              >
                <SelectItem key="tube_trailer">Tube Trailer</SelectItem>
                <SelectItem key="tanker">Tanker</SelectItem>
                <SelectItem key="pipeline">Pipeline</SelectItem>
              </Select>
              <Input
                label="Origin"
                placeholder="Starting location"
                value={newRoute.origin}
                onChange={(e) => setNewRoute({ ...newRoute, origin: e.target.value })}
              />
              <Input
                label="Destination"
                placeholder="End location"
                value={newRoute.destination}
                onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
              />
              <Input
                label="Distance (km)"
                type="number"
                placeholder="0"
                value={newRoute.distance_km}
                onChange={(e) => setNewRoute({ ...newRoute, distance_km: e.target.value })}
              />
              <Input
                label="Capacity (kg)"
                type="number"
                placeholder="0"
                value={newRoute.capacity_kg}
                onChange={(e) => setNewRoute({ ...newRoute, capacity_kg: e.target.value })}
              />
            </div>
            
            {/* Energy Cost Preview */}
            {newRoute.distance_km && newRoute.capacity_kg && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <CardBody className="p-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-blue-900">Estimated Energy Cost</h4>
                      <p className="text-sm text-blue-700">
                        {calculateEnergyCost(
                          parseFloat(newRoute.distance_km), 
                          parseFloat(newRoute.capacity_kg), 
                          newRoute.transport_type
                        ).toLocaleString()} kWh
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Travel Time</p>
                      <p className="font-medium text-blue-800">
                        {Math.round(parseFloat(newRoute.distance_km) / 60 * 10) / 10} hours
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Priority"
                selectedKeys={[newRoute.priority]}
                onSelectionChange={(keys) => setNewRoute({ ...newRoute, priority: Array.from(keys)[0] as string })}
              >
                <SelectItem key="low">Low</SelectItem>
                <SelectItem key="medium">Medium</SelectItem>
                <SelectItem key="high">High</SelectItem>
                <SelectItem key="urgent">Urgent</SelectItem>
              </Select>
              <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  💡 Energy cost is automatically calculated based on distance, capacity, and transport type
                </p>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleAddRoute}
              isLoading={saving}
            >
              Add Route
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Start Delivery Modal */}
      <Modal isOpen={isDeliveryOpen} onClose={onDeliveryClose}>
        <ModalContent>
          <ModalHeader>Start Delivery</ModalHeader>
          <ModalBody>
            {selectedRoute && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{selectedRoute.route_name}</h4>
                  <p className="text-sm text-gray-600">{selectedRoute.origin} → {selectedRoute.destination}</p>
                </div>
                <Input
                  label="Load Amount (kg)"
                  type="number"
                  placeholder={`Max: ${selectedRoute.capacity_kg} kg`}
                  value={deliveryDetails.load_kg}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, load_kg: e.target.value })}
                />
                <Input
                  label="Estimated Time (hours)"
                  type="number"
                  placeholder="e.g., 4"
                  value={deliveryDetails.estimated_time}
                  onChange={(e) => setDeliveryDetails({ ...deliveryDetails, estimated_time: e.target.value })}
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeliveryClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={() => selectedRoute && startDelivery(selectedRoute)}
            >
              Start Delivery
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
