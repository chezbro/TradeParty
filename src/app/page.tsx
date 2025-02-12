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
import SignIn from "./sign-in/page";

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
	const [isInstantMeetingOpen, setIsInstantMeetingOpen] = useState(false);
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

	// Show sign-in page for non-authenticated users
	if (!isAuthenticated) {
		return <SignIn />;
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
							onClick={() => setIsInstantMeetingOpen(true)}
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
				<InstantMeeting 
					isOpen={isInstantMeetingOpen}
					onClose={() => setIsInstantMeetingOpen(false)}
				/>
				{showUpcomingMeetings && (
					<UpcomingMeeting enable={showUpcomingMeetings} setEnable={setShowUpcomingMeetings} />
				)}
				{showCreateLink && (
					<CreateLink enable={showCreateLink} setEnable={setShowCreateLink} />
				)}
				{joinMeeting && (
					<JoinMeeting enable={joinMeeting} setEnable={setJoinMeeting} />
				)}
			</main>
		</div>
	);
}