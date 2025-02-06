"use client";
import { useState } from "react";
import { FaVideo, FaChartLine, FaUsers, FaCalendar, FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";
import InstantMeeting from "@/app/modals/InstantMeeting";
import UpcomingMeeting from "@/app/modals/UpcomingMeeting";
import CreateLink from "@/app/modals/CreateLink";
import JoinMeeting from "@/app/modals/JoinMeeting";

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

export default function Dashboard() {
	const [startInstantMeeting, setStartInstantMeeting] = useState<boolean>(false);
	const [joinMeeting, setJoinMeeting] = useState<boolean>(false);
	const [showUpcomingMeetings, setShowUpcomingMeetings] = useState<boolean>(false);
	const [showCreateLink, setShowCreateLink] = useState<boolean>(false);

	return (
		<div className="min-h-screen bg-[#0F172A]">
			<main className="container mx-auto px-4 py-12 max-w-6xl">
		

				<motion.div 
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
				>
					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02 }}
						className="bg-[#1E293B] rounded-lg overflow-hidden"
						onClick={() => setStartInstantMeeting(true)}
					>
						<div className="p-6 border border-gray-800 h-full flex flex-col hover:border-indigo-500/50 transition-colors rounded-lg cursor-pointer">
							<div className="bg-indigo-500/10 p-3 rounded-lg w-fit mb-4">
								<FaVideo className="text-indigo-500 text-xl" />
							</div>
							<h3 className="text-white text-lg font-medium mb-2">Start Instant Session</h3>
							<p className="text-gray-400 text-sm flex-grow">
								Launch a live trading room instantly and start sharing your analysis
							</p>
							<div className="mt-4 flex items-center text-indigo-400 text-sm font-medium">
								Start streaming <FaPlay className="ml-2 text-xs" />
							</div>
						</div>
					</motion.div>

					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02 }}
						className="bg-[#1E293B] rounded-lg overflow-hidden"
						onClick={() => setShowCreateLink(true)}
					>
						<div className="p-6 border border-gray-800 h-full flex flex-col hover:border-purple-500/50 transition-colors rounded-lg cursor-pointer">
							<div className="bg-purple-500/10 p-3 rounded-lg w-fit mb-4">
								<FaChartLine className="text-purple-500 text-xl" />
							</div>
							<h3 className="text-white text-lg font-medium mb-2">Schedule Session</h3>
							<p className="text-gray-400 text-sm flex-grow">
								Plan ahead and schedule a trading session with your community
							</p>
							<div className="mt-4 flex items-center text-purple-400 text-sm font-medium">
								Create event <FaCalendar className="ml-2 text-xs" />
							</div>
						</div>
					</motion.div>

					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02 }}
						className="bg-[#1E293B] rounded-lg overflow-hidden"
						onClick={() => setShowUpcomingMeetings(true)}
					>
						<div className="p-6 border border-gray-800 h-full flex flex-col hover:border-fuchsia-500/50 transition-colors rounded-lg cursor-pointer">
							<div className="bg-fuchsia-500/10 p-3 rounded-lg w-fit mb-4">
								<FaCalendar className="text-fuchsia-500 text-xl" />
							</div>
							<h3 className="text-white text-lg font-medium mb-2">Upcoming Sessions</h3>
							<p className="text-gray-400 text-sm flex-grow">
								Browse and join scheduled trading sessions
							</p>
							<div className="mt-4 flex items-center text-fuchsia-400 text-sm font-medium">
								View calendar <FaUsers className="ml-2 text-xs" />
							</div>
						</div>
					</motion.div>

					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02 }}
						className="bg-[#1E293B] rounded-lg overflow-hidden"
						onClick={() => window.location.href = '/discover'}
					>
						<div className="p-6 border border-gray-800 h-full flex flex-col hover:border-teal-500/50 transition-colors rounded-lg cursor-pointer">
							<div className="bg-teal-500/10 p-3 rounded-lg w-fit mb-4">
								<FaUsers className="text-teal-500 text-xl" />
							</div>
							<h3 className="text-white text-lg font-medium mb-2">Explore Sessions</h3>
							<p className="text-gray-400 text-sm flex-grow">
								Discover and join other live TradeParty meeting rooms
							</p>
							<div className="mt-4 flex items-center text-teal-400 text-sm font-medium">
								Browse sessions <FaUsers className="ml-2 text-xs" />
							</div>
						</div>
					</motion.div>
				</motion.div>

				<div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-xl p-8 border border-gray-800">
					<div className="max-w-3xl mx-auto text-center">
						<h2 className="text-2xl font-semibold text-white mb-4">
							Ready to Host a TradeParty?
						</h2>
						<p className="text-gray-400 mb-6">
							Start your first trading session and invite others to join your analysis
						</p>
						<button
							onClick={() => setStartInstantMeeting(true)}
							className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg
									flex items-center gap-2 font-medium transition-all duration-300
									mx-auto"
						>
							<FaPlay className="text-sm" />
							Start Trading Session
						</button>
					</div>
				</div>
			</main>

			{(startInstantMeeting || showUpcomingMeetings || showCreateLink || joinMeeting) && (
				<div className="fixed inset-0 z-[9999]">
					{startInstantMeeting && (
						<InstantMeeting
							enable={startInstantMeeting}
							setEnable={setStartInstantMeeting}
						/>
					)}
					{showUpcomingMeetings && (
						<UpcomingMeeting
							enable={showUpcomingMeetings}
							setEnable={setShowUpcomingMeetings}
						/>
					)}
					{showCreateLink && (
						<CreateLink enable={showCreateLink} setEnable={setShowCreateLink} />
					)}
					{joinMeeting && (
						<JoinMeeting enable={joinMeeting} setEnable={setJoinMeeting} />
					)}
				</div>
			)}
		</div>
	);
}