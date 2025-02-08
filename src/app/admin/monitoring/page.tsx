'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { FaServer, FaUsers, FaVideo, FaExclamationTriangle } from 'react-icons/fa';

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

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<HealthMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);

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

    // Fetch immediately and then every 30 seconds
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);

    return () => clearInterval(interval);
  }, []);

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