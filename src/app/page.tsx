"use client";
import { useState, useEffect } from "react";
import { FaVideo, FaChartLine, FaUsers, FaCalendar, FaPlay, FaArrowRight, FaCheck, FaCreditCard, FaHistory, FaClock, FaExchangeAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import InstantMeeting from "@/app/modals/InstantMeeting";
import UpcomingMeeting from "@/app/modals/UpcomingMeeting";
import CreateLink from "@/app/modals/CreateLink";
import JoinMeeting from "@/app/modals/JoinMeeting";
import { getStripe } from "@/lib/stripe-client";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { format } from 'date-fns';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";

const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1
		}
	}
};

const cardVariants = {
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

export default function Home() {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const [startInstantMeeting, setStartInstantMeeting] = useState<boolean>(false);
	const [joinMeeting, setJoinMeeting] = useState<boolean>(false);
	const [showUpcomingMeetings, setShowUpcomingMeetings] = useState<boolean>(false);
	const [showCreateLink, setShowCreateLink] = useState<boolean>(false);
	const router = useRouter();
	const [sessions, setSessions] = useState<TradePartySession[]>([]);
	const [isLoadingSessions, setIsLoadingSessions] = useState(true);
	const supabase = createClientComponentClient();

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setIsAuthenticated(!!session);
		};
		checkAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsAuthenticated(!!session);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	useEffect(() => {
		if (isAuthenticated) {
			async function fetchSessions() {
				try {
					const { data: sessions, error } = await supabase
						.from('tradeparty_sessions')
						.select('*')
						.order('started_at', { ascending: false })
						.limit(3);

					if (error) throw error;
					setSessions(sessions || []);
				} catch (error) {
					console.error('Error fetching sessions:', error);
				} finally {
					setIsLoadingSessions(false);
				}
			}

			fetchSessions();
		}
	}, [isAuthenticated, supabase]);

	// Show loading state while checking auth
	if (isAuthenticated === null) {
		return null;
	}

	// Show waitlist landing page for non-authenticated users
	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-900">
				{/* Hero Section */}
				<div className="relative overflow-hidden">
					{/* Background decorative elements */}
					<div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl"></div>
					<div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"></div>
					
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-center"
						>
							<h1 className="text-5xl md:text-7xl font-bold mb-8">
								<span className="bg-gradient-to-r from-emerald-400 to-blue-500 text-transparent bg-clip-text">
									TradeParty
								</span>
							</h1>
							<p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
								The Future of Social Trading is Coming Soon
							</p>
							
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
							>
								<Link
									href="/sign-up"
									className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl text-lg font-medium shadow-lg transition-all duration-200"
								>
									Join the Waitlist
								</Link>
							</motion.div>
						</motion.div>
					</div>
				</div>

				{/* Features Section */}
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
					<motion.div 
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="grid grid-cols-1 md:grid-cols-3 gap-8"
					>
						<div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-xl border border-gray-700/50">
							<div className="bg-emerald-500/10 p-3 rounded-lg w-fit mb-4">
								<svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">Copy Trading</h3>
							<p className="text-gray-400 text-sm mb-4">Share your charts and trade together in real-time</p>
						</div>

						<div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-xl border border-gray-700/50">
							<div className="bg-blue-500/10 p-3 rounded-lg w-fit mb-4">
								<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">Live Chart Sharing</h3>
							<p className="text-gray-400">Share your TradingView charts in real-time with your trading buddies</p>
						</div>

						<div className="bg-gray-800/50 p-6 rounded-2xl backdrop-blur-xl border border-gray-700/50">
							<div className="bg-purple-500/10 p-3 rounded-lg w-fit mb-4">
								<svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
								</svg>
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">Trade Together</h3>
							<p className="text-gray-400">Analyze markets and execute trades as a team</p>
						</div>
					</motion.div>
				</div>

				{/* Stats Section */}
				<div className="border-t border-gray-800">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
						>
							<div>
								<p className="text-3xl font-bold text-white mb-2">10,000+</p>
								<p className="text-gray-400">Active Traders</p>
							</div>
							<div>
								<p className="text-3xl font-bold text-white mb-2">24/7</p>
								<p className="text-gray-400">Trading Sessions</p>
							</div>
							<div>
								<p className="text-3xl font-bold text-white mb-2">100K+</p>
								<p className="text-gray-400">Charts Shared</p>
							</div>
							<div>
								<p className="text-3xl font-bold text-white mb-2">50+</p>
								<p className="text-gray-400">Markets</p>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#0F172A]">
			<main className="container mx-auto px-4 py-12 max-w-6xl">
				{/* Hero Section */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-16"
				>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							onClick={() => setStartInstantMeeting(true)}
							className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-4 rounded-lg
								flex items-center justify-center gap-3 font-medium transition-all duration-300"
						>
							<FaVideo className="text-lg" />
							Host a TradeParty
						</button>
						<button
							onClick={() => setShowCreateLink(true)}
							className="bg-transparent border border-indigo-500/30 hover:border-indigo-500 
								text-white px-8 py-4 rounded-lg flex items-center justify-center gap-3 
								font-medium transition-all duration-300"
						>
							<FaCalendar className="text-lg" />
							Schedule a TradeParty
						</button>
					</div>
				</motion.div>

				{/* Quick Actions */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
				>
					<motion.div
						variants={cardVariants}
						className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
					>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">Join Meeting</h3>
								<p className="text-gray-400 text-sm mb-4">Join an existing TradeParty session</p>
							</div>
							<div className="bg-indigo-500/10 p-3 rounded-lg">
								<FaUsers className="text-indigo-500 text-xl" />
							</div>
						</div>
						<button
							onClick={() => setJoinMeeting(true)}
							className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
						>
							Join Now <FaArrowRight className="text-sm" />
						</button>
					</motion.div>

					<motion.div
						variants={cardVariants}
						className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
					>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">Upcoming</h3>
								<p className="text-gray-400 text-sm mb-4">View your scheduled sessions</p>
							</div>
							<div className="bg-emerald-500/10 p-3 rounded-lg">
								<FaCalendar className="text-emerald-500 text-xl" />
							</div>
						</div>
						<button
							onClick={() => setShowUpcomingMeetings(true)}
							className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
						>
							View Schedule <FaArrowRight className="text-sm" />
						</button>
					</motion.div>

					<motion.div
						variants={cardVariants}
						className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
					>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">Recordings</h3>
								<p className="text-gray-400 text-sm mb-4">Access past session recordings</p>
							</div>
							<div className="bg-blue-500/10 p-3 rounded-lg">
								<FaPlay className="text-blue-500 text-xl" />
							</div>
						</div>
						<Link
							href="/recordings"
							className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
						>
							View Library <FaArrowRight className="text-sm" />
						</Link>
					</motion.div>

					<motion.div
						variants={cardVariants}
						className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50"
					>
						<div className="flex items-start justify-between">
							<div>
								<h3 className="text-lg font-semibold text-white mb-2">Discover</h3>
								<p className="text-gray-400 text-sm mb-4">Find new trading sessions</p>
							</div>
							<div className="bg-purple-500/10 p-3 rounded-lg">
								<FaChartLine className="text-purple-500 text-xl" />
							</div>
						</div>
						<Link
							href="/discover"
							className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
						>
							Explore <FaArrowRight className="text-sm" />
						</Link>
					</motion.div>
				</motion.div>

				{/* Recent Sessions */}
				{sessions.length > 0 && (
					<div className="mb-16">
						<h2 className="text-2xl font-bold text-white mb-6">Recent Sessions</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{sessions.map((session) => (
								<div
									key={session.id}
									className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
								>
									<div className="flex items-start justify-between mb-4">
										<div>
											<h3 className="text-lg font-semibold text-white mb-1">{session.name}</h3>
											<p className="text-sm text-gray-400">
												{format(new Date(session.started_at), 'MMM d, yyyy')}
											</p>
										</div>
										<div className="flex items-center">
											<div className="flex -space-x-2">
												{session.participants.avatars.slice(0, 3).map((avatar, i) => (
													<img
														key={i}
														src={`https://picsum.photos/32/32?random=${session.id}-${i}`}
														alt={`Participant ${i + 1}`}
														className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover"
													/>
												))}
											</div>
											<span className="text-sm text-gray-400 ml-2">
												{/* {session.participant_count} Traders */}
											</span>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-4 mb-4">
										<div className="bg-gray-900/50 p-3 rounded-lg">
											<div className="flex items-center gap-2 text-gray-400 mb-1">
												<FaClock className="text-sm" />
												<span className="text-sm">Duration</span>
											</div>
											<p className="text-white font-medium">
												{session.duration_minutes} mins
											</p>
										</div>
										<div className="bg-gray-900/50 p-3 rounded-lg">
											<div className="flex items-center gap-2 text-gray-400 mb-1">
												<FaExchangeAlt className="text-sm" />
												<span className="text-sm">Trades</span>
											</div>
											<p className="text-white font-medium">
												{session.trades_taken.length} trades
											</p>
										</div>
									</div>
									{session.recording_url && (
										<Link
											href={`/recordings/${session.id}`}
											className="w-full bg-gray-900/50 hover:bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
										>
											Watch Recording <FaPlay className="text-sm" />
										</Link>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Modals */}
				{startInstantMeeting && (
					<InstantMeeting onClose={() => setStartInstantMeeting(false)} />
				)}
				{showUpcomingMeetings && (
					<UpcomingMeeting onClose={() => setShowUpcomingMeetings(false)} />
				)}
				{showCreateLink && (
					<CreateLink onClose={() => setShowCreateLink(false)} />
				)}
				{joinMeeting && (
					<JoinMeeting onClose={() => setJoinMeeting(false)} />
				)}
			</main>
		</div>
	);
}