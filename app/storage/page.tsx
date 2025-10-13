'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Input } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Progress } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Divider } from '@heroui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Database, Plus, TrendingUp, Thermometer, Gauge, AlertTriangle, CheckCircle2, Edit, Trash2, MapPin, Calendar, ArrowUp, ArrowDown, Activity, Truck, Route, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser } from '@/lib/supabase';

type StorageFacility = {
  id: string;
  user_id: string;
  name: string;
  location: string;
  storage_type: 'compressed' | 'liquid' | 'metal_hydride' | 'underground';
  capacity_kg: number;
  current_level_kg: number;
  pressure_bar: number;
  temperature_celsius: number;
  status: string;
  created_at: string;
};

type ProductionFacility = {
  id: string;
  name: string;
  location: string;
  capacity_kg_per_day: number;
  current_production_kg: number;
  status: string;
};

type TransportRoute = {
  id: string;
  route_name: string;
  transport_type: string;
  capacity_kg: number;
  current_load_kg: number;
  status: string;
  distance_km: number;
  energy_cost_kwh: number;
};

export default function StoragePage() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<StorageFacility[]>([]);
  const [productionFacilities, setProductionFacilities] = useState<ProductionFacility[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [alerts, setAlerts] = useState<Array<{id: string; type: 'warning' | 'error' | 'info'; message: string}>>([]);
  
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  const [newFacility, setNewFacility] = useState({
    name: '',
    location: '',
    storage_type: 'compressed',
    capacity_kg: '',
    pressure_bar: '350',
    temperature_celsius: '20'
  });

  const [transferData, setTransferData] = useState({
    fromFacilityId: '',
    toStorageId: '',
    amount: '',
    priority: 'medium',
    selectedRouteId: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { user: currentUser } = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load storage facilities
        const { data: storageData } = await supabase
          .from('storage_facilities')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        // Load production facilities
        const { data: productionData } = await supabase
          .from('production_facilities')
          .select('*')
          .eq('user_id', currentUser.id);

        // Load transport routes
        const { data: routesData } = await supabase
          .from('transport_routes')
          .select('*')
          .eq('user_id', currentUser.id);

        setFacilities(storageData || []);
        setProductionFacilities(productionData || []);
        setTransportRoutes(routesData || []);

        // Check for capacity alerts
        checkCapacityAlerts(storageData || [], productionData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCapacityAlerts = (storageFacilities: StorageFacility[], productionFacilities: ProductionFacility[]) => {
    const newAlerts: Array<{id: string; type: 'warning' | 'error' | 'info'; message: string}> = [];

    // Check storage capacity alerts
    storageFacilities.forEach(facility => {
      const utilization = (facility.current_level_kg / facility.capacity_kg) * 100;
      
      if (utilization >= 95) {
        newAlerts.push({
          id: `storage-full-${facility.id}`,
          type: 'error',
          message: `${facility.name}: Storage 95% full (${Math.round(utilization)}%) - Urgent action required!`
        });
      } else if (utilization >= 80) {
        newAlerts.push({
          id: `storage-high-${facility.id}`,
          type: 'warning',
          message: `${facility.name}: Storage ${Math.round(utilization)}% full - Consider transport to other facilities`
        });
      }
    });

    // Check production facility alerts (simulated daily production)
    productionFacilities.forEach(facility => {
      if (facility.status === 'operational') {
        // Simulate current production level (0-100% of daily capacity)
        const currentProduction = Math.random() * (facility.capacity_kg_per_day || 0);
        const productionPercent = (currentProduction / (facility.capacity_kg_per_day || 1)) * 100;
        
        if (productionPercent >= 90) {
          newAlerts.push({
            id: `production-full-${facility.id}`,
            type: 'warning',
            message: `${facility.name}: Daily production 90% complete - Assign storage and transport soon!`
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  const handleAddFacility = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('storage_facilities')
        .insert([{
          user_id: user.id,
          name: newFacility.name,
          location: newFacility.location,
          storage_type: newFacility.storage_type,
          capacity_kg: parseFloat(newFacility.capacity_kg),
          current_level_kg: 0,
          pressure_bar: parseFloat(newFacility.pressure_bar),
          temperature_celsius: parseFloat(newFacility.temperature_celsius),
          status: 'operational'
        }]);

      if (error) throw error;

      setNewFacility({
        name: '',
        location: '',
        storage_type: 'compressed',
        capacity_kg: '',
        pressure_bar: '350',
        temperature_celsius: '20'
      });
      onAddClose();
      loadData();
    } catch (error) {
      console.error('Error adding facility:', error);
    }
  };

  const getAvailableRoutes = (fromLocation: string, toLocation: string, requiredCapacity: number) => {
    return transportRoutes.filter(route => {
      const availableCapacity = route.capacity_kg - route.current_load_kg;
      const isAvailable = route.status === 'scheduled' || route.status === 'completed';
      
      // For high/urgent priority, allow override of capacity
      const canOverride = transferData.priority === 'high' || transferData.priority === 'urgent';
      
      return isAvailable && (availableCapacity >= requiredCapacity || canOverride);
    });
  };

  const handleTransfer = async () => {
    if (!user) return;

    try {
      const amount = parseFloat(transferData.amount);
      const selectedRoute = transportRoutes.find(r => r.id === transferData.selectedRouteId);
      const fromFacility = productionFacilities.find(f => f.id === transferData.fromFacilityId);
      const toStorage = facilities.find(f => f.id === transferData.toStorageId);

      if (!selectedRoute || !fromFacility || !toStorage) {
        alert('Please select all required fields');
        return;
      }

      // Check capacity constraints
      const routeAvailableCapacity = selectedRoute.capacity_kg - selectedRoute.current_load_kg;
      const storageAvailableCapacity = toStorage.capacity_kg - toStorage.current_level_kg;
      const canOverride = transferData.priority === 'high' || transferData.priority === 'urgent';

      if (amount > routeAvailableCapacity && !canOverride) {
        alert(`Route capacity exceeded! Available: ${routeAvailableCapacity} kg, Requested: ${amount} kg. Use High/Urgent priority to override.`);
        return;
      }

      if (amount > storageAvailableCapacity) {
        alert(`Storage capacity exceeded! Available: ${storageAvailableCapacity} kg, Requested: ${amount} kg`);
        return;
      }

      // Calculate transport time and energy
      const estimatedHours = selectedRoute.distance_km / 60; // 60 km/h average
      const estimatedArrival = new Date(Date.now() + estimatedHours * 60 * 60 * 1000);

      // Update transport route
      await supabase
        .from('transport_routes')
        .update({
          route_name: `${fromFacility.name} → ${toStorage.name}`,
          origin: fromFacility.location,
          destination: toStorage.location,
          current_load_kg: selectedRoute.current_load_kg + amount,
          status: 'in_transit',
          estimated_arrival: estimatedArrival.toISOString(),
          priority: transferData.priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedRoute.id);

      // Reserve storage space
      await supabase
        .from('storage_facilities')
        .update({
          current_level_kg: toStorage.current_level_kg + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', toStorage.id);

      // Add success alert
      setAlerts(prev => [...prev, {
        id: `transfer-${Date.now()}`,
        type: 'info',
        message: `✅ Transfer initiated: ${amount} kg H₂ from ${fromFacility.name} to ${toStorage.name} via ${selectedRoute.route_name} (${transferData.priority} priority)`
      }]);

      setTransferData({
        fromFacilityId: '',
        toStorageId: '',
        amount: '',
        priority: 'medium',
        selectedRouteId: '',
        notes: ''
      });
      onTransferClose();
      loadData();

    } catch (error) {
      console.error('Error initiating transfer:', error);
    }
  };

  const getStorageColor = (utilization: number) => {
    if (utilization >= 90) return 'danger';
    if (utilization >= 70) return 'warning';
    if (utilization >= 50) return 'primary';
    return 'success';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner" />
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
          <h1 className="text-3xl font-bold text-gray-900">🏪 Storage Management</h1>
          <p className="text-gray-600 mt-1">Monitor storage levels, manage transfers, and optimize logistics</p>
        </div>
        <div className="flex gap-3">
          <Button 
            color="secondary" 
            variant="flat"
            onPress={onTransferOpen}
            startContent={<Truck className="w-4 h-4" />}
          >
            Transfer H₂
          </Button>
          <Button 
            color="primary" 
            onPress={onAddOpen}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Storage
          </Button>
        </div>
      </motion.div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-4 ${
              alert.type === 'error' ? 'bg-red-50 border-red-200' : 
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <CardBody className="p-0">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'error' ? 'text-red-600' : 
                    alert.type === 'warning' ? 'text-yellow-600' : 
                    'text-blue-600'
                  }`} />
                  <p className={`text-sm font-medium ${
                    alert.type === 'error' ? 'text-red-800' : 
                    alert.type === 'warning' ? 'text-yellow-800' : 
                    'text-blue-800'
                  }`}>
                    {alert.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </motion.div>
      )}

      {/* Storage Facilities Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Storage Facilities
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {facilities.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No storage facilities found. Add your first facility to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((facility, index) => {
                  const utilization = (facility.current_level_kg / facility.capacity_kg) * 100;
                  return (
                    <motion.div
                      key={facility.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card className="p-4 hover:shadow-lg transition-shadow">
                        <CardBody className="p-0">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                            <Chip size="sm" color={getStorageColor(utilization)}>
                              {Math.round(utilization)}%
                            </Chip>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Storage Level</span>
                                <span>{facility.current_level_kg.toLocaleString()} / {facility.capacity_kg.toLocaleString()} kg</span>
                              </div>
                              <Progress 
                                value={utilization} 
                                color={getStorageColor(utilization)} 
                                size="sm" 
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                              <span>📍 {facility.location}</span>
                              <span>🏷️ {facility.storage_type}</span>
                              <span>🔧 {facility.pressure_bar} bar</span>
                              <span>🌡️ {facility.temperature_celsius}°C</span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Add Storage Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          <ModalHeader>Add New Storage Facility</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facility Name"
                placeholder="e.g., Mumbai Storage Hub"
                value={newFacility.name}
                onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
              />
              <Input
                label="Location"
                placeholder="e.g., Mumbai, India"
                value={newFacility.location}
                onChange={(e) => setNewFacility({ ...newFacility, location: e.target.value })}
              />
              <Select
                label="Storage Type"
                selectedKeys={[newFacility.storage_type]}
                onSelectionChange={(keys) => setNewFacility({ ...newFacility, storage_type: Array.from(keys)[0] as string })}
              >
                <SelectItem key="compressed">Compressed Gas</SelectItem>
                <SelectItem key="liquid">Liquid H₂</SelectItem>
                <SelectItem key="metal_hydride">Metal Hydride</SelectItem>
                <SelectItem key="underground">Underground</SelectItem>
              </Select>
              <Input
                label="Capacity (kg)"
                type="number"
                placeholder="e.g., 10000"
                value={newFacility.capacity_kg}
                onChange={(e) => setNewFacility({ ...newFacility, capacity_kg: e.target.value })}
              />
              <Input
                label="Pressure (bar)"
                type="number"
                placeholder="e.g., 350"
                value={newFacility.pressure_bar}
                onChange={(e) => setNewFacility({ ...newFacility, pressure_bar: e.target.value })}
              />
              <Input
                label="Temperature (°C)"
                type="number"
                placeholder="e.g., 20"
                value={newFacility.temperature_celsius}
                onChange={(e) => setNewFacility({ ...newFacility, temperature_celsius: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddFacility}>
              Add Storage Facility
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Transfer H₂ Modal */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose} size="3xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Transfer Hydrogen with Route Selection
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="From Production Facility"
                  selectedKeys={transferData.fromFacilityId ? [transferData.fromFacilityId] : []}
                  onSelectionChange={(keys) => setTransferData({...transferData, fromFacilityId: Array.from(keys)[0] as string})}
                  placeholder="Select production facility"
                >
                  {productionFacilities.map((facility) => {
                    // Simulate current production level (0-100% of daily capacity)
                    const currentProduction = Math.floor(Math.random() * (facility.capacity_kg_per_day || 0));
                    const productionPercent = ((currentProduction / (facility.capacity_kg_per_day || 1)) * 100).toFixed(1);
                    
                    return (
                      <SelectItem key={facility.id}>
                        {facility.name} - {currentProduction} kg available ({productionPercent}% of daily capacity)
                      </SelectItem>
                    );
                  })}
                </Select>
                
                <Select
                  label="To Storage Facility"
                  selectedKeys={transferData.toStorageId ? [transferData.toStorageId] : []}
                  onSelectionChange={(keys) => setTransferData({...transferData, toStorageId: Array.from(keys)[0] as string})}
                  placeholder="Select storage facility"
                >
                  {facilities.map((facility) => {
                    const available = facility.capacity_kg - facility.current_level_kg;
                    const utilization = ((facility.current_level_kg / facility.capacity_kg) * 100).toFixed(1);
                    return (
                      <SelectItem key={facility.id}>
                        {facility.name} - {available.toLocaleString()} kg available ({utilization}% full)
                      </SelectItem>
                    );
                  })}
                </Select>
                
                <Input
                  label="Amount (kg)"
                  type="number"
                  placeholder="e.g., 1000"
                  value={transferData.amount}
                  onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                />
                
                <Select
                  label="Priority"
                  selectedKeys={[transferData.priority]}
                  onSelectionChange={(keys) => setTransferData({...transferData, priority: Array.from(keys)[0] as string})}
                >
                  <SelectItem key="low">Low</SelectItem>
                  <SelectItem key="medium">Medium</SelectItem>
                  <SelectItem key="high">High (Override Capacity)</SelectItem>
                  <SelectItem key="urgent">Urgent (Override Capacity)</SelectItem>
                </Select>
              </div>

              {/* Production Status Display */}
              {transferData.fromFacilityId && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📊 Production Status</h4>
                  {(() => {
                    const selectedFacility = productionFacilities.find(f => f.id === transferData.fromFacilityId);
                    if (!selectedFacility) return null;
                    
                    const currentProduction = Math.floor(Math.random() * (selectedFacility.capacity_kg_per_day || 0));
                    const productionPercent = ((currentProduction / (selectedFacility.capacity_kg_per_day || 1)) * 100);
                    
                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Facility:</span>
                          <p className="font-medium text-blue-900">{selectedFacility.name}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Available H₂:</span>
                          <p className="font-medium text-green-600">{currentProduction} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Daily Progress:</span>
                          <p className="font-medium text-blue-600">{productionPercent.toFixed(1)}%</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <p className={`font-medium ${
                            productionPercent >= 90 ? 'text-red-600' : 
                            productionPercent >= 70 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {productionPercent >= 90 ? 'Urgent Transfer Needed' : 
                             productionPercent >= 70 ? 'Plan Transfer Soon' : 
                             'Normal Operation'}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Route Selection */}
              {transferData.fromFacilityId && transferData.toStorageId && transferData.amount && (
                <div>
                  <h4 className="font-semibold mb-3">Select Transport Route:</h4>
                  <div className="space-y-3">
                    {getAvailableRoutes('', '', parseFloat(transferData.amount) || 0).map((route) => {
                      const availableCapacity = route.capacity_kg - route.current_load_kg;
                      const requiredAmount = parseFloat(transferData.amount) || 0;
                      const canOverride = transferData.priority === 'high' || transferData.priority === 'urgent';
                      const isCapacityExceeded = requiredAmount > availableCapacity;
                      
                      return (
                        <Card 
                          key={route.id} 
                          className={`p-4 cursor-pointer transition-all ${
                            transferData.selectedRouteId === route.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          } ${isCapacityExceeded && !canOverride ? 'opacity-50' : ''}`}
                          isPressable
                          onPress={() => setTransferData({...transferData, selectedRouteId: route.id})}
                        >
                          <CardBody className="p-0">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h5 className="font-medium">{route.route_name || `Route ${route.id.slice(0, 8)}`}</h5>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                  <span>🚛 {route.transport_type.replace('_', ' ')}</span>
                                  <span>📏 {route.distance_km} km</span>
                                  <span>⚡ {route.energy_cost_kwh} kWh</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm">
                                  <span className={`font-medium ${isCapacityExceeded && !canOverride ? 'text-red-600' : 'text-green-600'}`}>
                                    {availableCapacity.toLocaleString()} kg available
                                  </span>
                                </div>
                                {isCapacityExceeded && canOverride && (
                                  <Chip size="sm" color="warning" className="mt-1">
                                    Priority Override
                                  </Chip>
                                )}
                                {isCapacityExceeded && !canOverride && (
                                  <Chip size="sm" color="danger" className="mt-1">
                                    Capacity Exceeded
                                  </Chip>
                                )}
                              </div>
                            </div>
                            
                            {/* Vehicle Load Progress Bar */}
                            <div>
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Current Load</span>
                                <span>{route.current_load_kg} / {route.capacity_kg} kg</span>
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
                              <div className="text-xs text-gray-500 mt-1">
                                Fill Level: {(((route.current_load_kg || 0) / route.capacity_kg) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {getAvailableRoutes('', '', parseFloat(transferData.amount) || 0).length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Truck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No available routes found for this transfer.</p>
                      <p className="text-sm">Try reducing the amount or using High/Urgent priority.</p>
                    </div>
                  )}
                </div>
              )}
              
              <Input
                label="Notes (Optional)"
                placeholder="Additional transfer notes..."
                value={transferData.notes}
                onChange={(e) => setTransferData({...transferData, notes: e.target.value})}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onTransferClose}>
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleTransfer}
              isDisabled={!transferData.fromFacilityId || !transferData.toStorageId || !transferData.amount || !transferData.selectedRouteId}
            >
              Initiate Transfer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
