"use client";
import { useState } from "react";
import { FaVideo, FaChartLine, FaUsers, FaCalendar, FaPlay, FaArrowRight, FaCheck, FaCreditCard } from "react-icons/fa";
import { motion } from "framer-motion";
import InstantMeeting from "@/app/modals/InstantMeeting";
import UpcomingMeeting from "@/app/modals/UpcomingMeeting";
import CreateLink from "@/app/modals/CreateLink";
import JoinMeeting from "@/app/modals/JoinMeeting";
import { getStripe } from "@/lib/stripe-client";
import { toast } from "react-hot-toast";

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

				{/* Features Grid */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
				>
					<motion.div
						variants={cardVariants}
						className="bg-[#1E293B]/50 rounded-xl p-6 hover:bg-[#1E293B] transition-all duration-300"
						onClick={() => window.location.href = '/discover'}
					>
						<div className="flex items-start gap-4">
							<div className="bg-purple-500/10 p-3 rounded-lg">
								<FaUsers className="text-purple-500 text-xl" />
							</div>
							<div>
								<h3 className="text-white text-lg font-medium mb-2">Discover TradeParty Streams</h3>
								<p className="text-gray-400 mb-4">
									Join active trading rooms and learn from experienced traders in real-time
								</p>
								<div className="flex items-center text-purple-400 text-sm font-medium">
									Explore <FaArrowRight className="ml-2" />
								</div>
							</div>
						</div>
					</motion.div>

					<motion.div
						variants={cardVariants}
						className="bg-[#1E293B]/50 rounded-xl p-6 hover:bg-[#1E293B] transition-all duration-300"
						onClick={() => setShowUpcomingMeetings(true)}
					>
						<div className="flex items-start gap-4">
							<div className="bg-teal-500/10 p-3 rounded-lg">
								<FaCalendar className="text-teal-500 text-xl" />
							</div>
							<div>
								<h3 className="text-white text-lg font-medium mb-2">Upcoming Streams</h3>
								<p className="text-gray-400 mb-4">
									View and join scheduled trading streams from your favorite hosts
								</p>
								<div className="flex items-center text-teal-400 text-sm font-medium">
									View calendar <FaArrowRight className="ml-2" />
								</div>
							</div>
						</div>
					</motion.div>
				</motion.div>

				{/* Replace the CTA Section with Pricing */}
				<div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 
					rounded-xl p-6 border border-gray-800/50 backdrop-blur-sm">
					<div className="max-w-5xl mx-auto">
						<div className="flex flex-col md:flex-row items-center md:items-start gap-6 justify-between">
							{/* Left side - Features */}
							<div className="md:w-7/12">
								<h2 className="text-2xl font-semibold text-white mb-4">
									Premium TradeParty Membership
								</h2>
								<div className="grid grid-cols-1 gap-3">
									<div className="flex items-center gap-3 bg-[#1E293B]/30 p-3.5 rounded-lg">
										<div className="bg-indigo-500/10 p-2.5 rounded-lg">
											<FaUsers className="text-lg text-indigo-400" />
										</div>
										<div>
											<h3 className="text-white font-medium leading-snug">Unlimited Access</h3>
											<p className="text-gray-400 text-sm">Host rooms with no participant limits</p>
										</div>
									</div>
									<div className="flex items-center gap-3 bg-[#1E293B]/30 p-3.5 rounded-lg">
										<div className="bg-purple-500/10 p-2.5 rounded-lg">
											<FaChartLine className="text-lg text-purple-400" />
										</div>
										<div>
											<h3 className="text-white font-medium leading-snug">Pro Trading Tools</h3>
											<p className="text-gray-400 text-sm">Advanced charts and analysis features</p>
										</div>
									</div>
									<div className="flex items-center gap-3 bg-[#1E293B]/30 p-3.5 rounded-lg">
										<div className="bg-pink-500/10 p-2.5 rounded-lg">
											<FaVideo className="text-lg text-pink-400" />
										</div>
										<div>
											<h3 className="text-white font-medium leading-snug">Full Collaboration</h3>
											<p className="text-gray-400 text-sm">Screen sharing and session recording</p>
										</div>
									</div>
								</div>
							</div>

							{/* Right side - Pricing Card */}
							<div className="md:w-5/12 md:pl-4">
								<div className="bg-[#1E293B]/70 px-6 py-5 rounded-xl border border-gray-800">
									<div className="flex flex-col items-center text-center">
										<div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 
											p-3 rounded-lg mb-4 w-full">
											<div className="text-gray-300 text-sm">Monthly Plan</div>
											<div className="flex items-baseline justify-center gap-1">
												<span className="text-3xl font-bold text-white">$29</span>
												<span className="text-gray-400">/mo</span>
											</div>
										</div>
										<div className="space-y-2.5 w-full mb-5">
											<div className="flex items-center gap-2 text-gray-300 text-sm">
												<FaCheck className="text-green-400 text-xs" />
												All pro features included
											</div>
											<div className="flex items-center gap-2 text-gray-300 text-sm">
												<FaCheck className="text-green-400 text-xs" />
												24/7 priority support
											</div>
											<div className="flex items-center gap-2 text-gray-300 text-sm">
												<FaCheck className="text-green-400 text-xs" />
												Cancel anytime
											</div>
										</div>
										<button
											onClick={async () => {
												try {
													const response = await fetch('/api/create-checkout-session', {
														method: 'POST',
														headers: {
															'Content-Type': 'application/json',
														},
													});
													
													const { sessionId } = await response.json();
													const stripe = await getStripe();
													
													if (stripe) {
														const { error } = await stripe.redirectToCheckout({
															sessionId,
														});
														
														if (error) {
															console.error('Error:', error);
															toast.error('Payment failed to initialize');
														}
													}
												} catch (error) {
													console.error('Error:', error);
													toast.error('Something went wrong');
												}
											}}
											className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg
												flex items-center gap-2 font-medium transition-all duration-300 w-full justify-center"
										>
											<FaCreditCard className="text-sm" />
											Pay Now
										</button>
									</div>
								</div>
							</div>
						</div>
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