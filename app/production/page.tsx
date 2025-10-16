'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Input } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Progress } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { Factory, Plus, TrendingUp, Zap, Droplets, Activity, Edit, Trash2, Calculator, AlertTriangle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser, ProductionFacility, ProductionRecord } from '@/lib/supabase';

export default function ProductionPage() {
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<ProductionFacility[]>([]);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isLCOHOpen, onOpen: onLCOHOpen, onClose: onLCOHClose } = useDisclosure();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [alerts, setAlerts] = useState<Array<{id: string; type: 'warning' | 'error'; message: string}>>([]);

  const [newFacility, setNewFacility] = useState({
    name: '',
    location: '',
    electrolyzer_type: 'PEM',
    capacity_kg_per_day: '',
    efficiency_percent: '70'
  });

  const [lcohInputs, setLcohInputs] = useState({
    facilityId: '',
    electricityCost: '0.08',
    waterCost: '0.002',
    maintenanceCost: '0.02',
    capitalCost: '1000000',
    operatingYears: '20'
  });

  const [lcohResult, setLcohResult] = useState<number | null>(null);
  const [dailyProduction, setDailyProduction] = useState<{[key: string]: number}>({});
  const [dailyTargets, setDailyTargets] = useState<any[]>([]);

  useEffect(() => {
    loadData();
    // Auto-generate daily production every 24 hours
    const interval = setInterval(generateDailyProduction, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (facilities.length > 0) {
      generateDailyProduction();
    }
  }, [facilities]);

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
        checkPerformanceAlerts(facilitiesData || []);

        if (facilitiesData && facilitiesData.length > 0) {
          const { data: recordsData, error: recordsError } = await supabase
            .from('production_records')
            .select('*')
            .eq('facility_id', facilitiesData[0].id)
            .order('production_date', { ascending: false })
            .limit(30);

          if (recordsError) throw recordsError;
          setProductionRecords(recordsData || []);
        }

        // Load daily production targets
        const response = await fetch('/api/production/daily-targets');
        if (response.ok) {
          const targetsData = await response.json();
          setDailyTargets(targetsData || []);
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
          approval_status: 'pending', // All new facilities need approval
          name: newFacility.name,
          location: newFacility.location,
          electrolyzer_type: newFacility.electrolyzer_type,
          capacity_kg_per_day: parseFloat(newFacility.capacity_kg_per_day),
          efficiency_percent: parseFloat(newFacility.efficiency_percent),
          status: 'operational',
          commissioned_date: new Date().toISOString().split('T')[0]
        }])
        .select();

      if (error) throw error;

      const updatedFacilities = [...facilities, data[0]];
      setFacilities(updatedFacilities);
      onAddClose();
      setNewFacility({
        name: '',
        location: '',
        electrolyzer_type: 'PEM',
        capacity_kg_per_day: '',
        efficiency_percent: '70'
      });
      checkPerformanceAlerts(updatedFacilities);
    } catch (error) {
      console.error('Error adding facility:', error);
    }
  };

  const calculateLCOH = () => {
    const facility = facilities.find(f => f.id === lcohInputs.facilityId);
    if (!facility) return;

    const electricityCost = parseFloat(lcohInputs.electricityCost);
    const waterCost = parseFloat(lcohInputs.waterCost);
    const maintenanceCost = parseFloat(lcohInputs.maintenanceCost);
    const capitalCost = parseFloat(lcohInputs.capitalCost);
    const operatingYears = parseFloat(lcohInputs.operatingYears);

    // Energy consumption per kg H2 (kWh/kg)
    const energyPerKg = 50 / ((facility.efficiency_percent || 70) / 100);
    
    // Water consumption per kg H2 (L/kg)
    const waterPerKg = 12;

    // Annual production (kg/year)
    const annualProduction = (facility.capacity_kg_per_day || 0) * 365 * 0.9;

    // Operating costs per year
    const annualElectricityCost = annualProduction * energyPerKg * electricityCost;
    const annualWaterCost = annualProduction * waterPerKg * waterCost;
    const annualMaintenanceCost = capitalCost * maintenanceCost;

    const totalAnnualCost = annualElectricityCost + annualWaterCost + annualMaintenanceCost;
    
    // Levelized cost calculation
    const discountRate = 0.08;
    const presentValueFactor = (1 - Math.pow(1 + discountRate, -operatingYears)) / discountRate;
    const annualizedCapitalCost = capitalCost / presentValueFactor;

    const totalAnnualizedCost = totalAnnualCost + annualizedCapitalCost;
    const lcoh = totalAnnualizedCost / annualProduction;

    setLcohResult(lcoh);
  };

  const generateDailyProduction = async () => {
    if (!user || facilities.length === 0) return;

    const today = new Date().toISOString().split('T')[0];
    const newDailyProduction: {[key: string]: number} = {};

    // Get available renewable energy for today
    const { data: renewableSources } = await supabase
      .from('renewable_sources')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active');

    // Calculate total available energy from renewable sources
    let totalAvailableEnergy = 0;
    if (renewableSources) {
      for (const source of renewableSources) {
        // Simulate daily energy production based on capacity and weather
        const weatherFactor = 0.7 + Math.random() * 0.6; // 70-130% weather variation
        const dailyEnergy = (source.capacity_mw || 0) * 24 * (source.efficiency_percent || 25) / 100 * weatherFactor;
        totalAvailableEnergy += dailyEnergy;
      }
    }

    console.log(`Total available renewable energy today: ${Math.round(totalAvailableEnergy)} kWh`);

    for (const facility of facilities) {
      // Check if production already exists for today
      const { data: existingRecord } = await supabase
        .from('production_records')
        .select('id')
        .eq('facility_id', facility.id)
        .eq('production_date', today)
        .single();

      if (!existingRecord) {
        const efficiency = (facility.efficiency_percent || 70) / 100;
        const maxCapacity = (facility.capacity_kg_per_day || 0);
        
        // Energy required for max production (kWh/kg H2)
        const energyPerKg = 50 / efficiency;
        const energyRequired = maxCapacity * energyPerKg;
        
        // Limit production based on available renewable energy
        const energyAvailableForFacility = totalAvailableEnergy / facilities.length; // Distribute equally
        const maxH2FromEnergy = energyAvailableForFacility / energyPerKg;
        
        // Actual production is limited by both capacity and available energy
        const capacityFactor = 0.8 + Math.random() * 0.15; // 80-95%
        const dailyH2 = Math.min(maxCapacity * capacityFactor, maxH2FromEnergy);
        
        // Calculate water consumption and carbon offset
        const waterPerKg = 12; // L/kg H2
        const energyUsed = dailyH2 * energyPerKg;
        const waterUsed = dailyH2 * waterPerKg;
        const carbonOffset = dailyH2 * 9.3; // kg CO2 offset per kg H2
        
        // Alert if production is limited by energy availability
        if (maxH2FromEnergy < maxCapacity * capacityFactor) {
          console.warn(`${facility.name}: Production limited by renewable energy availability`);
        }

        // Insert production record
        const { error } = await supabase
          .from('production_records')
          .insert([{
            facility_id: facility.id,
            production_date: today,
            hydrogen_produced_kg: Math.round(dailyH2),
            energy_consumed_kwh: Math.round(energyUsed),
            water_consumed_liters: Math.round(waterUsed),
            carbon_offset_kg: Math.round(carbonOffset),
            efficiency_percent: Math.round(efficiency * 100 * 10) / 10,
            operating_hours: 20 + Math.random() * 4, // 20-24 hours
            notes: `Auto-generated daily production - ${capacityFactor > 0.9 ? 'Excellent' : capacityFactor > 0.85 ? 'Good' : 'Average'} performance`
          }]);

        if (!error) {
          newDailyProduction[facility.id] = Math.round(dailyH2);
        }
      }
    }

    setDailyProduction(prev => ({...prev, ...newDailyProduction}));
    
    // Trigger transport assignment for new production
    if (Object.keys(newDailyProduction).length > 0) {
      await assignTransportForProduction(newDailyProduction);
    }
  };

  const assignTransportForProduction = async (production: {[key: string]: number}) => {
    if (!user) return;

    // Get available storage facilities with actual capacity
    const { data: storageFacilities } = await supabase
      .from('storage_facilities')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'operational');

    // Get available transport vehicles
    const { data: vehicles } = await supabase
      .from('transport_routes')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'scheduled');

    if (!storageFacilities || !vehicles) {
      console.log('No storage facilities or vehicles available for transport');
      return;
    }

    for (const [facilityId, h2Amount] of Object.entries(production)) {
      const facility = facilities.find(f => f.id === facilityId);
      if (!facility || h2Amount <= 0) continue;

      // Find storage with sufficient available capacity
      const availableStorage = storageFacilities.find(storage => {
        const availableCapacity = (storage.capacity_kg || 0) - (storage.current_level_kg || 0);
        return availableCapacity >= h2Amount;
      });

      if (availableStorage && vehicles.length > 0) {
        const vehicle = vehicles[0]; // Use first available vehicle

        console.log(`Assigning transport: ${h2Amount} kg H2 from ${facility.name} to ${availableStorage.name}`);

        // Create transport assignment
        const { error: transportError } = await supabase
          .from('transport_routes')
          .update({
            route_name: `${facility.name} → ${availableStorage.name}`,
            origin: facility.location || facility.name,
            destination: availableStorage.location || availableStorage.name,
            current_load_kg: h2Amount,
            status: 'in_transit',
            estimated_arrival: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', vehicle.id);

        if (!transportError) {
          // Reserve space in storage facility
          await supabase
            .from('storage_facilities')
            .update({
              current_level_kg: (availableStorage.current_level_kg || 0) + h2Amount,
              updated_at: new Date().toISOString()
            })
            .eq('id', availableStorage.id);

          console.log(`✅ Transport assigned successfully: ${h2Amount} kg H2`);
        } else {
          console.error('Failed to assign transport:', transportError);
        }
      } else {
        console.warn(`⚠️ No available storage or transport for ${h2Amount} kg H2 from ${facility.name}`);
        
        // Add alert for insufficient storage
        setAlerts(prev => [...prev, {
          id: `storage-${facilityId}-${Date.now()}`,
          type: 'warning',
          message: `${facility.name}: Produced ${Math.round(h2Amount)} kg H2 but no storage capacity available`
        }]);
      }
    }
  };

  const updateDailyTarget = async (facilityId: string, actualProduction: number) => {
    try {
      await fetch('/api/production/daily-targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facility_id: facilityId,
          actual_production_kg: actualProduction
        })
      });
    } catch (error) {
      console.error('Error updating daily target:', error);
    }
  };

  const checkPerformanceAlerts = (facilitiesList: ProductionFacility[]) => {
    const newAlerts: Array<{id: string; type: 'warning' | 'error'; message: string}> = [];
    
    facilitiesList.forEach(facility => {
      const efficiency = facility.efficiency_percent || 0;
      const capacity = facility.capacity_kg_per_day || 0;

      if (efficiency < 65) {
        newAlerts.push({
          id: `eff-${facility.id}`,
          type: 'warning',
          message: `${facility.name}: Low efficiency (${efficiency}%)`
        });
      }
      
      if (capacity < 100) {
        newAlerts.push({
          id: `cap-${facility.id}`,
          type: 'warning',
          message: `${facility.name}: Low daily capacity (${capacity} kg/day)`
        });
      }
    });

    setAlerts(newAlerts);
  };

  const handleDeleteFacility = async (facilityId: string) => {
    try {
      const { error } = await supabase
        .from('production_facilities')
        .delete()
        .eq('id', facilityId);

      if (error) throw error;
      const updatedFacilities = facilities.filter(f => f.id !== facilityId);
      setFacilities(updatedFacilities);
      checkPerformanceAlerts(updatedFacilities);
    } catch (error) {
      console.error('Error deleting facility:', error);
    }
  };

  // Mock chart data
  const productionTrends = [
    { date: 'Mon', production: 450, efficiency: 68, target: 500 },
    { date: 'Tue', production: 480, efficiency: 69, target: 500 },
    { date: 'Wed', production: 520, efficiency: 70, target: 500 },
    { date: 'Thu', production: 495, efficiency: 69, target: 500 },
    { date: 'Fri', production: 540, efficiency: 71, target: 500 },
    { date: 'Sat', production: 565, efficiency: 71, target: 500 },
    { date: 'Sun', production: 590, efficiency: 72, target: 500 }
  ];

  const electrolyzerComparison = [
    { type: 'PEM', current: 68, target: 70, optimal: 75 },
    { type: 'Alkaline', current: 62, target: 65, optimal: 68 },
    { type: 'SOEC', current: 85, target: 88, optimal: 90 }
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
            <p className="text-gray-600 mb-6">Please sign in to access production management features.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">🏭 Production Management</h1>
          <p className="text-gray-600 mt-1">Monitor facilities, calculate LCOH, and optimize production</p>
        </div>
        <div className="flex gap-3">
          <Button 
            color="success" 
            variant="flat"
            onPress={generateDailyProduction}
            startContent={<Activity className="w-4 h-4" />}
          >
            Generate Today's H₂
          </Button>
          <Button 
            color="secondary" 
            variant="flat"
            onPress={onLCOHOpen}
            startContent={<Calculator className="w-4 h-4" />}
          >
            LCOH Calculator
          </Button>
          <Button 
            color="primary" 
            onPress={onAddOpen}
            startContent={<Plus className="w-4 h-4" />}
          >
            Add Facility
          </Button>
        </div>
      </motion.div>

      {/* Performance Alerts */}
      {alerts.length > 0 && (
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {alerts.map((alert) => (
            <Card key={alert.id} className={`p-4 ${alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <CardBody className="p-0">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${alert.type === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
                  <p className={`text-sm font-medium ${alert.type === 'error' ? 'text-red-800' : 'text-yellow-800'}`}>
                    {alert.message}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
        </motion.div>
      )}

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Factory className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{facilities.length}</p>
                <p className="text-xs text-gray-600">Active Facilities</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {facilities.length > 0 ? Math.round(facilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0) / facilities.length) : 0}%
                </p>
                <p className="text-xs text-gray-600">Avg Efficiency</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {facilities.reduce((sum, f) => sum + (f.capacity_kg_per_day || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">kg/day Capacity</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{productionRecords.length}</p>
                <p className="text-xs text-gray-600">Production Records</p>
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
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Production Trends (7 Days)
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={productionTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="production" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-600" />
                Electrolyzer Efficiency Comparison
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={electrolyzerComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="type" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="current" fill="#3B82F6" name="Current" />
                  <Bar dataKey="target" fill="#10B981" name="Target" />
                  <Bar dataKey="optimal" fill="#F59E0B" name="Optimal" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Facilities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Factory className="w-5 h-5 text-purple-600" />
              Production Facilities
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            {facilities.length === 0 ? (
              <div className="text-center py-12">
                <Factory className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No facilities found. Add your first facility to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {facilities.map((facility, index) => (
                  <motion.div
                    key={facility.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="p-4 hover:shadow-lg transition-shadow">
                      <CardBody className="p-0">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900">{facility.name}</h4>
                              <Chip size="sm" color="success">
                                {facility.status}
                              </Chip>
                              <Chip size="sm" color="primary" variant="flat">
                                {facility.electrolyzer_type}
                              </Chip>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <span>📍 {facility.location}</span>
                              <span>⚡ {facility.efficiency_percent}% efficiency</span>
                              <span>🏭 {facility.capacity_kg_per_day} kg/day</span>
                              <span>📅 {facility.commissioned_date}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              color="primary"
                              variant="flat"
                              onPress={() => {
                                setLcohInputs({...lcohInputs, facilityId: facility.id});
                                onLCOHOpen();
                              }}
                              startContent={<Calculator className="w-4 h-4" />}
                            >
                              LCOH
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="light"
                              isIconOnly
                              onPress={() => handleDeleteFacility(facility.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* Add Facility Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="2xl">
        <ModalContent>
          <ModalHeader>Add New Production Facility</ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Facility Name"
                placeholder="e.g., Mumbai Production Plant"
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
                label="Electrolyzer Type"
                selectedKeys={[newFacility.electrolyzer_type]}
                onSelectionChange={(keys) => setNewFacility({ ...newFacility, electrolyzer_type: Array.from(keys)[0] as string })}
              >
                <SelectItem key="PEM">PEM (Proton Exchange Membrane)</SelectItem>
                <SelectItem key="Alkaline">Alkaline</SelectItem>
                <SelectItem key="SOEC">SOEC (Solid Oxide)</SelectItem>
              </Select>
              <Input
                label="Daily Capacity (kg/day)"
                type="number"
                placeholder="e.g., 1000"
                value={newFacility.capacity_kg_per_day}
                onChange={(e) => setNewFacility({ ...newFacility, capacity_kg_per_day: e.target.value })}
              />
              <Input
                label="Efficiency (%)"
                type="number"
                placeholder="e.g., 70"
                value={newFacility.efficiency_percent}
                onChange={(e) => setNewFacility({ ...newFacility, efficiency_percent: e.target.value })}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onAddClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleAddFacility}>
              Add Facility
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* LCOH Calculator Modal */}
      <Modal isOpen={isLCOHOpen} onClose={onLCOHClose} size="3xl">
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Levelized Cost of Hydrogen (LCOH) Calculator
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Select Facility"
                  selectedKeys={lcohInputs.facilityId ? [lcohInputs.facilityId] : []}
                  onSelectionChange={(keys) => setLcohInputs({...lcohInputs, facilityId: Array.from(keys)[0] as string})}
                >
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </Select>
                <Input
                  label="Operating Years"
                  type="number"
                  value={lcohInputs.operatingYears}
                  onChange={(e) => setLcohInputs({...lcohInputs, operatingYears: e.target.value})}
                />
                <Input
                  label="Electricity Cost ($/kWh)"
                  type="number"
                  step="0.001"
                  value={lcohInputs.electricityCost}
                  onChange={(e) => setLcohInputs({...lcohInputs, electricityCost: e.target.value})}
                />
                <Input
                  label="Water Cost ($/L)"
                  type="number"
                  step="0.001"
                  value={lcohInputs.waterCost}
                  onChange={(e) => setLcohInputs({...lcohInputs, waterCost: e.target.value})}
                />
                <Input
                  label="Capital Cost ($)"
                  type="number"
                  value={lcohInputs.capitalCost}
                  onChange={(e) => setLcohInputs({...lcohInputs, capitalCost: e.target.value})}
                />
                <Input
                  label="Maintenance Cost (% of CapEx/year)"
                  type="number"
                  step="0.01"
                  value={lcohInputs.maintenanceCost}
                  onChange={(e) => setLcohInputs({...lcohInputs, maintenanceCost: e.target.value})}
                />
              </div>
              
              <div className="flex justify-center">
                <Button 
                  color="primary" 
                  size="lg"
                  onPress={calculateLCOH}
                  startContent={<Calculator className="w-5 h-5" />}
                >
                  Calculate LCOH
                </Button>
              </div>

              {lcohResult !== null && (
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardBody className="text-center p-0">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">LCOH Result</h3>
                    <p className="text-4xl font-bold text-blue-600 mb-2">${lcohResult.toFixed(2)}/kg</p>
                    <p className="text-gray-600">Levelized Cost of Hydrogen</p>
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Industry Average</p>
                        <p className="text-gray-600">$3.00 - $6.00/kg</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Target (2030)</p>
                        <p className="text-gray-600">$2.00/kg</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Status</p>
                        <Chip 
                          size="sm" 
                          color={lcohResult < 2 ? 'success' : lcohResult < 4 ? 'warning' : 'danger'}
                        >
                          {lcohResult < 2 ? 'Excellent' : lcohResult < 4 ? 'Good' : 'High'}
                        </Chip>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onLCOHClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
