'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Button } from '@heroui/react';
import { Progress } from '@heroui/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Factory, Database, Truck, Zap, TrendingUp, Activity, AlertCircle, CheckCircle2, Clock, ArrowRight, Droplets, Wind, Sun } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatNumber, getStatusColor } from '@/lib/utils';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; email?: string; full_name?: string } | null>(null);
    const [metrics, setMetrics] = useState({
        totalProduction: 0,
        totalEnergy: 0,
        carbonOffset: 0,
        avgEfficiency: 0,
        activeFacilities: 0,
        storageUtilization: 0,
        systemEfficiency: 85
    });
    
    const [storageStatus, setStorageStatus] = useState([
        { name: 'Compressed Storage A', type: 'compressed', current: 750, capacity: 1000, utilization: 75, status: 'operational' },
        { name: 'Liquid Storage B', type: 'liquid', current: 420, capacity: 500, utilization: 84, status: 'operational' },
        { name: 'Underground C', type: 'underground', current: 1200, capacity: 2000, utilization: 60, status: 'maintenance' }
    ]);

    const [productionData, setProductionData] = useState<any[]>([]);
    const [energySourceData, setEnergySourceData] = useState<any[]>([]);
    const [efficiencyData, setEfficiencyData] = useState<any[]>([]);


    const [transportRoutes, setTransportRoutes] = useState<any[]>([]);

    const getSourceColor = (type: string) => {
        const colors: { [key: string]: string } = {
            'solar': '#F59E0B',
            'wind': '#6366F1', 
            'hydro': '#3B82F6',
            'geothermal': '#10B981',
            'biomass': '#8B5CF6'
        };
        return colors[type.toLowerCase()] || '#6B7280';
    };

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { user: currentUser } = await getCurrentUser();
            
            if (currentUser) {
                setUser(currentUser);

                // Load production facilities
                const { data: productionFacilities } = await supabase
                    .from('production_facilities')
                    .select('*')
                    .eq('user_id', currentUser.id);

                // Load storage facilities
                const { data: storageFacilities } = await supabase
                    .from('storage_facilities')
                    .select('*')
                    .eq('user_id', currentUser.id);

                // Load renewable sources
                const { data: renewableSources } = await supabase
                    .from('renewable_sources')
                    .select('*')
                    .eq('user_id', currentUser.id);

                // Load transport routes
                const { data: transportData } = await supabase
                    .from('transport_routes')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('created_at', { ascending: false })
                    .limit(5);

                // Load production records for recent data
                const { data: productionRecords } = await supabase
                    .from('production_records')
                    .select(`
                        *,
                        production_facilities!inner(user_id)
                    `)
                    .eq('production_facilities.user_id', currentUser.id)
                    .order('production_date', { ascending: false })
                    .limit(30);

                // Calculate real metrics from actual data
                const totalProduction = productionRecords?.reduce((sum, record) => sum + (record.hydrogen_produced_kg || 0), 0) || 0;
                const totalEnergy = productionRecords?.reduce((sum, record) => sum + (record.energy_consumed_kwh || 0), 0) || 0;
                const totalCarbonOffset = productionRecords?.reduce((sum, record) => sum + (record.carbon_offset_kg || 0), 0) || 0;
                const avgEfficiency = (productionFacilities && productionFacilities.length > 0) 
                    ? productionFacilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0) / productionFacilities.length 
                    : 0;
                const activeFacilities = productionFacilities?.filter(f => f.status === 'operational').length || 0;
                const totalStorageCapacity = storageFacilities?.reduce((sum, f) => sum + (f.capacity_kg || 0), 0) || 0;
                const currentStorageLevel = storageFacilities?.reduce((sum, f) => sum + (f.current_level_kg || 0), 0) || 0;
                const storageUtilization = totalStorageCapacity > 0 ? (currentStorageLevel / totalStorageCapacity) * 100 : 0;
                const renewableCapacity = renewableSources?.reduce((sum, s) => sum + (s.capacity_mw || 0), 0) || 0;
                const renewableOutput = renewableSources?.reduce((sum, s) => sum + (s.current_output_mw || 0), 0) || 0;
                const systemEfficiency = renewableCapacity > 0 ? (renewableOutput / renewableCapacity) * 100 : 0;

                setMetrics({
                    totalProduction,
                    totalEnergy,
                    carbonOffset: totalCarbonOffset,
                    avgEfficiency,
                    activeFacilities,
                    storageUtilization,
                    systemEfficiency
                });

                // Update storage status with real data
                if (storageFacilities && storageFacilities.length > 0) {
                    const realStorageStatus = storageFacilities.slice(0, 3).map(facility => ({
                        name: facility.name,
                        type: facility.storage_type,
                        current: facility.current_level_kg || 0,
                        capacity: facility.capacity_kg || 0,
                        utilization: facility.capacity_kg > 0 ? Math.round((facility.current_level_kg || 0) / facility.capacity_kg * 100) : 0,
                        status: facility.status || 'operational'
                    }));
                    setStorageStatus(realStorageStatus);
                }

                // Update transport routes with real data
                if (transportData && transportData.length > 0) {
                    const realTransportRoutes = transportData.map(route => ({
                        id: route.id,
                        vehicle: `${route.transport_type.replace('_', ' ')} - ${route.route_name}`,
                        destination: route.destination,
                        status: route.status,
                        eta: route.status === 'completed' ? 'Delivered' : 
                             route.status === 'in_transit' ? 'In Transit' :
                             `${Math.round(route.distance_km / 60)} hours`
                    }));
                    setTransportRoutes(realTransportRoutes);
                } else {
                    setTransportRoutes([]);
                }

                // Generate real production data from production records
                if (productionRecords && productionRecords.length > 0) {
                    const monthlyData: any = {};
                    productionRecords.forEach((record: any) => {
                        const month = new Date(record.production_date).toLocaleDateString('en-US', { month: 'short' });
                        if (!monthlyData[month]) {
                            monthlyData[month] = { month, production: 0, target: 0, count: 0 };
                        }
                        monthlyData[month].production += record.hydrogen_produced_kg || 0;
                        monthlyData[month].target += record.target_production_kg || record.hydrogen_produced_kg || 0;
                        monthlyData[month].count += 1;
                    });
                    
                    const chartData = Object.values(monthlyData).slice(0, 6);
                    setProductionData(chartData);
                } else {
                    setProductionData([]);
                }

                // Generate real energy source data from renewable sources
                if (renewableSources && renewableSources.length > 0) {
                    const sourceTypes: any = {};
                    renewableSources.forEach((source: any) => {
                        const type = source.source_type || 'Other';
                        if (!sourceTypes[type]) {
                            sourceTypes[type] = { name: type, value: 0, color: getSourceColor(type) };
                        }
                        sourceTypes[type].value += source.capacity_mw || 0;
                    });
                    
                    const total = Object.values(sourceTypes).reduce((sum: number, s: any) => sum + s.value, 0);
                    const chartData = Object.values(sourceTypes).map((s: any) => ({
                        ...s,
                        value: total > 0 ? Math.round((s.value / total) * 100) : 0
                    }));
                    setEnergySourceData(chartData);
                } else {
                    setEnergySourceData([]);
                }

                // Generate real efficiency data from production facilities
                if (productionFacilities && productionFacilities.length > 0) {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const effData = days.map(day => {
                        const pemFacilities = productionFacilities.filter(f => f.electrolyzer_type === 'pem');
                        const alkalineFacilities = productionFacilities.filter(f => f.electrolyzer_type === 'alkaline');
                        const soecFacilities = productionFacilities.filter(f => f.electrolyzer_type === 'soec');
                        
                        return {
                            day,
                            pem: pemFacilities.length > 0 ? 
                                pemFacilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0) / pemFacilities.length : 0,
                            alkaline: alkalineFacilities.length > 0 ? 
                                alkalineFacilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0) / alkalineFacilities.length : 0,
                            soec: soecFacilities.length > 0 ? 
                                soecFacilities.reduce((sum, f) => sum + (f.efficiency_percent || 0), 0) / soecFacilities.length : 0
                        };
                    });
                    setEfficiencyData(effData);
                } else {
                    setEfficiencyData([]);
                }

            } else {
                // Fallback data for non-authenticated users
                setMetrics({
                    totalProduction: 0,
                    totalEnergy: 0,
                    carbonOffset: 0,
                    avgEfficiency: 0,
                    activeFacilities: 0,
                    storageUtilization: 0,
                    systemEfficiency: 0
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback to demo data on error
            setMetrics({
                totalProduction: 3420,
                totalEnergy: 134750,
                carbonOffset: 35910,
                avgEfficiency: 72,
                activeFacilities: 8,
                storageUtilization: 74,
                systemEfficiency: 85
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
    }, []);
    const quickActions = [
        { icon: <Factory className="w-6 h-6" />, label: 'New Production', href: '/production', color: 'from-blue-500 to-cyan-500' },
        { icon: <Database className="w-6 h-6" />, label: 'Storage', href: '/storage', color: 'from-purple-500 to-pink-500' },
        { icon: <Truck className="w-6 h-6" />, label: 'Transport', href: '/transportation', color: 'from-orange-500 to-red-500' },
        { icon: <Activity className="w-6 h-6" />, label: 'Simulation', href: '/simulation', color: 'from-green-500 to-emerald-500' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-4 sm:p-6 md:p-8 text-white">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                    {user?.full_name ? `Welcome back, ${user.full_name}!` : 'Dashboard Overview'}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base md:text-lg">Monitor your green hydrogen production ecosystem in real-time</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                        <div className="glassmorphic-strong rounded-2xl p-3 sm:p-4 md:p-6 text-center card-hover cursor-pointer group">
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mx-auto mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{action.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card className="border-2 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-gray-700">Total Production</h3>
                        <Factory className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-blue-600">{formatNumber(metrics.totalProduction, 0)} kg</div>
                        <p className="text-xs text-gray-600 mt-1">+12% from last month</p>
                    </CardBody>
                </Card>

                <Card className="border-2 border-yellow-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-gray-700">Energy Consumed</h3>
                        <Zap className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-yellow-600">{formatNumber(metrics.totalEnergy, 0)} kWh</div>
                        <p className="text-xs text-gray-600 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-green-600 font-medium">+8.2%</span> renewable usage
                        </p>
                    </CardBody>
                </Card>

                <Card className="border-2 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-gray-700">Carbon Offset</h3>
                        <Activity className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-green-600">{formatNumber(metrics.carbonOffset, 0)} kg</div>
                        <p className="text-xs text-gray-600 mt-2">CO₂ emissions prevented</p>
                    </CardBody>
                </Card>

                <Card className="border-2 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <h3 className="text-sm font-medium text-gray-700">System Efficiency</h3>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardBody>
                        <div className="text-3xl font-bold text-purple-600">{metrics.systemEfficiency}%</div>
                        <p className="text-xs text-gray-600 mt-2">Overall performance</p>
                    </CardBody>
                </Card>
            </div>

            {/* Production Trends */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Production vs Target
                        </h3>
                        <p className="text-sm text-gray-600">Monthly hydrogen production (kg)</p>
                    </CardHeader>
                    <CardBody>
                        {productionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={productionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                                    <YAxis stroke="#6b7280" fontSize={12} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                                    <Legend />
                                    <Bar dataKey="production" fill="#3B82F6" name="Actual" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" fill="#10B981" name="Target" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-gray-500">
                                <div className="text-center">
                                    <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm sm:text-base">No production data available</p>
                                    <p className="text-xs sm:text-sm">Add production facilities to see charts</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                            <Zap className="w-5 h-5 text-yellow-600" />
                            Energy Source Distribution
                        </h3>
                        <p className="text-sm text-gray-600">Renewable energy mix</p>
                    </CardHeader>
                    <CardBody>
                        {energySourceData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={energySourceData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {energySourceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-gray-500">
                                <div className="text-center">
                                    <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No renewable sources available</p>
                                    <p className="text-sm">Add renewable sources to see energy mix</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Electrolyzer Efficiency */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Electrolyzer Efficiency Comparison
                    </h3>
                    <p className="text-sm text-gray-600">Weekly performance by electrolyzer type (%)</p>
                </CardHeader>
                <CardBody>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={efficiencyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" domain={[50, 95]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Line type="monotone" dataKey="pem" stroke="#3B82F6" strokeWidth={3} name="PEM" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="alkaline" stroke="#10B981" strokeWidth={3} name="Alkaline" dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="soec" stroke="#F59E0B" strokeWidth={3} name="SOEC" dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardBody>
            </Card>

            {/* Storage Status */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Database className="w-5 h-5 text-purple-600" />
                        Storage Facilities Status
                    </h3>
                    <p className="text-sm text-gray-600">Real-time storage capacity and utilization</p>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {storageStatus.map((facility, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-800">{facility.name}</h4>
                                        <Chip color="secondary" variant="flat">{facility.type}</Chip>
                                        <Chip color={facility.status === 'operational' ? 'success' : 'warning'} variant="flat">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {facility.status}
                                        </Chip>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <span>{formatNumber(facility.current, 0)} / {formatNumber(facility.capacity, 0)} kg</span>
                                        <span className="font-medium text-purple-600">{facility.utilization}% utilized</span>
                                    </div>
                                    <div className="mt-2">
                                        <Progress value={facility.utilization} className="h-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Transportation Routes */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Truck className="w-5 h-5 text-orange-600" />
                        Active Transportation Routes
                    </h3>
                    <p className="text-sm text-gray-600">Current hydrogen distribution status</p>
                </CardHeader>
                <CardBody>
                    {transportRoutes.length > 0 ? (
                        <div className="space-y-3">
                            {transportRoutes.map((route, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-semibold text-gray-800">{route.id.slice(0, 8)}</span>
                                            <Chip 
                                                color={
                                                    route.status === 'in_transit' ? 'primary' :
                                                    route.status === 'scheduled' ? 'warning' : 'success'
                                                }
                                                variant="flat"
                                            >
                                                {route.status.replace('_', ' ')}
                                            </Chip>
                                        </div>
                                        <p className="text-sm text-gray-600">{route.vehicle} → {route.destination}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Clock className="w-4 h-4" />
                                        <span className="font-medium">{route.eta}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 mb-2">No transport routes yet</p>
                            <p className="text-sm text-gray-400">Add routes in the Transportation page</p>
                        </div>
                    )}
                    <div className="mt-4 text-center">
                        <Link href="/transportation">
                            <Button variant="ghost" className="w-full border border-white/10">
                                View All Routes
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </CardBody>
            </Card>

            {/* System Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            Recent Alerts
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-900">Maintenance Due</p>
                                    <p className="text-sm text-yellow-700">Facility B requires inspection in 5 days</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-blue-900">Efficiency Peak</p>
                                    <p className="text-sm text-blue-700">PEM electrolyzer reached 72% efficiency</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-green-900">Target Achieved</p>
                                    <p className="text-sm text-green-700">Monthly production exceeded by 15%</p>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <h3 className="flex items-center gap-2 text-lg font-semibold">
                            <Activity className="w-5 h-5 text-green-600" />
                            System Health
                        </h3>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Production Facilities</span>
                                    <span className="text-sm font-bold text-green-600">98%</span>
                                </div>
                                <Progress value={98} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Storage Systems</span>
                                    <span className="text-sm font-bold text-blue-600">95%</span>
                                </div>
                                <Progress value={95} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Transport Fleet</span>
                                    <span className="text-sm font-bold text-purple-600">92%</span>
                                </div>
                                <Progress value={92} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Renewable Sources</span>
                                    <span className="text-sm font-bold text-orange-600">88%</span>
                                </div>
                                <Progress value={88} className="h-2" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Renewable Energy Status */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Zap className="w-5 h-5 text-green-600" />
                        Renewable Energy Sources Status
                    </h3>
                    <p className="text-sm text-gray-600">Real-time energy generation from renewable sources</p>
                </CardHeader>
                <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-6 h-6 text-yellow-600" />
                                    <h4 className="font-semibold text-gray-800">Solar Energy</h4>
                                </div>
                                <Chip color="success" variant="flat">Active</Chip>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-semibold text-gray-800">50 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Output:</span>
                                    <span className="font-semibold text-yellow-600">38.5 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Efficiency:</span>
                                    <span className="font-semibold text-green-600">77%</span>
                                </div>
                                <Progress value={77} className="h-2 mt-2" />
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Wind className="w-6 h-6 text-blue-600" />
                                    <h4 className="font-semibold text-gray-800">Wind Energy</h4>
                                </div>
                                <Chip color="success" variant="flat">Active</Chip>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-semibold text-gray-800">75 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Output:</span>
                                    <span className="font-semibold text-blue-600">52.5 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Efficiency:</span>
                                    <span className="font-semibold text-green-600">70%</span>
                                </div>
                                <Progress value={70} className="h-2 mt-2" />
                            </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border-2 border-cyan-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Droplets className="w-6 h-6 text-cyan-600" />
                                    <h4 className="font-semibold text-gray-800">Hydropower</h4>
                                </div>
                                <Chip color="success" variant="flat">Active</Chip>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Capacity:</span>
                                    <span className="font-semibold text-gray-800">100 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Output:</span>
                                    <span className="font-semibold text-cyan-600">85 MW</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Efficiency:</span>
                                    <span className="font-semibold text-green-600">85%</span>
                                </div>
                                <Progress value={85} className="h-2 mt-2" />
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}