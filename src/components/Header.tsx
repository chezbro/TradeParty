'use client';
import { useState } from 'react';
import Link from 'next/link';
import supabase from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

export const Header = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // Get user on mount
    useState(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user);
        };
        getUser();
    });

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/sign-in');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-lg border-b border-white/5">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 
                            text-transparent bg-clip-text">
                            TradeParty
                        </span>
                    </Link>

                    {/* User Menu */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 hover:bg-white/5 px-3 py-2 rounded-lg 
                                    transition-colors duration-200"
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 
                                    flex items-center justify-center">
                                    {user.user_metadata?.avatar_url ? (
                                        <img
                                            src={user.user_metadata.avatar_url}
                                            alt={user.email}
                                            className="w-full h-full rounded-full"
                                        />
                                    ) : (
                                        <FaUser className="text-gray-400" />
                                    )}
                                </div>
                                <span className="text-sm text-white/80">
                                    {user.email?.split('@')[0]}
                                </span>
                            </button>

                            {/* Dropdown Menu */}
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 
                                    rounded-lg shadow-lg overflow-hidden">
                                    <Link
                                        href={`/profile/${user.id}`}
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 
                                            hover:bg-white/5 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FaUser className="text-blue-400" />
                                        My Profile
                                    </Link>

                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-2 px-4 py-3 text-sm text-white/80 
                                            hover:bg-white/5 transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <FaCog className="text-gray-400" />
                                        Settings
                                    </Link>

                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/80 
                                            hover:bg-white/5 transition-colors border-t border-white/5"
                                    >
                                        <FaSignOutAlt className="text-red-400" />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}; 