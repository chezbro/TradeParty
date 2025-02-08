"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaSearch, FaChartLine, FaGlobe, FaClock } from "react-icons/fa";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface LiveSession {
    id: string;
    name: string;
    host: {
        id: string;
        name: string;
        avatar_url: string;
    };
    category: string;
    viewers: number;
    tags: string[];
    started_at: string;
}

const categories = ["All", "Forex", "Crypto", "Stocks", "Commodities", "Options"];

export default function Discover() {
    const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchLiveSessions = async () => {
            const { data: meetings } = await supabase
                .from('meetings')
                .select(`
                    id,
                    name,
                    created_by,
                    created_at,
                    user_profiles!inner (
                        first_name,
                        last_name,
                        avatar_url
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (meetings) {
                const sessionsWithViewers = await Promise.all(
                    meetings.map(async (meeting) => {
                        // Get real-time viewer count from your socket/Stream service
                        // This is just a placeholder
                        const viewers = Math.floor(Math.random() * 1000);

                        return {
                            id: meeting.id,
                            name: meeting.name,
                            host: {
                                id: meeting.created_by,
                                name: meeting.user_profiles.length > 0 
                                    ? `${meeting.user_profiles[0].first_name} ${meeting.user_profiles[0].last_name}`
                                    : 'Anonymous Host',
                                avatar_url: meeting.user_profiles[0]?.avatar_url
                            },
                            category: 'Trading', // You might want to add a category field to meetings
                            viewers,
                            tags: [], // You might want to add a tags table/field
                            started_at: meeting.created_at
                        };
                    })
                );

                setLiveSessions(sessionsWithViewers);
            }
        };

        fetchLiveSessions();
        
        // Set up real-time subscription
        const channel = supabase
            .channel('meetings_changes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'meetings' },
                () => {
                    fetchLiveSessions();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    // Filter sessions based on category and search query
    const filteredSessions = liveSessions.filter(session => {
        // Category filter
        const matchesCategory = selectedCategory === "All" || session.category === selectedCategory;
        
        // Search filter - case insensitive
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === "" || 
            session.name.toLowerCase().includes(searchLower) ||
            session.host.name.toLowerCase().includes(searchLower) ||
            session.tags.some(tag => tag.toLowerCase().includes(searchLower));

        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-[#0F172A]">
            {/* Hero Section with Search */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-teal-500/10 border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Discover Live Trading Sessions
                        </h1>
                        <p className="text-xl text-gray-400 mb-8">
                            Join live trading rooms and learn from experienced traders
                        </p>
                        
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search by title, host, or tags..."
                                    className="w-full pl-12 pr-4 py-4 bg-[#1E293B] border border-gray-700 rounded-xl 
                                             text-white focus:outline-none focus:border-indigo-500 transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Categories */}
                <div className="flex overflow-x-auto gap-4 mb-8 pb-4 scrollbar-hide">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap
                                ${selectedCategory === category
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-[#1E293B] text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400'
                                } transition-all duration-200`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Live Sessions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSessions.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <p className="text-gray-400 text-lg">
                                No trading sessions found matching your criteria.
                            </p>
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <motion.div
                                key={session.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-[#1E293B] rounded-xl overflow-hidden border border-gray-800 hover:border-indigo-500/50 transition-all duration-200"
                            >
                                <div className="p-6">
                                    {/* Host Info */}
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={session.host.avatar_url}
                                            alt={session.host.name}
                                            className="w-10 h-10 rounded-full border-2 border-indigo-500"
                                        />
                                        <div className="ml-3">
                                            <h3 className="text-white font-medium">{session.host.name}</h3>
                                            <span className="text-indigo-400 text-sm">{session.category}</span>
                                        </div>
                                    </div>

                                    {/* Session Title */}
                                    <h2 className="text-xl font-semibold text-white mb-3">
                                        {session.name}
                                    </h2>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {session.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-gray-400 text-sm">
                                        <div className="flex items-center">
                                            <FaUsers className="mr-2" />
                                            {session.viewers} viewers
                                        </div>
                                        <div className="flex items-center">
                                            <FaClock className="mr-2" />
                                            {new Date(session.started_at).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
} 