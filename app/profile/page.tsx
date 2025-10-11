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
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { user: currentUser } = await getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setEmail(currentUser.email);
      setName(currentUser.user_metadata?.full_name || '');
      setStatus(currentUser.user_metadata?.status || 'active');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, status },
    });
    setSaving(false);
    if (!error) {
      alert('Profile updated!');
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
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={email} disabled icon={<Mail className="w-4 h-4 text-gray-500" />} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
