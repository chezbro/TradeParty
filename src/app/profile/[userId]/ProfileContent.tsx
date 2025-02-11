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
  FaLinkedin,
  FaEdit
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
  id: string;
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

interface EditForm extends UserProfile, TradingStats {}

export default function ProfileContent() {
  const params = useParams<{ userId: string }>();
  const userId = params?.userId; // Safely access userId with optional chaining
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [followers, setFollowers] = useState<number>(0);
  const [following, setFollowing] = useState<number>(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const supabase = createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  // Add early return if no userId is present
  if (!userId) {
    return null;
  }

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsOwnProfile(session?.user?.id === userId);
    };

    checkCurrentUser();
  }, [userId, supabase]);

  useEffect(() => {
    const fetchProfileData = async () => {
      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      // Fetch trading stats
      const { data: statsData } = await supabase
        .from('trading_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData && statsData) {
        setProfile(profileData);
        setStats(statsData);
        // Combine both profile and stats data for the edit form
        setEditForm({ ...profileData, ...statsData });
      } else {
        // Initialize with default values if no data exists
        const defaultStats = {
          win_rate: 0,
          total_trades: 0,
          profit_factor: 0,
          average_rr: 0,
          monthly_return: 0,
          meetings_hosted: 0,
          meetings_participated: 0,
          total_meeting_hours: 0
        };
        setStats(defaultStats);
        setEditForm({ ...profileData, ...defaultStats });
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      console.log('Current user:', session.user.id);
      console.log('Profile ID:', userId);
      console.log('Updating profile with:', editForm);

      // First update the profile
      const { error: profileError, data: profileResult } = await supabase
        .from('user_profiles')
        .update({
          username: editForm.username,
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          bio: editForm.bio,
          twitter_url: editForm.twitter_url,
          website_url: editForm.website_url,
          linkedin_url: editForm.linkedin_url
        })
        .eq('id', session.user.id)  // Use session.user.id instead of userId
        .select()
        .single();

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Then update or insert the stats
      const { error: statsError, data: statsResult } = await supabase
        .from('trading_stats')
        .upsert({
          user_id: session.user.id,  // Use session.user.id instead of userId
          win_rate: editForm.win_rate || 0,
          total_trades: editForm.total_trades || 0,
          profit_factor: editForm.profit_factor || 0,
          average_rr: editForm.average_rr || 0,
          monthly_return: editForm.monthly_return || 0,
          meetings_hosted: editForm.meetings_hosted || 0,
          meetings_participated: editForm.meetings_participated || 0,
          total_meeting_hours: editForm.total_meeting_hours || 0
        })
        .select()
        .single();

      if (statsError) {
        console.error('Stats update error:', statsError);
        throw statsError;
      }

      // If both operations succeed, update the local state
      if (profileResult) {
        setProfile(profileResult);
      }
      if (statsResult) {
        setStats(statsResult);
      }
      setIsEditing(false);

      // Show success message
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
    }
  };

  // Add this function to generate consistent avatar gradient colors based on username
  const getAvatarGradient = (username: string) => {
    const colors = [
      ['from-pink-500 to-purple-500', 'from-blue-500 to-teal-500'],
      ['from-orange-500 to-red-500', 'from-green-500 to-teal-500'],
      ['from-blue-500 to-purple-500', 'from-indigo-500 to-purple-500']
    ];
    const index = username?.length % colors.length || 0;
    return colors[index][0];
  };

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
            <div className={`w-32 h-32 rounded-2xl bg-gradient-to-br ${getAvatarGradient(profile?.username || '')}
              flex items-center justify-center text-5xl font-bold text-white`}>
              {profile?.first_name?.[0]}
            </div>
            
            <div className="flex-grow">
              {!isEditing ? (
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                      {profile?.first_name} {profile?.last_name}
                      {isOwnProfile && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="ml-3 text-gray-400 hover:text-blue-400 text-xl"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </h1>
                    <p className="text-blue-400 mb-3">{profile?.username}</p>
                    <p className="text-gray-400 max-w-2xl mb-4">{profile?.bio}</p>
                  </div>
                  
                  {!isOwnProfile && (
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
                  )}
                </div>
              ) : (
                <form onSubmit={handleEditSubmit} className="space-y-4 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">First Name</label>
                      <input
                        type="text"
                        value={editForm?.first_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, first_name: e.target.value }))}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editForm?.last_name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, last_name: e.target.value }))}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={editForm?.username || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev!, username: e.target.value }))}
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Bio</label>
                    <textarea
                      value={editForm?.bio || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev!, bio: e.target.value }))}
                      className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Twitter URL</label>
                      <input
                        type="url"
                        value={editForm?.twitter_url || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, twitter_url: e.target.value }))}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Website URL</label>
                      <input
                        type="url"
                        value={editForm?.website_url || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, website_url: e.target.value }))}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">LinkedIn URL</label>
                      <input
                        type="url"
                        value={editForm?.linkedin_url || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev!, linkedin_url: e.target.value }))}
                        className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="text-xl font-bold mb-4">Trading Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Win Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.win_rate || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, win_rate: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Total Trades</label>
                        <input
                          type="number"
                          value={editForm?.total_trades || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, total_trades: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Profit Factor</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.profit_factor || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, profit_factor: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Average R:R</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.average_rr || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, average_rr: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Monthly Return (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm?.monthly_return || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, monthly_return: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Meetings Hosted</label>
                        <input
                          type="number"
                          value={editForm?.meetings_hosted || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, meetings_hosted: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Meetings Participated</label>
                        <input
                          type="number"
                          value={editForm?.meetings_participated || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, meetings_participated: parseInt(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Total Meeting Hours</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editForm?.total_meeting_hours || 0}
                          onChange={(e) => setEditForm(prev => ({ ...prev!, total_meeting_hours: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-700/50 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm(profile);
                      }}
                      className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
              
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