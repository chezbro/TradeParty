'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase-client';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user);
        };
        getUser();
    }, []);

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
            <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400">Email</label>
                        <div className="text-white">{user.email}</div>
                    </div>
                    {/* Add more settings as needed */}
                </div>
            </div>
        </div>
    );
} 