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
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface UserProfile {
  username: string;
  first_name: string;
  last_name: string;
  bio: string;
  twitter_url: string;
  website_url: string;
  linkedin_url: string;
}

interface TradingStats {
  win_rate: number;
  total_trades: number;
  profit_factor: number;
  average_rr: number;
  monthly_return: number;
  meetings_hosted: number;
  meetings_participated: number;
  total_meeting_hours: number;
}

export default function ProfileContent() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch trading stats
      const { data: statsData } = await supabase
        .from('trading_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (statsData) {
        setStats(statsData);
      }

      // Fetch follower counts
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('following_id', userId);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact' })
        .eq('follower_id', userId);

      setFollowers(followersCount || 0);
      setFollowing(followingCount || 0);

      // Check if current user is following
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: followData } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', userId)
          .single();

        setIsFollowing(!!followData);
      }
    };

    fetchProfileData();
  }, [userId, supabase]);

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
              {profile?.first_name[0]}
            </div>
            
            <div className="flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">{profile?.first_name} {profile?.last_name}</h1>
                  <p className="text-blue-400 mb-3">{profile?.username}</p>
                  <p className="text-gray-400 max-w-2xl mb-4">{profile?.bio}</p>
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
                  <span>{followers.toLocaleString()} followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-gray-500" />
                  <span>{stats?.total_trades.toLocaleString()} trades</span>
                </div>
                <div className="flex gap-4 text-gray-400">
                  <a href={profile?.twitter_url} className="hover:text-blue-400 transition-colors">
                    <FaTwitter size={20} />
                  </a>
                  <a href={profile?.website_url} className="hover:text-blue-400 transition-colors">
                    <FaGlobe size={20} />
                  </a>
                  <a href={profile?.linkedin_url} className="hover:text-blue-400 transition-colors">
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
            { label: "Win Rate", value: `${stats?.win_rate}%`, color: "from-green-500/20 to-green-600/20" },
            { label: "Profit Factor", value: stats?.profit_factor, color: "from-blue-500/20 to-blue-600/20" },
            { label: "Avg R:R", value: stats?.average_rr, color: "from-purple-500/20 to-purple-600/20" },
            { label: "Monthly Return", value: `${stats?.monthly_return}%`, color: "from-yellow-500/20 to-yellow-600/20" },
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
              <p className="text-2xl font-bold text-white">{stats?.meetings_hosted}</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Meetings Joined</h3>
              <p className="text-2xl font-bold text-white">{stats?.meetings_participated}</p>
            </div>
            <div className="bg-gray-800/40 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-gray-400 text-sm mb-1">Total Hours</h3>
              <p className="text-2xl font-bold text-white">{stats?.total_meeting_hours}</p>
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
                {/* Add trade data fetching and rendering logic here */}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 