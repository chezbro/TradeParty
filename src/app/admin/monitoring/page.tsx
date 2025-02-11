'use client';

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaServer, FaUsers, FaVideo, FaExclamationTriangle } from 'react-icons/fa';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface HealthMetrics {
  activeMeetings: number;
  activeParticipants: number;
  totalMeetings: number;
  services: {
    database: string;
    redis: string;
  };
  timestamp: string;
}

interface UserLimits {
  total_users: number;
  max_users: number;
  last_updated: string;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<HealthMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [userLimits, setUserLimits] = useState<UserLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setMetrics(data);
        setHistoricalData(prev => [...prev, data].slice(-30)); // Keep last 30 data points
      } catch (err) {
        setError('Failed to fetch metrics');
        console.error(err);
      }
    };

    const fetchUserLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('user_limits')
          .select('*')
          .single();

        if (error) throw error;
        setUserLimits(data);
      } catch (error) {
        console.error('Error fetching user limits:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and then every 30 seconds
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    fetchUserLimits();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user_limits_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'user_limits' },
        (payload) => {
          setUserLimits(payload.new as UserLimits);
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">Loading monitoring data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">System Monitoring</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={<FaVideo />}
          title="Active Meetings"
          value={metrics?.activeMeetings || 0}
          trend="+5% from last hour"
        />
        <StatsCard
          icon={<FaUsers />}
          title="Active Participants"
          value={metrics?.activeParticipants || 0}
          trend="+12% from last hour"
        />
        <StatsCard
          icon={<FaServer />}
          title="Total Meetings"
          value={metrics?.totalMeetings || 0}
          trend="All time"
        />
      </div>

      {/* Service Status */}
      <div className="bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Service Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ServiceStatus
            name="Database"
            status={metrics?.services.database === 'connected' ? 'healthy' : 'error'}
          />
          <ServiceStatus
            name="Redis"
            status={metrics?.services.redis === 'connected' ? 'healthy' : 'error'}
          />
        </div>
      </div>

      {/* User Limits Card */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">User Limits</h2>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Users</div>
            <div className="text-2xl font-bold text-white">
              {userLimits?.total_users.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Maximum Users</div>
            <div className="text-2xl font-bold text-white">
              {userLimits?.max_users.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400 mb-1">Capacity Used</div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-700">
                <div
                  style={{ width: `${userLimits?.total_users && userLimits?.max_users ? (userLimits.total_users / userLimits.max_users * 100) : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500"
                ></div>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {userLimits?.total_users && userLimits?.max_users ? ((userLimits.total_users / userLimits.max_users) * 100).toFixed(1) : '0'}%
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {userLimits?.last_updated ? new Date(userLimits.last_updated).toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Historical Charts */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Historical Metrics</h2>
        <div className="w-full h-[400px]">
          <LineChart data={historicalData} width={800} height={400}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="activeMeetings" stroke="#8884d8" />
            <Line type="monotone" dataKey="activeParticipants" stroke="#82ca9d" />
          </LineChart>
        </div>
      </div>
    </div>
  );
}

const StatsCard = ({ icon, title, value, trend }: any) => (
  <div className="bg-gray-800 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-emerald-400">{icon}</div>
      <h3 className="font-medium">{title}</h3>
    </div>
    <p className="text-3xl font-bold mb-2">{value}</p>
    <p className="text-sm text-gray-400">{trend}</p>
  </div>
);

const ServiceStatus = ({ name, status }: { name: string; status: 'healthy' | 'error' }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-700/50 rounded-lg">
    <div className={`w-2 h-2 rounded-full ${
      status === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'
    }`} />
    <span>{name}</span>
  </div>
); 