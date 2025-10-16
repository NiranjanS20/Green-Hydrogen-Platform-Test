'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '@heroui/react';
import { Input } from '@heroui/react';
import { Chip } from '@heroui/react';
import { Download, Lock, Eye, Database, Factory, Zap, Truck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatNumber, formatDate } from '@/lib/utils';

const ADMIN_PASSWORD = 'M@nthan290719';
const SESSION_TIMEOUT = 60000; // 1 minute in milliseconds

interface AdminData {
  production: Record<string, unknown>[];
  storage: Record<string, unknown>[];
  renewable: Record<string, unknown>[];
  transport: Record<string, unknown>[];
  users: Record<string, unknown>[];
  pendingAdmins: Record<string, unknown>[];
  pendingApprovals: {
    production: Record<string, unknown>[];
    storage: Record<string, unknown>[];
    renewable: Record<string, unknown>[];
    transport: Record<string, unknown>[];
  };
  alerts: Record<string, unknown>[];
  totalStats: {
    totalProduction: number;
    totalStorage: number;
    totalRenewable: number;
    totalUsers: number;
    totalFacilities: number;
    totalEnergyProduced: number;
    pendingApprovals: number;
  };
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminData>({
    production: [],
    storage: [],
    renewable: [],
    transport: [],
    users: [],
    pendingAdmins: [],
    pendingApprovals: {
      production: [],
      storage: [],
      renewable: [],
      transport: []
    },
    alerts: [],
    totalStats: {
      totalProduction: 0,
      totalStorage: 0,
      totalRenewable: 0,
      totalUsers: 0,
      totalFacilities: 0,
      totalEnergyProduced: 0,
      pendingApprovals: 0
    }
  });

  // Session timeout check
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTimeout = () => {
      if (Date.now() - lastActivity > SESSION_TIMEOUT) {
        setIsAuthenticated(false);
        setPassword('');
      }
    };

    const interval = setInterval(checkTimeout, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [isAuthenticated, lastActivity]);

  // Track page activity
  useEffect(() => {
    const handleActivity = () => setLastActivity(Date.now());
    
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, []);

  // Auto-lock when navigating away
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      setLastActivity(Date.now());
      loadAllData();
    } else {
      setError('Invalid password');
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      console.log('Loading admin data...');
      
      // Check if user is admin first
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        console.error('No authenticated user');
        return;
      }

      // Load all production facilities (admin sees all data)
      const { data: production, error: prodError } = await supabase
        .from('production_facilities')
        .select('*');
      
      console.log('Production query result:', { production, prodError });

      // Load all storage facilities (admin sees all data)
      const { data: storage, error: storageError } = await supabase
        .from('storage_facilities')
        .select('*');
      
      console.log('Storage query result:', { storage, storageError });

      // Load all renewable sources (admin sees all data)
      const { data: renewable, error: renewableError } = await supabase
        .from('renewable_sources')
        .select('*');
      
      console.log('Renewable query result:', { renewable, renewableError });

      // Load all transport routes (admin sees all data)
      const { data: transport, error: transportError } = await supabase
        .from('transport_routes')
        .select('*');
      
      console.log('Transport query result:', { transport, transportError });

      // Load user profiles
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) console.error('Users error:', usersError);
      console.log('Users:', users);

      // Load pending admin requests
      const { data: pendingAdmins, error: pendingError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .eq('admin_status', 'pending');
      
      if (pendingError) console.error('Pending admins error:', pendingError);
      console.log('Pending admins:', pendingAdmins);

      // Load pending facility approvals
      const { data: pendingProduction } = await supabase
        .from('production_facilities')
        .select('*, profiles!production_facilities_user_id_fkey(full_name, email)')
        .eq('approval_status', 'pending');

      const { data: pendingStorage } = await supabase
        .from('storage_facilities')
        .select('*, profiles!storage_facilities_user_id_fkey(full_name, email)')
        .eq('approval_status', 'pending');

      const { data: pendingRenewable } = await supabase
        .from('renewable_sources')
        .select('*, profiles!renewable_sources_user_id_fkey(full_name, email)')
        .eq('approval_status', 'pending');

      const { data: pendingTransport } = await supabase
        .from('transport_routes')
        .select('*, profiles!transport_routes_user_id_fkey(full_name, email)')
        .eq('approval_status', 'pending');

      // Load alerts
      const { data: alerts } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Calculate total stats
      const pendingApprovalsCount = (pendingProduction?.length || 0) + 
                                   (pendingStorage?.length || 0) + 
                                   (pendingRenewable?.length || 0) + 
                                   (pendingTransport?.length || 0);

      const totalStats = {
        totalProduction: production?.reduce((sum, f) => sum + (f.capacity_kg_per_day || 0), 0) || 0,
        totalStorage: storage?.reduce((sum, f) => sum + (f.capacity_kg || 0), 0) || 0,
        totalRenewable: renewable?.reduce((sum, f) => sum + (f.capacity_mw || 0), 0) || 0,
        totalUsers: users?.length || 0,
        totalFacilities: (production?.length || 0) + (storage?.length || 0),
        totalEnergyProduced: renewable?.reduce((sum, f) => sum + (f.energy_produced_kwh || 0), 0) || 0,
        pendingApprovals: pendingApprovalsCount
      };

      setData({
        production: production || [],
        storage: storage || [],
        renewable: renewable || [],
        transport: transport || [],
        users: users || [],
        pendingAdmins: pendingAdmins || [],
        pendingApprovals: {
          production: pendingProduction || [],
          storage: pendingStorage || [],
          renewable: pendingRenewable || [],
          transport: pendingTransport || []
        },
        alerts: alerts || [],
        totalStats
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAllData = () => {
    const allData = {
      production_facilities: data.production,
      storage_facilities: data.storage,
      renewable_sources: data.renewable,
      transport_routes: data.transport,
      users: data.users,
      summary: data.totalStats
    };

    const json = JSON.stringify(allData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `green_hydrogen_platform_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // User management functions
  const approveAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ admin_status: 'active' })
        .eq('id', userId);

      if (error) throw error;
      
      alert('Admin approved successfully!');
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error approving admin:', error);
      alert('Failed to approve admin');
    }
  };

  const rejectAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: 'operator',
          admin_status: null 
        })
        .eq('id', userId);

      if (error) throw error;
      
      alert('Admin request rejected');
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting admin:', error);
      alert('Failed to reject admin request');
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          admin_status: newRole === 'admin' ? 'active' : null
        })
        .eq('id', userId);

      if (error) throw error;
      
      alert(`User role changed to ${newRole}`);
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Failed to change user role');
    }
  };

  const removeUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      alert('User removed successfully');
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user');
    }
  };

  // Facility approval functions
  const approveFacility = async (facilityId: string, tableName: string, facilityName: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from(tableName)
        .update({ 
          approval_status: 'approved',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', facilityId);

      if (error) throw error;
      
      alert(`${facilityName} approved successfully!`);
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error approving facility:', error);
      alert('Failed to approve facility');
    }
  };

  const rejectFacility = async (facilityId: string, tableName: string, facilityName: string, reason?: string) => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { error } = await supabase
        .from(tableName)
        .update({ 
          approval_status: 'rejected',
          approved_by: currentUser.id,
          approved_at: new Date().toISOString(),
          rejection_reason: reason || 'No reason provided'
        })
        .eq('id', facilityId);

      if (error) throw error;
      
      alert(`${facilityName} rejected`);
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error rejecting facility:', error);
      alert('Failed to reject facility');
    }
  };

  const authorizeTransportRoute = async (routeId: string) => {
    try {
      const { error } = await supabase
        .from('transport_routes')
        .update({ 
          admin_authorized: true,
          approval_status: 'approved'
        })
        .eq('id', routeId);

      if (error) throw error;
      
      alert('Transport route authorized successfully!');
      loadAllData(); // Refresh data
    } catch (error) {
      console.error('Error authorizing transport route:', error);
      alert('Failed to authorize transport route');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 justify-center">
              <Lock className="w-6 h-6 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Access</h1>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="w-full"
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button 
              onClick={handleLogin}
              className="w-full bg-red-600 text-white"
              disabled={!password}
            >
              <Eye className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-red-600">🔒 Admin Dashboard</h1>
          <p className="text-gray-600">System-wide monitoring and data export</p>
        </div>
        <div className="flex gap-2">
          <Chip color="warning" variant="flat">
            Session: {Math.ceil((SESSION_TIMEOUT - (Date.now() - lastActivity)) / 1000)}s
          </Chip>
          <Button 
            onClick={exportAllData}
            className="bg-green-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All Data
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardBody className="text-center">
            <Factory className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold">Total Production</h3>
            <p className="text-2xl font-bold text-blue-600">{formatNumber(data.totalStats.totalProduction, 0)} kg/day</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="text-center">
            <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="font-semibold">Total Storage</h3>
            <p className="text-2xl font-bold text-purple-600">{formatNumber(data.totalStats.totalStorage, 0)} kg</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold">Renewable Energy</h3>
            <p className="text-2xl font-bold text-green-600">{formatNumber(data.totalStats.totalRenewable, 0)} MW</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="font-semibold">Energy Produced</h3>
            <p className="text-2xl font-bold text-yellow-600">{formatNumber(data.totalStats.totalEnergyProduced, 0)} kWh</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold">Transport Routes</h3>
            <p className="text-2xl font-bold text-orange-600">{data.transport.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <Eye className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h3 className="font-semibold">Total Users</h3>
            <p className="text-2xl font-bold text-gray-600">{data.totalStats.totalUsers}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="text-center">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <h3 className="font-semibold">Pending Approvals</h3>
            <p className="text-2xl font-bold text-amber-600">{data.totalStats.pendingApprovals}</p>
          </CardBody>
        </Card>
      </div>

      {/* Data Export Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Data */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Factory className="w-5 h-5 text-blue-600" />
              Production Facilities ({data.production.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.production.slice(0, 5).map((facility: any) => (
                <div key={facility.id} className="flex justify-between text-sm">
                  <span>{facility.name}</span>
                  <span>{facility.capacity_kg_per_day} kg/day</span>
                </div>
              ))}
              {data.production.length > 5 && (
                <p className="text-xs text-gray-500">...and {data.production.length - 5} more</p>
              )}
            </div>
            <Button 
              onClick={() => exportToCSV(data.production, 'production_facilities')}
              className="w-full mt-4 bg-blue-600 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Production Data
            </Button>
          </CardBody>
        </Card>

        {/* Storage Data */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-600" />
              Storage Facilities ({data.storage.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.storage.slice(0, 5).map((facility: any) => (
                <div key={facility.id} className="flex justify-between text-sm">
                  <span>{facility.name}</span>
                  <span>{facility.capacity_kg} kg</span>
                </div>
              ))}
              {data.storage.length > 5 && (
                <p className="text-xs text-gray-500">...and {data.storage.length - 5} more</p>
              )}
            </div>
            <Button 
              onClick={() => exportToCSV(data.storage, 'storage_facilities')}
              className="w-full mt-4 bg-purple-600 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Storage Data
            </Button>
          </CardBody>
        </Card>

        {/* Renewable Energy Data */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Renewable Sources ({data.renewable.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.renewable.slice(0, 5).map((source: any) => (
                <div key={source.id} className="flex justify-between text-sm">
                  <span>{source.name} ({source.source_type})</span>
                  <span>{source.capacity_mw} MW</span>
                </div>
              ))}
              {data.renewable.length > 5 && (
                <p className="text-xs text-gray-500">...and {data.renewable.length - 5} more</p>
              )}
            </div>
            <Button 
              onClick={() => exportToCSV(data.renewable, 'renewable_sources')}
              className="w-full mt-4 bg-green-600 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Renewable Data
            </Button>
          </CardBody>
        </Card>

        {/* Transport Data */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              Transport Routes ({data.transport.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {data.transport.slice(0, 5).map((route: any) => (
                <div key={route.id} className="flex justify-between text-sm">
                  <span>{route.route_name}</span>
                  <span>{route.distance_km} km</span>
                </div>
              ))}
              {data.transport.length > 5 && (
                <p className="text-xs text-gray-500">...and {data.transport.length - 5} more</p>
              )}
            </div>
            <Button 
              onClick={() => exportToCSV(data.transport, 'transport_routes')}
              className="w-full mt-4 bg-orange-600 text-white"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Transport Data
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Pending Facility Approvals */}
      {data.totalStats.pendingApprovals > 0 && (
        <Card className="border-2 border-amber-200 bg-amber-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pending Facility Approvals ({data.totalStats.pendingApprovals})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Production Facilities */}
              {data.pendingApprovals.production.length > 0 && (
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Factory className="w-4 h-4" />
                    Production Facilities ({data.pendingApprovals.production.length})
                  </h4>
                  <div className="space-y-3">
                    {data.pendingApprovals.production.map((facility: any) => (
                      <div key={facility.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-semibold">{facility.name}</h5>
                          <p className="text-sm text-gray-600">{facility.location} • {facility.electrolyzer_type}</p>
                          <p className="text-xs text-gray-500">Capacity: {facility.capacity_kg_per_day} kg/day</p>
                          <p className="text-xs text-gray-500">Requested by: {facility.profiles?.full_name || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approveFacility(facility.id, 'production_facilities', facility.name)}
                            color="success"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => rejectFacility(facility.id, 'production_facilities', facility.name)}
                            color="danger"
                            variant="bordered"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Facilities */}
              {data.pendingApprovals.storage.length > 0 && (
                <div>
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    Storage Facilities ({data.pendingApprovals.storage.length})
                  </h4>
                  <div className="space-y-3">
                    {data.pendingApprovals.storage.map((facility: any) => (
                      <div key={facility.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-semibold">{facility.name}</h5>
                          <p className="text-sm text-gray-600">{facility.location} • {facility.storage_type}</p>
                          <p className="text-xs text-gray-500">Capacity: {facility.capacity_kg} kg</p>
                          <p className="text-xs text-gray-500">Requested by: {facility.profiles?.full_name || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approveFacility(facility.id, 'storage_facilities', facility.name)}
                            color="success"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => rejectFacility(facility.id, 'storage_facilities', facility.name)}
                            color="danger"
                            variant="bordered"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Renewable Sources */}
              {data.pendingApprovals.renewable.length > 0 && (
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Renewable Sources ({data.pendingApprovals.renewable.length})
                  </h4>
                  <div className="space-y-3">
                    {data.pendingApprovals.renewable.map((facility: any) => (
                      <div key={facility.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-semibold">{facility.name}</h5>
                          <p className="text-sm text-gray-600">{facility.location} • {facility.source_type}</p>
                          <p className="text-xs text-gray-500">Capacity: {facility.capacity_mw} MW</p>
                          <p className="text-xs text-gray-500">Requested by: {facility.profiles?.full_name || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => approveFacility(facility.id, 'renewable_sources', facility.name)}
                            color="success"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            onClick={() => rejectFacility(facility.id, 'renewable_sources', facility.name)}
                            color="danger"
                            variant="bordered"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transport Routes */}
              {data.pendingApprovals.transport.length > 0 && (
                <div>
                  <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Transport Routes ({data.pendingApprovals.transport.length})
                  </h4>
                  <div className="space-y-3">
                    {data.pendingApprovals.transport.map((route: any) => (
                      <div key={route.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                        <div>
                          <h5 className="font-semibold">{route.route_name}</h5>
                          <p className="text-sm text-gray-600">{route.origin} → {route.destination}</p>
                          <p className="text-xs text-gray-500">{route.distance_km} km • {route.transport_type}</p>
                          <p className="text-xs text-gray-500">Requested by: {route.profiles?.full_name || 'Unknown'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => authorizeTransportRoute(route.id)}
                            color="success"
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Authorize
                          </Button>
                          <Button 
                            onClick={() => rejectFacility(route.id, 'transport_routes', route.route_name)}
                            color="danger"
                            variant="bordered"
                            size="sm"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Pending Admin Requests */}
      {data.pendingAdmins.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pending Admin Requests ({data.pendingAdmins.length})
            </h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {data.pendingAdmins.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h4 className="font-semibold">{user.full_name || 'Unknown User'}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">{user.organization || 'No organization'}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => approveAdmin(user.id)}
                      color="success"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => rejectAdmin(user.id)}
                      color="danger"
                      variant="bordered"
                      size="sm"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Users Management Table */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">User Management ({data.users.length})</h3>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Organization</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Joined</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((user: any) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{user.full_name || 'N/A'}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.organization || 'N/A'}</td>
                    <td className="p-2">
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                      >
                        <option value="operator">Operator</option>
                        <option value="manager">Manager</option>
                        <option value="engineer">Engineer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-2">
                      <Chip 
                        size="sm" 
                        color={
                          user.role === 'admin' && user.admin_status === 'active' ? 'success' :
                          user.role === 'admin' && user.admin_status === 'pending' ? 'warning' :
                          'primary'
                        } 
                        variant="flat"
                      >
                        {user.role === 'admin' ? `${user.role} (${user.admin_status || 'active'})` : user.role}
                      </Chip>
                    </td>
                    <td className="p-2">{formatDate(user.created_at)}</td>
                    <td className="p-2">
                      <Button 
                        onClick={() => removeUser(user.id)}
                        color="danger"
                        variant="light"
                        size="sm"
                        isDisabled={user.role === 'admin' && user.admin_status === 'active'}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button 
            onClick={() => exportToCSV(data.users, 'system_users')}
            className="mt-4 bg-gray-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Users Data
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
