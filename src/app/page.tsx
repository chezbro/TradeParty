"use client";
import { useState } from "react";
import { FaVideo, FaChartLine, FaUsers, FaCalendar } from "react-icons/fa";
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
		<div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
			<main className="container mx-auto px-4 py-12">
				<motion.div 
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16"
				>
					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02, y: -5 }}
						className="bg-gradient-to-br from-[#1E293B] to-[#1E293B]/80 p-8 rounded-xl 
									cursor-pointer border border-gray-800/50 hover:border-indigo-500/50
									shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
						onClick={() => setStartInstantMeeting(true)}
					>
						<div className="bg-indigo-500/10 p-4 rounded-xl w-fit mb-6 ring-2 ring-indigo-500/20">
							<FaVideo className="text-indigo-500 text-3xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-3">Host a TradeParty</h3>
						<p className="text-gray-400 leading-relaxed">Start a live trading session with friends. See your trades and chart analysis on stream.</p>
					</motion.div>

					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02, y: -5 }}
						className="bg-gradient-to-br from-[#1E293B] to-[#1E293B]/80 p-8 rounded-xl 
									cursor-pointer border border-gray-800/50 hover:border-purple-500/50
									shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
						onClick={() => setShowCreateLink(true)}
					>
						<div className="bg-purple-500/10 p-4 rounded-xl w-fit mb-6 ring-2 ring-purple-500/20">
							<FaChartLine className="text-purple-500 text-3xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-3">Create Trading Event</h3>
						<p className="text-gray-400 leading-relaxed">Schedule a future trading session and invite others</p>
					</motion.div>

					<motion.div
						variants={cardVariants}
						whileHover={{ scale: 1.02, y: -5 }}
						className="bg-gradient-to-br from-[#1E293B] to-[#1E293B]/80 p-8 rounded-xl 
									cursor-pointer border border-gray-800/50 hover:border-fuchsia-500/50
									shadow-lg hover:shadow-fuchsia-500/10 transition-all duration-300"
						onClick={() => setShowUpcomingMeetings(true)}
					>
						<div className="bg-fuchsia-500/10 p-4 rounded-xl w-fit mb-6 ring-2 ring-fuchsia-500/20">
							<FaCalendar className="text-fuchsia-500 text-3xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-3">Upcoming Sessions</h3>
						<p className="text-gray-400 leading-relaxed">View scheduled trading rooms and events</p>
					</motion.div>
				</motion.div>
			</main>

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
	);
}