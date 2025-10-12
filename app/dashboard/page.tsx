'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Factory, Database, Truck, Zap, TrendingUp, Activity, AlertCircle, CheckCircle2, Clock, ArrowRight, Droplets, Wind, Sun } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { formatNumber } from '@/lib/utils';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<{ id: string; email?: string; full_name?: string } | null>(null);
    const [metrics, setMetrics] = useState({
        totalProduction: 0,
        totalEnergy: 0,
        carbonOffset: 0,
        avgEfficiency: 0,
        activeFacilities: 0,
        storageUtilization: 0
    });

    const productionData = [
        { month: 'Jan', production: 450, target: 500 },
        { month: 'Feb', production: 520, target: 500 },
        { month: 'Mar', production: 480, target: 500 },
        { month: 'Apr', production: 590, target: 500 },
        { month: 'May', production: 610, target: 500 },
        { month: 'Jun', production: 670, target: 500 }
    ];

    const energySourceData = [
        { name: 'Solar', value: 40, color: '#F59E0B' },
        { name: 'Wind', value: 35, color: '#6366F1' },
        { name: 'Hydro', value: 25, color: '#3B82F6' }
    ];

    const efficiencyData = [
        { day: 'Mon', pem: 68, alkaline: 62, soec: 85 },
        { day: 'Tue', pem: 70, alkaline: 64, soec: 87 },
        { day: 'Wed', pem: 69, alkaline: 63, soec: 86 },
        { day: 'Thu', pem: 71, alkaline: 65, soec: 88 },
        { day: 'Fri', pem: 72, alkaline: 66, soec: 89 },
        { day: 'Sat', pem: 70, alkaline: 64, soec: 87 },
        { day: 'Sun', pem: 69, alkaline: 63, soec: 86 }
    ];

    const storageStatus = [
        { name: 'Facility A', type: 'Compressed', capacity: 5000, current: 3800, utilization: 76, status: 'operational' },
        { name: 'Facility B', type: 'Liquid', capacity: 10000, current: 8200, utilization: 82, status: 'operational' },
        { name: 'Facility C', type: 'Underground', capacity: 50000, current: 32000, utilization: 64, status: 'operational' }
    ];

    const transportRoutes = [
        { id: 'RT-001', vehicle: 'Tube Trailer 1', destination: 'Industrial Park A', status: 'in_transit', eta: '2h 30m' },
        { id: 'RT-002', vehicle: 'Tanker 1', destination: 'Port Terminal', status: 'scheduled', eta: '4h 15m' },
        { id: 'RT-003', vehicle: 'Pipeline 1', destination: 'City Grid', status: 'active', eta: 'Continuous' }
    ];

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { user: currentUser } = await getCurrentUser();
            
            if (currentUser) {
                // Load user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, email')
                    .eq('id', currentUser.id)
                    .single();

                setUser({
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: profile?.full_name
                });

                // Load metrics
                const { data: metricsData } = await supabase
                    .from('system_metrics')
                    .select('*')
                    .eq('user_id', currentUser.id)
                    .order('metric_date', { ascending: false })
                    .limit(1)
                    .single();

                if (metricsData) {
                    setMetrics({
                        totalProduction: metricsData.total_production_kg || 3420,
                        totalEnergy: metricsData.total_energy_consumed_kwh || 134750,
                        carbonOffset: metricsData.total_carbon_offset_kg || 35910,
                        avgEfficiency: metricsData.average_efficiency_percent || 72,
                        activeFacilities: metricsData.active_facilities_count || 8,
                        storageUtilization: metricsData.storage_utilization_percent || 74
                    });
                }
            } else {
                setMetrics({
                    totalProduction: 3420,
                    totalEnergy: 134750,
                    carbonOffset: 35910,
                    avgEfficiency: 72,
                    activeFacilities: 8,
                    storageUtilization: 74
                });
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="p-4 md:p-8 space-y-8">
            {/* Header */}
            <div className="glassmorphic-strong rounded-2xl p-6">
                <h1 className="text-4xl font-bold gradient-text mb-2">
                    {user?.full_name ? `Welcome back, ${user.full_name}!` : 'Dashboard Overview'}
                </h1>
                <p className="text-gray-700">Monitor your green hydrogen production ecosystem in real-time</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                        <div className="glassmorphic-strong rounded-2xl p-6 text-center card-hover cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <p className="font-semibold text-gray-800">{action.label}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Total Production</CardTitle>
                        <Factory className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">{formatNumber(metrics.totalProduction, 0)} kg</div>
                        <p className="text-xs text-gray-600 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-green-600 font-medium">+12.5%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Energy Consumed</CardTitle>
                        <Zap className="w-4 h-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{formatNumber(metrics.totalEnergy, 0)} kWh</div>
                        <p className="text-xs text-gray-600 mt-2 flex items-center">
                            <TrendingUp className="w-3 h-3 mr-1 text-green-600" />
                            <span className="text-green-600 font-medium">+8.2%</span> renewable usage
                        </p>
                    </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Carbon Offset</CardTitle>
                        <Activity className="w-4 h-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{formatNumber(metrics.carbonOffset, 0)} kg</div>
                        <p className="text-xs text-gray-600 mt-2">CO₂ emissions prevented</p>
                    </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-700">Avg Efficiency</CardTitle>
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">{metrics.avgEfficiency}%</div>
                        <Progress value={metrics.avgEfficiency} className="mt-3" />
                    </CardContent>
                </Card>
            </div>

            {/* Production Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Production vs Target
                        </CardTitle>
                        <CardDescription>Monthly hydrogen production (kg)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={productionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="month" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                                <Legend />
                                <Bar dataKey="production" fill="#3B82F6" name="Actual" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="target" fill="#10B981" name="Target" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-600" />
                            Energy Source Distribution
                        </CardTitle>
                        <CardDescription>Renewable energy mix</CardDescription>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>

            {/* Electrolyzer Efficiency */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Electrolyzer Efficiency Comparison
                    </CardTitle>
                    <CardDescription>Weekly performance by electrolyzer type (%)</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
            </Card>

            {/* Storage Status */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5 text-purple-600" />
                        Storage Facilities Status
                    </CardTitle>
                    <CardDescription>Real-time storage capacity and utilization</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {storageStatus.map((facility, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/40 rounded-xl">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-semibold text-gray-800">{facility.name}</h4>
                                        <Badge className="bg-purple-100 text-purple-800 border-purple-200">{facility.type}</Badge>
                                        <Badge className="bg-green-100 text-green-800 border-green-200">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            {facility.status}
                                        </Badge>
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
                </CardContent>
            </Card>

            {/* Transportation Routes */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-orange-600" />
                        Active Transportation Routes
                    </CardTitle>
                    <CardDescription>Current hydrogen distribution status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {transportRoutes.map((route, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-white/40 rounded-xl hover:bg-white/60 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="font-semibold text-gray-800">{route.id}</span>
                                        <Badge className={
                                            route.status === 'in_transit' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                route.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    'bg-green-100 text-green-800 border-green-200'
                                        }>
                                            {route.status.replace('_', ' ')}
                                        </Badge>
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
                    <div className="mt-4 text-center">
                        <Link href="/transportation">
                            <Button variant="ghost" className="w-full border border-white/10">
                                View All Routes
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* System Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            Recent Alerts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>

                <Card className="glassmorphic-strong border-2 border-white/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-green-600" />
                            System Health
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                </Card>
            </div>

            {/* Renewable Energy Status */}
            <Card className="glassmorphic-strong border-2 border-white/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-green-600" />
                        Renewable Energy Sources Status
                    </CardTitle>
                    <CardDescription>Real-time energy generation from renewable sources</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sun className="w-6 h-6 text-yellow-600" />
                                    <h4 className="font-semibold text-gray-800">Solar Energy</h4>
                                </div>
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
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
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
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
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
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
                </CardContent>
            </Card>
        </div>
    );
}