'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FaChartLine, 
  FaUsers, 
  FaStar, 
  FaUserPlus, 
  FaUserCheck,
  FaTwitter,
  FaGlobe,
  FaLinkedin
} from 'react-icons/fa';

// Dummy data for demonstration
const dummyProfile = {
  name: "Alex Thompson",
  handle: "@alextrader",
  bio: "Professional Forex & Crypto trader. 8 years of experience in technical analysis and market psychology.",
  winRate: 68,
  totalTrades: 1247,
  profitFactor: 2.4,
  averageRR: 1.8,
  monthlyReturn: 12.5,
  followers: 1432,
  following: 891,
  socialLinks: {
    twitter: "https://twitter.com/alextrader",
    website: "https://alexthompson.trade",
    linkedin: "https://linkedin.com/in/alextrader"
  },
  meetings: {
    hosted: 47,
    participated: 156,
    upcomingMeetings: 3,
    totalHours: 204
  }
};

const recentTrades = [
  { pair: "BTC/USD", type: "LONG", entry: 43250, exit: 44800, profit: 3.6, date: "2024-03-15" },
  { pair: "ETH/USD", type: "SHORT", entry: 3200, exit: 3050, profit: 4.7, date: "2024-03-14" },
  { pair: "EUR/USD", type: "LONG", entry: 1.0850, exit: 1.0920, profit: 2.1, date: "2024-03-13" },
];

export default function ProfileContent() {
  const { userId } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 mb-8 border border-gray-700/50"
        >
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 
              flex items-center justify-center text-5xl font-bold text-white">
              {dummyProfile.name[0]}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{dummyProfile.name}</h1>
                  <p className="text-blue-400 mb-3">{dummyProfile.handle}</p>
                  <p className="text-gray-400 max-w-2xl mb-4">{dummyProfile.bio}</p>
                </div>
                
                <button
                  onClick={() => setIsFollowing(!isFollowing)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2
                    ${isFollowing 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-blue-500 hover:bg-blue-600'}`}
                >
                  {isFollowing ? (
                    <>
                      <FaUserCheck />
                      Following
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      Follow
                    </>
                  )}
                </button>
              </div>
              
              <div className="flex gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <FaUsers className="text-gray-500" />
                  <span>{dummyProfile.followers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-gray-500" />
                  <span>{dummyProfile.totalTrades.toLocaleString()} trades</span>
                </div>
                <div className="flex gap-4 text-gray-400">
                  <a href={dummyProfile.socialLinks.twitter} className="hover:text-blue-400 transition-colors">
                    <FaTwitter size={20} />
                  </a>
                  <a href={dummyProfile.socialLinks.website} className="hover:text-blue-400 transition-colors">
                    <FaGlobe size={20} />
                  </a>
                  <a href={dummyProfile.socialLinks.linkedin} className="hover:text-blue-400 transition-colors">
                    <FaLinkedin size={20} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Win Rate", value: `${dummyProfile.winRate}%`, color: "from-green-500/20 to-green-600/20" },
            { label: "Profit Factor", value: dummyProfile.profitFactor, color: "from-blue-500/20 to-blue-600/20" },
            { label: "Avg R:R", value: dummyProfile.averageRR, color: "from-purple-500/20 to-purple-600/20" },
            { label: "Monthly Return", value: `${dummyProfile.monthlyReturn}%`, color: "from-yellow-500/20 to-yellow-600/20" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-white/10`}
            >
              <h3 className="text-gray-400 mb-2">{stat.label}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Add TradeParty Meetings Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-2xl p-6 border border-indigo-500/20 mb-8"
        >
          <h2 className="text-xl font-bold mb-6">TradeParty Engagement</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Meetings Hosted</h3>
              <p className="text-2xl font-bold text-white">{dummyProfile.meetings.hosted}</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Meetings Joined</h3>
              <p className="text-2xl font-bold text-white">{dummyProfile.meetings.participated}</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Upcoming Meetings</h3>
              <p className="text-2xl font-bold text-white">{dummyProfile.meetings.upcomingMeetings}</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Total Hours</h3>
              <p className="text-2xl font-bold text-white">{dummyProfile.meetings.totalHours}</p>
            </div>
          </div>
        </motion.div>

        {/* Recent Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50"
        >
          <h2 className="text-xl font-bold mb-6">Recent Trades</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  <th className="pb-4 text-left">Pair</th>
                  <th className="pb-4 text-left">Type</th>
                  <th className="pb-4 text-right">Entry</th>
                  <th className="pb-4 text-right">Exit</th>
                  <th className="pb-4 text-right">Profit (%)</th>
                  <th className="pb-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade, index) => (
                  <tr key={index} className="border-b border-gray-700/50">
                    <td className="py-4">{trade.pair}</td>
                    <td className={`py-4 ${trade.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.type}
                    </td>
                    <td className="py-4 text-right">{trade.entry}</td>
                    <td className="py-4 text-right">{trade.exit}</td>
                    <td className="py-4 text-right text-green-400">+{trade.profit}%</td>
                    <td className="py-4 text-right text-gray-400">{trade.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 