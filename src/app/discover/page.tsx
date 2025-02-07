"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FaUsers, FaSearch, FaChartLine, FaGlobe, FaClock } from "react-icons/fa";

// Sample data - replace with real data later
const liveSessions = [
    {
        id: 1,
        title: "EUR/USD TradeParty",
        host: "Sarah Chen",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        category: "Forex",
        viewers: 234,
        tags: ["EUR/USD", "Technical Analysis", "Swing Trading"],
        timeRunning: "2h 15m"
    },
    {
        id: 2,
        title: "BTC TradeParty",
        host: "Alex Rivera",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
        category: "Crypto",
        viewers: 567,
        tags: ["Bitcoin", "Technical Analysis", "Spot Trading"],
        timeRunning: "45m"
    },
    {
        id: 3,
        title: "TSLA TradeParty",
        host: "Michael Chang",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
        category: "Stocks",
        viewers: 892,
        tags: ["Tesla", "Options", "Day Trading"],
        timeRunning: "1h 30m"
    },
    {
        id: 4,
        title: "AAPL TradeParty",
        host: "Emma Wilson",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
        category: "Stocks",
        viewers: 445,
        tags: ["Apple", "Earnings", "Swing Trading"],
        timeRunning: "55m"
    },
    {
        id: 5,
        title: "ETH TradeParty",
        host: "David Kumar",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        category: "Crypto",
        viewers: 1243,
        tags: ["Ethereum", "DeFi", "Technical Analysis"],
        timeRunning: "3h 10m"
    },
    {
        id: 6,
        title: "AMD TradeParty",
        host: "Lisa Anderson",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
        category: "Stocks",
        viewers: 328,
        tags: ["AMD", "Semiconductors", "Options"],
        timeRunning: "1h 15m"
    },
    {
        id: 7,
        title: "PLTR TradeParty",
        host: "Ryan Martinez",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan",
        category: "Stocks",
        viewers: 556,
        tags: ["Palantir", "AI Stocks", "Technical Analysis"],
        timeRunning: "2h 05m"
    },
    {
        id: 8,
        title: "XRP TradeParty",
        host: "Sophie Taylor",
        hostImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
        category: "Crypto",
        viewers: 673,
        tags: ["Ripple", "SEC News", "Price Action"],
        timeRunning: "4h 20m"
    }
];

const categories = ["All", "Forex", "Crypto", "Stocks", "Commodities", "Options"];

export default function Discover() {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    // Filter sessions based on category and search query
    const filteredSessions = liveSessions.filter(session => {
        // Category filter
        const matchesCategory = selectedCategory === "All" || session.category === selectedCategory;
        
        // Search filter - case insensitive
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery === "" || 
            session.title.toLowerCase().includes(searchLower) ||
            session.host.toLowerCase().includes(searchLower) ||
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
                                            src={session.hostImage}
                                            alt={session.host}
                                            className="w-10 h-10 rounded-full border-2 border-indigo-500"
                                        />
                                        <div className="ml-3">
                                            <h3 className="text-white font-medium">{session.host}</h3>
                                            <span className="text-indigo-400 text-sm">{session.category}</span>
                                        </div>
                                    </div>

                                    {/* Session Title */}
                                    <h2 className="text-xl font-semibold text-white mb-3">
                                        {session.title}
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
                                            {session.timeRunning}
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