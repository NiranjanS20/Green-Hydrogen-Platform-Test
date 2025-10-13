"use client";

import Link from 'next/link';
import { Factory, Database, Truck, Zap, Leaf, ArrowRight, CheckCircle2, FlaskConical, Users, Globe, BarChart3 } from 'lucide-react';
import { Button } from '@heroui/react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Chip } from '@heroui/react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [globalKPIs, setGlobalKPIs] = useState({
    totalProduction: 0,
    carbonOffset: 0,
    storageCapacity: 0,
    activeFacilities: 0,
    renewableCapacity: 0,
    renewableEnergy: 0,
    currentStorage: 0,
    activeDeliveries: 0,
    energyEfficiency: 0,
    systemHealth: 'good' as 'excellent' | 'good' | 'warning' | 'critical'
  });

  const [recentAlerts, setRecentAlerts] = useState<Array<{
    id: string;
    type: 'production' | 'storage' | 'transport' | 'energy';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    message: string;
    timestamp: string;
    facility: string;
  }>>([]);

  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadGlobalKPIs();
    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(loadGlobalKPIs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadGlobalKPIs = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      // Get today's date for current data
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get recent production data (last 7 days)
      const { data: production } = await supabase
        .from('production_records')
        .select('hydrogen_produced_kg, carbon_offset_kg, energy_consumed_kwh, production_date')
        .gte('production_date', lastWeek)
        .order('production_date', { ascending: false });

      const totalProduction = production?.reduce((sum: number, record: any) => sum + (record.hydrogen_produced_kg || 0), 0) || 0;
      const carbonOffset = production?.reduce((sum: number, record: any) => sum + (record.carbon_offset_kg || 0), 0) || 0;
      const totalEnergyUsed = production?.reduce((sum: number, record: any) => sum + (record.energy_consumed_kwh || 0), 0) || 0;

      // Get user's renewable energy data
      const { data: renewableData } = await supabase
        .from('renewable_sources')
        .select('capacity_mw, efficiency_percent, status, name')
        .eq('user_id', user.id);

      let totalRenewableCapacity = 0;
      let activeRenewableSources = 0;
      let todayRenewableEnergy = 0;

      if (renewableData) {
        renewableData.forEach(source => {
          if (source.status === 'active') {
            activeRenewableSources++;
            const capacity = source.capacity_mw || 0;
            totalRenewableCapacity += capacity;
            
            // Estimate today's energy production (24h * capacity * efficiency * weather factor)
            const weatherFactor = 0.8 + Math.random() * 0.4; // 80-120%
            const dailyEnergy = capacity * 24 * (source.efficiency_percent || 25) / 100 * weatherFactor;
            todayRenewableEnergy += dailyEnergy;
          }
        });
      }

      // Get user's storage data
      const { data: storageData } = await supabase
        .from('storage_facilities')
        .select('capacity_kg, current_level_kg, name, status')
        .eq('user_id', user.id);

      const storageCapacity = storageData?.reduce((sum: number, facility: any) => sum + (facility.capacity_kg || 0), 0) || 0;
      const currentStorage = storageData?.reduce((sum: number, facility: any) => sum + (facility.current_level_kg || 0), 0) || 0;

      // Get user's facilities count
      const { data: facilities } = await supabase
        .from('production_facilities')
        .select('id, name, status')
        .eq('user_id', user.id)
        .eq('status', 'operational');

      // Get user's transport routes
      const { data: routes } = await supabase
        .from('transport_routes')
        .select('status, priority, route_name')
        .eq('user_id', user.id);

      const activeDeliveries = routes?.filter(r => r.status === 'in_transit').length || 0;
      const urgentDeliveries = routes?.filter(r => r.status === 'in_transit' && r.priority === 'urgent').length || 0;
      const delayedDeliveries = routes?.filter(r => r.status === 'delayed').length || 0;

      // Calculate system health based on real metrics
      let systemHealth: 'excellent' | 'good' | 'warning' | 'critical' = 'excellent';
      let healthScore = 100;

      // Check storage utilization
      const storageUtilization = storageCapacity > 0 ? (currentStorage / storageCapacity) * 100 : 0;
      if (storageUtilization > 95) healthScore -= 30;
      else if (storageUtilization > 85) healthScore -= 15;

      // Check renewable energy availability
      const renewableUsage = totalEnergyUsed > 0 ? (todayRenewableEnergy / totalEnergyUsed) * 100 : 100;
      if (renewableUsage < 30) healthScore -= 25;
      else if (renewableUsage < 50) healthScore -= 10;

      // Check transport issues
      if (delayedDeliveries > 0) healthScore -= 20;
      if (urgentDeliveries > 2) healthScore -= 15;

      // Check facility operational status
      const totalFacilities = facilities?.length || 0;
      if (totalFacilities === 0) healthScore -= 40;

      // Determine health status
      if (healthScore >= 90) systemHealth = 'excellent';
      else if (healthScore >= 70) systemHealth = 'good';
      else if (healthScore >= 50) systemHealth = 'warning';
      else systemHealth = 'critical';

      setGlobalKPIs({
        totalProduction: Math.round(totalProduction),
        carbonOffset: Math.round(carbonOffset),
        storageCapacity: Math.round(storageCapacity),
        activeFacilities: facilities?.length || 0,
        renewableCapacity: Math.round(totalRenewableCapacity),
        renewableEnergy: Math.round(todayRenewableEnergy),
        currentStorage: Math.round(currentStorage),
        activeDeliveries,
        energyEfficiency: totalEnergyUsed > 0 ? Math.round((totalProduction * 39.4 / totalEnergyUsed) * 100) : 0,
        systemHealth
      });

      // Generate real-time alerts
      await generateSystemAlerts(facilities || [], storageData || [], routes || [], renewableData || [], todayRenewableEnergy, totalEnergyUsed);

      // Update last refresh time
      setLastUpdated(new Date().toLocaleTimeString());

    } catch (error) {
      console.error('Error loading global KPIs:', error);
    }
  };

  const generateSystemAlerts = async (facilities: any[], storageData: any[], routes: any[], renewableData: any[], renewableEnergy: number, energyUsed: number) => {
    const alerts: Array<{
      id: string;
      type: 'production' | 'storage' | 'transport' | 'energy';
      priority: 'low' | 'medium' | 'high' | 'urgent';
      message: string;
      timestamp: string;
      facility: string;
    }> = [];

    // Real production capacity alerts based on actual data
    if (facilities && facilities.length > 0) {
      // Get today's production records for these facilities
      const today = new Date().toISOString().split('T')[0];
      const { data: todayProduction } = await supabase
        .from('production_records')
        .select('facility_id, hydrogen_produced_kg')
        .eq('production_date', today);

      facilities.forEach(facility => {
        if (facility.status === 'operational') {
          const todayRecord = todayProduction?.find(p => p.facility_id === facility.id);
          
          if (todayRecord) {
            // Calculate actual daily progress based on facility capacity
            const dailyCapacity = facility.capacity_kg_per_day || 1000; // Default if not set
            const dailyProgress = (todayRecord.hydrogen_produced_kg / dailyCapacity) * 100;
            
            if (dailyProgress >= 95) {
              alerts.push({
                id: `prod-${facility.id}-${Date.now()}`,
                type: 'production',
                priority: 'urgent',
                message: `${facility.name}: Daily production ${Math.round(dailyProgress)}% complete - Assign storage immediately!`,
                timestamp: new Date().toISOString(),
                facility: facility.name || 'Production Facility'
              });
            } else if (dailyProgress >= 80) {
              alerts.push({
                id: `prod-${facility.id}-${Date.now()}`,
                type: 'production',
                priority: 'high',
                message: `${facility.name}: Daily production ${Math.round(dailyProgress)}% complete - Plan transport soon`,
                timestamp: new Date().toISOString(),
                facility: facility.name || 'Production Facility'
              });
            }
          } else if (facility.status === 'operational') {
            // No production today - potential issue
            alerts.push({
              id: `prod-no-data-${facility.id}-${Date.now()}`,
              type: 'production',
              priority: 'medium',
              message: `${facility.name}: No production recorded today - Check facility status`,
              timestamp: new Date().toISOString(),
              facility: facility.name || 'Production Facility'
            });
          }
        }
      });
    }

    // Real storage capacity alerts
    if (storageData && storageData.length > 0) {
      storageData.forEach(storage => {
        if (storage.status === 'operational') {
          const utilization = ((storage.current_level_kg || 0) / (storage.capacity_kg || 1)) * 100;
          
          if (utilization >= 95) {
            alerts.push({
              id: `storage-${storage.id}-${Date.now()}`,
              type: 'storage',
              priority: 'urgent',
              message: `${storage.name}: Storage ${Math.round(utilization)}% full - Critical capacity reached!`,
              timestamp: new Date().toISOString(),
              facility: storage.name || 'Storage Facility'
            });
          } else if (utilization >= 85) {
            alerts.push({
              id: `storage-${storage.id}-${Date.now()}`,
              type: 'storage',
              priority: 'high',
              message: `${storage.name}: Storage ${Math.round(utilization)}% full - Consider redistribution`,
              timestamp: new Date().toISOString(),
              facility: storage.name || 'Storage Facility'
            });
          } else if (utilization <= 10 && storage.current_level_kg > 0) {
            alerts.push({
              id: `storage-low-${storage.id}-${Date.now()}`,
              type: 'storage',
              priority: 'medium',
              message: `${storage.name}: Storage running low (${Math.round(utilization)}% full) - Plan refill`,
              timestamp: new Date().toISOString(),
              facility: storage.name || 'Storage Facility'
            });
          }
        }
      });
    }

    // Transport alerts
    if (routes) {
      const urgentDeliveries = routes.filter(r => r.status === 'in_transit' && r.priority === 'urgent').length;
      const delayedDeliveries = routes.filter(r => r.status === 'delayed').length;
      
      if (urgentDeliveries > 0) {
        alerts.push({
          id: `transport-urgent-${Date.now()}`,
          type: 'transport',
          priority: 'urgent',
          message: `${urgentDeliveries} urgent deliveries in transit - Monitor closely`,
          timestamp: new Date().toISOString(),
          facility: 'Transport System'
        });
      }
      
      if (delayedDeliveries > 0) {
        alerts.push({
          id: `transport-delayed-${Date.now()}`,
          type: 'transport',
          priority: 'high',
          message: `${delayedDeliveries} deliveries delayed - Check routes`,
          timestamp: new Date().toISOString(),
          facility: 'Transport System'
        });
      }
    }

    // Energy efficiency alerts
    if (renewableEnergy > 0 && energyUsed > 0) {
      const renewableUsage = (renewableEnergy / energyUsed) * 100;
      
      if (renewableUsage < 50) {
        alerts.push({
          id: `energy-low-${Date.now()}`,
          type: 'energy',
          priority: 'medium',
          message: `Only ${Math.round(renewableUsage)}% renewable energy usage - Increase green sources`,
          timestamp: new Date().toISOString(),
          facility: 'Energy System'
        });
      }
    }

    // Sort by priority and timestamp
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setRecentAlerts(alerts.slice(0, 10)); // Keep only latest 10 alerts
  };

  const features = [
    { 
      icon: <Factory className="w-8 h-8" />, 
      title: 'Production Management', 
      description: 'Monitor and optimize hydrogen production with real-time analytics',
      href: '/production', 
      color: 'primary' 
    },
    { 
      icon: <Database className="w-8 h-8" />, 
      title: 'Storage Solutions', 
      description: 'Advanced storage monitoring and capacity management',
      href: '/storage', 
      color: 'secondary' 
    },
    { 
      icon: <Truck className="w-8 h-8" />, 
      title: 'Transportation', 
      description: 'Efficient logistics and route optimization',
      href: '/transportation', 
      color: 'warning' 
    },
    { 
      icon: <FlaskConical className="w-8 h-8" />, 
      title: 'Simulation Engine', 
      description: 'Run 30-day production scenarios with weather conditions',
      href: '/simulation', 
      color: 'success' 
    },
    { 
      icon: <BarChart3 className="w-8 h-8" />, 
      title: 'Analytics Dashboard', 
      description: 'Comprehensive data visualization and insights',
      href: '/analytics', 
      color: 'danger' 
    },
    { 
      icon: <Globe className="w-8 h-8" />, 
      title: 'Research Hub', 
      description: 'Access hydrogen research papers and documentation',
      href: '/research', 
      color: 'secondary' 
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10" />
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Chip color="primary" variant="flat" className="mb-6">
              🌿 Green Hydrogen Platform v2.0
            </Chip>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Smart Hydrogen
            <br />
            Production Platform
          </motion.h1>
          
          {lastUpdated && (
            <motion.div
              className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Data • Last updated: {lastUpdated}</span>
            </motion.div>
          )}
          
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Complete stakeholder-ready platform for green hydrogen production, storage, and transportation. 
            Real-time monitoring, AI-powered simulations, and comprehensive analytics.
          </motion.p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Button 
              as={Link}
              href="/dashboard"
              color="primary"
              size="lg"
              endContent={<ArrowRight className="w-4 h-4" />}
              className="font-semibold"
            >
              Get Started
            </Button>
            <Button 
              as={Link}
              href="/research"
              variant="bordered"
              size="lg"
              className="font-semibold"
            >
              Research Papers
            </Button>
          </div>
          
          {/* Global KPIs */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 max-w-8xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
                  <Factory className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.totalProduction.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">kg H₂ Produced</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.carbonOffset.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">kg CO₂ Offset</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-3">
                  <Database className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.storageCapacity.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">kg H₂ Stored</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.activeFacilities}</h3>
                <p className="text-gray-600 text-sm">Active Facilities</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-3">
                  <Zap className="w-6 h-6 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.renewableEnergy.toLocaleString()}</h3>
                <p className="text-gray-600 text-sm">kWh Renewable</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className="flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full mx-auto mb-3">
                  <Truck className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{globalKPIs.activeDeliveries}</h3>
                <p className="text-gray-600 text-sm">Active Deliveries</p>
              </CardBody>
            </Card>
            
            <Card className="p-4 bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardBody className="text-center p-0">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-3 ${
                  globalKPIs.systemHealth === 'excellent' ? 'bg-green-100' :
                  globalKPIs.systemHealth === 'good' ? 'bg-blue-100' :
                  globalKPIs.systemHealth === 'warning' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  <CheckCircle2 className={`w-6 h-6 ${
                    globalKPIs.systemHealth === 'excellent' ? 'text-green-600' :
                    globalKPIs.systemHealth === 'good' ? 'text-blue-600' :
                    globalKPIs.systemHealth === 'warning' ? 'text-yellow-600' :
                    'text-red-600'
                  }`} />
                </div>
                <h3 className={`text-2xl font-bold capitalize ${
                  globalKPIs.systemHealth === 'excellent' ? 'text-green-600' :
                  globalKPIs.systemHealth === 'good' ? 'text-blue-600' :
                  globalKPIs.systemHealth === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {globalKPIs.systemHealth}
                </h3>
                <p className="text-gray-600 text-sm">System Health</p>
              </CardBody>
            </Card>
          </motion.div>

          {/* Recent Alerts Section */}
          {recentAlerts.length > 0 && (
            <motion.div 
              className="mt-16 max-w-6xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🚨 Recent System Alerts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentAlerts.slice(0, 6).map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className={`p-4 ${
                      alert.priority === 'urgent' ? 'bg-red-50 border-red-200' :
                      alert.priority === 'high' ? 'bg-orange-50 border-orange-200' :
                      alert.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <CardBody className="p-0">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            alert.priority === 'urgent' ? 'bg-red-100' :
                            alert.priority === 'high' ? 'bg-orange-100' :
                            alert.priority === 'medium' ? 'bg-yellow-100' :
                            'bg-blue-100'
                          }`}>
                            {alert.type === 'production' && <Factory className={`w-4 h-4 ${
                              alert.priority === 'urgent' ? 'text-red-600' :
                              alert.priority === 'high' ? 'text-orange-600' :
                              alert.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />}
                            {alert.type === 'storage' && <Database className={`w-4 h-4 ${
                              alert.priority === 'urgent' ? 'text-red-600' :
                              alert.priority === 'high' ? 'text-orange-600' :
                              alert.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />}
                            {alert.type === 'transport' && <Truck className={`w-4 h-4 ${
                              alert.priority === 'urgent' ? 'text-red-600' :
                              alert.priority === 'high' ? 'text-orange-600' :
                              alert.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />}
                            {alert.type === 'energy' && <Zap className={`w-4 h-4 ${
                              alert.priority === 'urgent' ? 'text-red-600' :
                              alert.priority === 'high' ? 'text-orange-600' :
                              alert.priority === 'medium' ? 'text-yellow-600' :
                              'text-blue-600'
                            }`} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{alert.facility}</span>
                              <Chip 
                                size="sm" 
                                color={
                                  alert.priority === 'urgent' ? 'danger' :
                                  alert.priority === 'high' ? 'warning' :
                                  alert.priority === 'medium' ? 'default' :
                                  'primary'
                                }
                                variant="flat"
                              >
                                {alert.priority.toUpperCase()}
                              </Chip>
                            </div>
                            <p className={`text-sm ${
                              alert.priority === 'urgent' ? 'text-red-800' :
                              alert.priority === 'high' ? 'text-orange-800' :
                              alert.priority === 'medium' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {alert.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(alert.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete Hydrogen Ecosystem
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Manage every aspect of your green hydrogen operations from a single, integrated platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card 
                  as={Link}
                  href={feature.href}
                  isPressable
                  isHoverable
                  className="p-6 h-full transition-all duration-300 hover:scale-105 bg-white/70 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white mb-4 shadow-lg">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <div className="flex items-center mt-4 text-blue-600 font-medium">
                      Explore <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Impact Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              🌍 Driving Sustainable Energy Transition
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform enables stakeholders to make data-driven decisions for clean hydrogen production, 
              contributing to global decarbonization goals and sustainable energy infrastructure.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardBody>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Emissions</h3>
                <p className="text-gray-600">100% renewable energy powered hydrogen production with real-time carbon offset tracking</p>
              </CardBody>
            </Card>
            
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardBody>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Data-Driven</h3>
                <p className="text-gray-600">Advanced analytics and AI-powered simulations for optimal production efficiency</p>
              </CardBody>
            </Card>
            
            <Card className="p-6 text-center bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardBody>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Stakeholder Ready</h3>
                <p className="text-gray-600">Comprehensive reporting and visualization tools for investors and policymakers</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Hydrogen Production?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Join the future of clean energy with our comprehensive platform
          </p>
          <Button 
            as={Link}
            href="/dashboard"
            size="lg"
            className="bg-white text-blue-600 font-semibold hover:bg-gray-100"
            endContent={<ArrowRight className="w-4 h-4" />}
          >
            Start Your Journey
          </Button>
        </div>
      </section>
    </main>
  );
}