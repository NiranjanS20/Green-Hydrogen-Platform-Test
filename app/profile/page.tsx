'use client';

import { useEffect, useState } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, User, Save, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string; status?: string } } | null>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    role: 'operator',
    organization: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      
      // Load profile data from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          email: profileData.email || currentUser.email || '',
          role: profileData.role || 'operator',
          organization: profileData.organization || ''
        });
      } else {
        // Create profile if doesn't exist
        await supabase
          .from('profiles')
          .insert([{
            id: currentUser.id,
            email: currentUser.email,
            full_name: '',
            role: 'operator',
            organization: ''
          }]);
        
        setProfile({
          full_name: '',
          email: currentUser.email || '',
          role: 'operator',
          organization: ''
        });
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Check if user is requesting admin role
      let finalRole = profile.role;
      let adminStatus = 'active';
      
      if (profile.role === 'admin') {
        // Check if there's already an active admin
        const { data: existingAdmin } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('role', 'admin')
          .eq('admin_status', 'active')
          .neq('id', user.id)
          .single();

        if (existingAdmin) {
          // Set as pending admin if another admin exists
          adminStatus = 'pending';
          alert('Admin role request submitted. Current admin will review your request.');
        } else {
          // First admin or no active admin exists
          adminStatus = 'active';
          alert('Admin role granted! You now have administrative privileges.');
        }
      }

      // Prepare profile data
      const profileData: any = {
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        role: finalRole,
        organization: profile.organization,
        updated_at: new Date().toISOString()
      };

      // Only add admin_status if role is admin
      if (finalRole === 'admin') {
        profileData.admin_status = adminStatus;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;
      
      if (profile.role !== 'admin') {
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile...</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <Input 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input value={profile.email} disabled className="pl-10" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Role</label>
            <select 
              value={profile.role} 
              onChange={(e) => setProfile({...profile, role: e.target.value})}
              className="w-full p-2 border rounded-md"
            >
              <option value="operator">Operator</option>
              <option value="manager">Manager</option>
              <option value="engineer">Engineer</option>
              <option value="admin">Admin (Pending Approval)</option>
            </select>
            {profile.role === 'admin' && (
              <p className="text-sm text-amber-600 mt-1">
                ⚠️ Admin role requires approval from current admin
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium">Organization</label>
            <Input 
              value={profile.organization} 
              onChange={(e) => setProfile({...profile, organization: e.target.value})} 
              placeholder="Enter your organization"
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="ghost" className="border border-white/10" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
