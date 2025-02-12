"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlay, FaClock, FaUsers, FaCalendar } from "react-icons/fa";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { format } from 'date-fns';
import Link from "next/link";

interface Recording {
  id: string;
  name: string;
  started_at: string;
  duration_minutes: number;
  participant_count: number;
  thumbnail_url: string;
  recording_url: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchRecordings() {
      try {
        const { data: recordings, error } = await supabase
          .from('tradeparty_sessions')
          .select('*')
          .not('recording_url', 'is', null)
          .order('started_at', { ascending: false });

        if (error) throw error;
        setRecordings(recordings || []);
      } catch (error) {
        console.error('Error fetching recordings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecordings();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">Recording Library</h1>
          <p className="text-gray-400">Review and watch your past trading sessions</p>
        </div>

        {/* Recordings Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {recordings.map((recording) => (
            <motion.div
              key={recording.id}
              variants={itemVariants}
              className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50 hover:border-indigo-500/50 transition-all duration-300"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video group">
                <img
                  src={`https://picsum.photos/seed/${recording.id}/800/450`}
                  alt={recording.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link
                    href={`/recordings/${recording.id}`}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                  >
                    <FaPlay className="text-sm" />
                    Watch Recording
                  </Link>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{recording.name}</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendar className="text-sm" />
                    <span className="text-sm">
                      {format(new Date(recording.started_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaClock className="text-sm" />
                    <span className="text-sm">{recording.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400">
                  <FaUsers className="text-sm" />
                  <span className="text-sm">{recording.participant_count} participants</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {recordings.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-white mb-2">No Recordings Found</h3>
            <p className="text-gray-400">Start a TradeParty session to begin recording your trading sessions.</p>
          </div>
        )}
      </div>
    </div>
  );
} 