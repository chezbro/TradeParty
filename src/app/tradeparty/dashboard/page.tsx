'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { FaUsers, FaChartLine, FaExchangeAlt, FaPlay, FaClock, FaCalendar } from 'react-icons/fa';
import Link from 'next/link';

interface TradePartySession {
  id: string;
  name: string;
  started_at: string;
  ended_at: string;
  duration_minutes: number;
  participant_count: number;
  charts_shared: any[];
  trades_taken: any[];
  participants: {
    user_ids: string[];
    names: string[];
    avatars: string[];
  };
  recording_url: string | null;
}

export default function TradePartyDashboard() {
  const [sessions, setSessions] = useState<TradePartySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchSessions() {
      try {
        console.log('Fetching sessions...');
        const { data: sessions, error } = await supabase
          .from('tradeparty_sessions')
          .select('*')
          .order('started_at', { ascending: false });

        console.log('Fetched sessions:', sessions);
        console.log('Error if any:', error);

        if (error) throw error;
        setSessions(sessions || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSessions();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading your TradeParty sessions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your TradeParty Sessions</h1>
          <p className="text-gray-400">Review your past trading sessions and performance</p>
        </div>

        <div className="grid gap-6">
          {sessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-xl p-6 border border-gray-700/50"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* Session Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-white mb-2">{session.name}</h2>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-indigo-400" />
                      {format(new Date(session.started_at), 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-indigo-400" />
                      {session.duration_minutes} minutes
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUsers className="text-indigo-400" />
                      {session.participant_count} participants
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-4">
                    <div className="flex -space-x-2">
                      {session.participants.avatars.slice(0, 5).map((avatar, i) => (
                        <img
                          key={i}
                          src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                          alt={`Participant ${i + 1}`}
                          className="w-8 h-8 rounded-full border-2 border-gray-800"
                        />
                      ))}
                      {session.participants.names.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs text-white border-2 border-gray-800">
                          +{session.participants.names.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <FaChartLine />
                      Charts Shared
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {session.charts_shared.length}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                      <FaExchangeAlt />
                      Trades Taken
                    </div>
                    <div className="text-xl font-semibold text-white">
                      {session.trades_taken.length}
                    </div>
                  </div>

                  {session.recording_url && (
                    <div className="bg-gray-900/50 rounded-lg p-4">
                      <Link
                        href={session.recording_url}
                        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        <FaPlay />
                        Watch Recording
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <p className="text-gray-400">No TradeParty sessions found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 