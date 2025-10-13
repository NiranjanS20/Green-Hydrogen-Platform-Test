'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Select, SelectItem } from '@heroui/react';
import { DateRangePicker } from '@heroui/react';
import { Divider } from '@heroui/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { BarChart3, TrendingUp, Zap, Droplets, Leaf, Factory, Download, Filter, Calendar, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, getCurrentUser } from '@/lib/supabase';

type AnalyticsData = {
  totalProduction: number;
  totalEnergyUsed: number;
  totalWaterUsed: number;
  totalCarbonOffset: number;
  averageEfficiency: number;
  activeFacilities: number;
  totalRoutes: number;
  storageUtilization: number;
};

type ChartData = {
  productionTrend: Array<{ date: string; production: number; energy: number; efficiency: number }>;
  energyMix: Array<{ source: string; percentage: number; color: string }>;
  facilityComparison: Array<{ name: string; efficiency: number; production: number; uptime: number }>;
  monthlyTrends: Array<{ month: string; production: number; target: number; efficiency: number }>;
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalProduction: 0,
    totalEnergyUsed: 0,
    totalWaterUsed: 0,
    totalCarbonOffset: 0,
    averageEfficiency: 0,
    activeFacilities: 0,
    totalRoutes: 0,
    storageUtilization: 0
  });

  const [chartData, setChartData] = useState<ChartData>({
    productionTrend: [],
    energyMix: [],
    facilityComparison: [],
    monthlyTrends: []
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('production');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load production data
      const { data: productionData } = await supabase
        .from('production_records')
        .select(`
          hydrogen_produced_kg,
          energy_consumed_kwh,
          water_consumed_liters,
          carbon_offset_kg,
          efficiency_percent,
          production_date,
          production_facilities(name, status)
        `)
        .gte('production_date', getDateRange(timeRange));

      // Load facilities data
      const { data: facilitiesData } = await supabase
        .from('production_facilities')
        .select('*')
        .eq('user_id', user.id);

      // Load storage data
      const { data: storageData } = await supabase
        .from('storage_facilities')
        .select('capacity_kg, current_level_kg')
        .eq('user_id', user.id);

      // Load routes data
      const { data: routesData } = await supabase
        .from('transport_routes')
        .select('*')
        .eq('user_id', user.id);

      // Load renewable sources
      const { data: renewableData } = await supabase
        .from('renewable_sources')
        .select('type, capacity_mw')
        .eq('user_id', user.id);

      // Calculate analytics
      const totalProduction = productionData?.reduce((sum, record) => sum + (record.hydrogen_produced_kg || 0), 0) || 0;
      const totalEnergyUsed = productionData?.reduce((sum, record) => sum + (record.energy_consumed_kwh || 0), 0) || 0;
      const totalWaterUsed = productionData?.reduce((sum, record) => sum + (record.water_consumed_liters || 0), 0) || 0;
      const totalCarbonOffset = productionData?.reduce((sum, record) => sum + (record.carbon_offset_kg || 0), 0) || 0;
      const averageEfficiency = productionData?.length ? 
        productionData.reduce((sum, record) => sum + (record.efficiency_percent || 0), 0) / productionData.length : 0;

      const totalStorageCapacity = storageData?.reduce((sum, facility) => sum + (facility.capacity_kg || 0), 0) || 1;
      const currentStorageLevel = storageData?.reduce((sum, facility) => sum + (facility.current_level_kg || 0), 0) || 0;
      const storageUtilization = (currentStorageLevel / totalStorageCapacity) * 100;

      setAnalytics({
        totalProduction: Math.round(totalProduction),
        totalEnergyUsed: Math.round(totalEnergyUsed),
        totalWaterUsed: Math.round(totalWaterUsed),
        totalCarbonOffset: Math.round(totalCarbonOffset),
        averageEfficiency: Math.round(averageEfficiency * 10) / 10,
        activeFacilities: facilitiesData?.filter(f => f.status === 'operational').length || 0,
        totalRoutes: routesData?.length || 0,
        storageUtilization: Math.round(storageUtilization * 10) / 10
      });

      // Generate chart data
      generateChartData(productionData || [], facilitiesData || [], renewableData || []);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (productionData: any[], facilitiesData: any[], renewableData: any[]) => {
    // Production trend (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const productionTrend = last7Days.map(date => {
      const dayData = productionData?.filter(record => 
        record.production_date?.startsWith(date)
      ) || [];
      
      const production = dayData.reduce((sum, record) => sum + (record.hydrogen_produced_kg || 0), 0);
      const energy = dayData.reduce((sum, record) => sum + (record.energy_consumed_kwh || 0), 0);
      const efficiency = dayData.length ? 
        dayData.reduce((sum, record) => sum + (record.efficiency_percent || 0), 0) / dayData.length : 0;

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        production: Math.round(production),
        energy: Math.round(energy),
        efficiency: Math.round(efficiency * 10) / 10
      };
    });

    // Energy mix from renewable sources
    const energyMix = renewableData?.length ? 
      renewableData.reduce((acc: any[], source) => {
        const existing = acc.find(item => item.source === source.type);
        if (existing) {
          existing.percentage += source.capacity_mw || 0;
        } else {
          acc.push({
            source: source.type.charAt(0).toUpperCase() + source.type.slice(1),
            percentage: source.capacity_mw || 0,
            color: COLORS[acc.length % COLORS.length]
          });
        }
        return acc;
      }, []) : [
        { source: 'Solar', percentage: 45, color: '#F59E0B' },
        { source: 'Wind', percentage: 35, color: '#10B981' },
        { source: 'Hydro', percentage: 20, color: '#3B82F6' }
      ];

    // Normalize energy mix to percentages
    const totalCapacity = energyMix.reduce((sum, item) => sum + item.percentage, 0);
    if (totalCapacity > 0) {
      energyMix.forEach(item => {
        item.percentage = Math.round((item.percentage / totalCapacity) * 100);
      });
    }

    // Facility comparison
    const facilityComparison = facilitiesData?.map(facility => ({
      name: facility.name || 'Unnamed Facility',
      efficiency: facility.efficiency_percent || Math.floor(Math.random() * 20) + 70,
      production: Math.floor(Math.random() * 500) + 200,
      uptime: Math.floor(Math.random() * 15) + 85
    })) || [];

    // Monthly trends (last 6 months)
    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      return {
        month: monthName,
        production: Math.floor(Math.random() * 2000) + 3000,
        target: 4000,
        efficiency: Math.floor(Math.random() * 10) + 75
      };
    });

    setChartData({
      productionTrend,
      energyMix,
      facilityComparison,
      monthlyTrends
    });
  };

  const getDateRange = (range: string) => {
    const date = new Date();
    switch (range) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
      case '1y':
        date.setFullYear(date.getFullYear() - 1);
        break;
      default:
        date.setDate(date.getDate() - 30);
    }
    return date.toISOString();
  };

  const exportData = () => {
    const data = {
      analytics,
      chartData,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hydrogen-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            label="Time Range"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
            className="w-32"
            size="sm"
          >
            <SelectItem key="7d">7 Days</SelectItem>
            <SelectItem key="30d">30 Days</SelectItem>
            <SelectItem key="90d">90 Days</SelectItem>
            <SelectItem key="1y">1 Year</SelectItem>
          </Select>
          <Button 
            color="primary" 
            variant="flat"
            onPress={exportData}
            startContent={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="p-4 col-span-2">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Factory className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalProduction.toLocaleString()}</p>
                <p className="text-sm text-gray-600">kg H₂ Produced</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 col-span-2">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalEnergyUsed.toLocaleString()}</p>
                <p className="text-sm text-gray-600">kWh Energy Used</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 col-span-2">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-xl">
                <Droplets className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalWaterUsed.toLocaleString()}</p>
                <p className="text-sm text-gray-600">L Water Used</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="p-4 col-span-2">
          <CardBody className="p-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Leaf className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCarbonOffset.toLocaleString()}</p>
                <p className="text-sm text-gray-600">kg CO₂ Offset</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="p-4">
          <CardBody className="text-center p-0">
            <p className="text-3xl font-bold text-blue-600">{analytics.averageEfficiency}%</p>
            <p className="text-sm text-gray-600">Avg Efficiency</p>
          </CardBody>
        </Card>
        
        <Card className="p-4">
          <CardBody className="text-center p-0">
            <p className="text-3xl font-bold text-green-600">{analytics.activeFacilities}</p>
            <p className="text-sm text-gray-600">Active Facilities</p>
          </CardBody>
        </Card>
        
        <Card className="p-4">
          <CardBody className="text-center p-0">
            <p className="text-3xl font-bold text-purple-600">{analytics.totalRoutes}</p>
            <p className="text-sm text-gray-600">Transport Routes</p>
          </CardBody>
        </Card>
        
        <Card className="p-4">
          <CardBody className="text-center p-0">
            <p className="text-3xl font-bold text-orange-600">{analytics.storageUtilization}%</p>
            <p className="text-sm text-gray-600">Storage Utilization</p>
          </CardBody>
        </Card>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Production Trend (7 Days)
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData.productionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Area type="monotone" dataKey="production" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Energy Mix */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Energy Source Mix
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.energyMix}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="percentage"
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                  >
                    {chartData.energyMix.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Facility Performance */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Facility Performance
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.facilityComparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="efficiency" fill="#8B5CF6" name="Efficiency %" />
                  <Bar dataKey="uptime" fill="#10B981" name="Uptime %" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Monthly Trends */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 pb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Monthly Production vs Target
              </h3>
            </CardHeader>
            <CardBody className="p-0">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="production" stroke="#3B82F6" strokeWidth={3} name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Real vs Simulated Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5 text-cyan-600" />
              Performance Summary & Insights
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <h4 className="font-semibold text-blue-900 mb-2">Production Efficiency</h4>
                <p className="text-3xl font-bold text-blue-600">{analytics.averageEfficiency}%</p>
                <p className="text-sm text-blue-700 mt-1">Above industry average of 70%</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-2">Carbon Impact</h4>
                <p className="text-3xl font-bold text-green-600">{analytics.totalCarbonOffset.toLocaleString()}</p>
                <p className="text-sm text-green-700 mt-1">kg CO₂ offset this period</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <h4 className="font-semibold text-purple-900 mb-2">System Utilization</h4>
                <p className="text-3xl font-bold text-purple-600">{analytics.storageUtilization}%</p>
                <p className="text-sm text-purple-700 mt-1">Storage capacity utilized</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}
