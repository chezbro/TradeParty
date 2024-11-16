"use client";
import { useState } from "react";
import { FaVideo, FaChartLine, FaUsers, FaCalendar } from "react-icons/fa";
import Image from 'next/image';
import InstantMeeting from "@/app/modals/InstantMeeting";
import UpcomingMeeting from "@/app/modals/UpcomingMeeting";
import CreateLink from "@/app/modals/CreateLink";
import JoinMeeting from "@/app/modals/JoinMeeting";
import { UserButton } from "@clerk/nextjs";

export default function Dashboard() {
	const [startInstantMeeting, setStartInstantMeeting] = useState<boolean>(false);
	const [joinMeeting, setJoinMeeting] = useState<boolean>(false);
	const [showUpcomingMeetings, setShowUpcomingMeetings] = useState<boolean>(false);
	const [showCreateLink, setShowCreateLink] = useState<boolean>(false);

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B]">
			<header className="w-full bg-[#0F172A]/50 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 
									bg-clip-text text-transparent">
							TradeParty
						</div>
						
						<div className="flex items-center gap-4">
							<button
								className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg
									   text-white font-medium flex items-center space-x-2 shadow-lg transition-all"
								onClick={() => setJoinMeeting(true)}
							>
								<FaVideo className="text-white" />
								<span>Join Trading Room</span>
							</button>
							
							<UserButton 
								afterSignOutUrl="/"
								appearance={{
									elements: {
										avatarBox: "w-10 h-10 rounded-full border-2 border-indigo-500/30 hover:border-indigo-500 transition-all",
										userButtonPopulator: "w-10 h-10"
									}
								}}
							/>
						</div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-12">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
					<div className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all cursor-pointer 
									border border-gray-800/50 hover:border-indigo-500/30"
						 onClick={() => setStartInstantMeeting(true)}>
						<div className="bg-indigo-500/10 p-3 rounded-lg w-fit mb-4">
							<FaVideo className="text-indigo-500 text-2xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-2">Start Trading Room</h3>
						<p className="text-gray-400">Host a live trading session and share your screen with others</p>
					</div>

					<div className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all cursor-pointer 
									border border-gray-800/50 hover:border-purple-500/30"
						 onClick={() => setShowCreateLink(true)}>
						<div className="bg-purple-500/10 p-3 rounded-lg w-fit mb-4">
							<FaChartLine className="text-purple-500 text-2xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-2">Create Trading Event</h3>
						<p className="text-gray-400">Schedule a future trading session and invite others</p>
					</div>

					<div className="bg-[#1E293B] p-6 rounded-xl hover:bg-[#2D3B4E] transition-all cursor-pointer 
									border border-gray-800/50 hover:border-fuchsia-500/30"
						 onClick={() => setShowUpcomingMeetings(true)}>
						<div className="bg-fuchsia-500/10 p-3 rounded-lg w-fit mb-4">
							<FaCalendar className="text-fuchsia-500 text-2xl" />
						</div>
						<h3 className="text-white text-xl font-semibold mb-2">Upcoming Sessions</h3>
						<p className="text-gray-400">View scheduled trading rooms and events</p>
					</div>
				</div>

				<div className="text-center">
					<div className="inline-flex items-center space-x-2 bg-[#1E293B] px-4 py-2 rounded-lg 
									border border-gray-800/50">
						<p className="text-gray-400">Powered by</p>
						<a href="https://getstream.io" target="_blank" rel="noopener noreferrer">
							<Image src="/stream-logo.png" alt="Stream Logo" width={80} height={20} />
						</a>
					</div>
				</div>
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