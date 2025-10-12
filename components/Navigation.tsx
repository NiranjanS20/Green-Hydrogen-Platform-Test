'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from './LanguageSwitcher';

const Navigation: React.FC = () => {
	const router = useRouter();
	const [user, setUser] = useState<{ email?: string; full_name?: string } | null>(null);

	useEffect(() => {
		loadUser();

		// Listen for auth changes
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			if (session?.user) {
				loadUserProfile(session.user.id);
			} else {
				setUser(null);
			}
		});

		return () => subscription.unsubscribe();
	}, []);

	const loadUser = async () => {
		const { user: currentUser } = await getCurrentUser();
		if (currentUser) {
			await loadUserProfile(currentUser.id);
		}
	};

	const loadUserProfile = async (userId: string) => {
		const { data: profile } = await supabase
			.from('profiles')
			.select('full_name, email')
			.eq('id', userId)
			.single();

		if (profile) {
			setUser(profile);
		}
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push('/login');
	};

	return (
		<nav className="w-full glassmorphic-strong border-b border-white/20 sticky top-0 z-50 backdrop-blur-lg">
			<div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
				<Link href="/dashboard" className="text-xl font-bold gradient-text">
					🌿 Green Hydrogen Platform
				</Link>
				<div className="flex items-center gap-6">
					<Link href="/dashboard" className="text-sm text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
					<Link href="/production" className="text-sm text-gray-700 hover:text-blue-600 font-medium">Production</Link>
					<Link href="/storage" className="text-sm text-gray-700 hover:text-blue-600 font-medium">Storage</Link>
					<Link href="/transportation" className="text-sm text-gray-700 hover:text-blue-600 font-medium">Transportation</Link>
					
					<LanguageSwitcher />
					
					{user ? (
						<div className="flex items-center gap-3 pl-4 border-l border-gray-300">
							<div className="flex items-center gap-2 text-sm">
								<User className="w-4 h-4 text-blue-600" />
								<span className="font-medium text-gray-700">{user.full_name || user.email}</span>
							</div>
							<Button 
								variant="ghost" 
								onClick={handleSignOut}
								className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 text-sm"
							>
								<LogOut className="w-4 h-4 mr-1" />
								Sign Out
							</Button>
						</div>
					) : (
						<Link href="/login">
							<Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1.5 text-sm">
								Login
							</Button>
						</Link>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
