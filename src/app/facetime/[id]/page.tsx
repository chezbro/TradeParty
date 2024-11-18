"use client";
import { useGetCallById } from "@/app/hooks/useGetCallById";
import { useUser } from "@clerk/nextjs";
import {
	StreamCall,
	StreamTheme,
	PaginatedGridLayout,
	SpeakerLayout,
	CallControls,
	StreamVideoParticipant,
	useCall
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import {  useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TraderStats } from "@/components/TraderStats";
import { TradesFeed } from "@/components/TradesFeed";
import { TradingDashboard } from "@/components/TradingDashboard";
import { FaChartLine, FaUsers, FaVideo, FaStar, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { TradeEntryPanel } from '@/components/TradeEntryPanel';
import { TradesProvider } from '@/context/TradesContext';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { IoMdExpand, IoMdContract, IoMdRemove } from 'react-icons/io';
import { TradeDetailsModal } from '@/components/TradeDetailsModal';
import { Trade } from '@/types/trade';
import { FC } from 'react';
import { ChartViewer } from '@/components/ChartViewer';
import { StarIcon } from '@radix-ui/react-icons';
import { io, Socket } from "socket.io-client";
import Draggable from 'react-draggable';
import { WatchlistContainer } from '@/components/WatchlistContainer';
import { TradeEntryContainer } from '@/components/TradeEntryContainer';

type CallLayoutType = "grid" | "speaker-left" | "speaker-right" | "trading" | "multi-chart";

interface SharedChart {
	id: string;
	data: any;
	sharedBy: string;
}

interface MeetingRoomProps {
	shareChart: (chartData: any) => void;
	sharedCharts: SharedChart[];
	socket: Socket | null;
	meetingName?: string;
}

// Add this new component above the MeetingRoom component
const MultiChartGrid = ({ 
	symbols, 
	onSymbolChange,
	onToggleFavorite,
	onShare 
}: { 
	symbols: string[], 
	onSymbolChange: (symbol: string) => void,
	onToggleFavorite: (symbol: string) => void,
	onShare: (chartData: any) => void
}) => {
	return (
		<div className="grid grid-cols-2 gap-4 p-4 h-full">
			{symbols.map((symbol) => (
				<div key={symbol} className="relative rounded-xl overflow-hidden border border-white/5 
					bg-gray-900/20 backdrop-blur-sm">
					<ChartViewer 
						symbol={symbol}
						onSymbolChange={onSymbolChange}
						onToggleFavorite={onToggleFavorite}
						isFavorited={true} // It's in watchlist so always favorited
						onShare={onShare}
						compact={true} // Add this prop to ChartViewer
					/>
				</div>
			))}
			{/* Add empty placeholder slots if watchlist length is odd */}
			{symbols.length % 2 !== 0 && (
				<div className="rounded-xl border border-white/5 bg-gray-900/20 backdrop-blur-sm
					flex items-center justify-center text-gray-400">
					<div className="text-center">
						<FaStar className="mx-auto mb-2 text-2xl" />
						<p>Add more symbols to your watchlist</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default function FaceTimePage() {
	const { id } = useParams<{ id: string }>();
	const { isLoaded } = useUser();
	const { call, isCallLoading } = useGetCallById(id);
	const [confirmJoin, setConfirmJoin] = useState<boolean>(false);
	const [camMicEnabled, setCamMicEnabled] = useState<boolean>(false);
	const router = useRouter();
	const [sharedCharts, setSharedCharts] = useState<SharedChart[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const { user } = useUser();

	useEffect(() => {
		if (camMicEnabled) {
			call?.camera.enable();
			call?.microphone.enable();
		} else {
			call?.camera.disable();
			call?.microphone.disable();
		}

	}, [call, camMicEnabled]);

	useEffect(() => {
		if (!socket) return;

		// Listen for shared charts from other users
		socket.on('chart-shared', (chart: SharedChart) => {
			setSharedCharts(prev => [...prev, chart]);
		});

		return () => {
			socket.off('chart-shared');
		};
	}, [socket]);

	useEffect(() => {
		// Initialize socket connection
		const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
			query: {
				userId: user?.id,
				roomId: id // from your params
			}
		});

		setSocket(socketInstance);

		// Cleanup on unmount
		return () => {
			socketInstance.disconnect();
		};
	}, [user?.id, id]);

	const handleJoin = () => { 
		call?.join();
		setConfirmJoin(true)
	}

	const shareChart = (chartData: any) => {
		if (!socket || !user) return;

		const sharedChart: SharedChart = {
			id: Math.random().toString(36).substring(7),
			data: chartData,
			sharedBy: user.id,
		};

		socket.emit('share-chart', sharedChart);
		setSharedCharts(prev => [...prev, sharedChart]);
	};

	if (isCallLoading || !isLoaded) return <p>Loading...</p>;

	if (!call) return (<p>Call not found</p>);

	return (
		<main className='min-h-screen w-full bg-black'>
			<StreamCall call={call}>
				<StreamTheme>
					{confirmJoin ? (
						<MeetingRoom 
							shareChart={shareChart}
							sharedCharts={sharedCharts}
							socket={socket}
							meetingName={call?.data?.custom?.name || "Trading Session #1"}
						/>
					) : (
						<div className='h-screen w-full flex items-center justify-center bg-black/90'>
							<div className='flex flex-col items-center justify-center gap-6 p-8 bg-gray-900/50 backdrop-blur-md rounded-lg border border-white/10'>
								<h1 className='text-4xl font-extrabold text-white mb-2'>Join the Call</h1>
								<p className='text-lg text-white/80 mb-4'>Ready to dive into the conversation?</p>
								<div className='flex gap-4'>
									<button 
										onClick={handleJoin} 
										className='px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-600 transition-all duration-200'
									>
										Join Now
									</button>
									<button 
										onClick={() => router.push("/")} 
										className='px-6 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-all duration-200'
									>
										Cancel
									</button>
								</div>
							</div>
						</div>
					)}
				</StreamTheme>
			</StreamCall>
		</main>
	);

}

const MeetingRoom = ({ shareChart, sharedCharts, socket, meetingName = "Trading Session #1" }: MeetingRoomProps) => {
	const { user } = useUser();
	const router = useRouter();
	const [layout, setLayout] = useState<CallLayoutType>("trading");
	const [isPanelExpanded, setIsPanelExpanded] = useState(true);
	const [panelWidth, setPanelWidth] = useState(300);
	const [selectedTrade, setSelectedTrade] = useState<null | Trade>(null);
	const [selectedTrader, setSelectedTrader] = useState<string>('');
	const [isControlsVisible, setIsControlsVisible] = useState(false);
	const [currentSymbol, setCurrentSymbol] = useState<string>('AAPL');
	const [watchlist, setWatchlist] = useState<string[]>(['AAPL']);
	const [isChartShared, setIsChartShared] = useState(false);
	const [liveChartStreamer, setLiveChartStreamer] = useState<string | null>(null);
	const call = useCall();
	const [controlsPosition, setControlsPosition] = useState({ x: 0, y: 0 });
	const [isDragging, setIsDragging] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const hideTimeoutRef = useRef<NodeJS.Timeout>();
	const [isMinimized, setIsMinimized] = useState(false);
	const [isDetached, setIsDetached] = useState(false);
	const [isWatchlistExpanded, setIsWatchlistExpanded] = useState(false);
	const [isTradeEntryExpanded, setIsTradeEntryExpanded] = useState(true);
	const [isMultiChartEnabled, setIsMultiChartEnabled] = useState(false);
	const [chartLayouts, setChartLayouts] = useState<string[]>([currentSymbol]);
	const [isVideosPanelExpanded, setIsVideosPanelExpanded] = useState(true);
	const [videosPanelWidth, setVideosPanelWidth] = useState(300);

	// Create a trader object from the current user
	const currentTrader = {
		name: user?.firstName && user?.lastName 
			? `${user.firstName} ${user.lastName}`
			: user?.username || 'Anonymous Trader',
		profitLoss: 0,
		winRate: 0,
		totalTrades: 0
	};

	const handleResize = useCallback((e: any, { size }: { size: { width: number } }) => {
		setPanelWidth(size.width);
	}, []);

	const togglePanel = () => {
		setIsPanelExpanded(!isPanelExpanded);
		setPanelWidth(isPanelExpanded ? 60 : 300);
	};

	const handleLeave = () => {
		if (confirm("Are you sure you want to leave the trading session?")) {
			router.push("/");
		}
	};

	const handleTradeClick = (trade: Trade, traderName: string) => {
		setSelectedTrade(trade);
		setSelectedTrader(traderName);
	};

	const handleNewTrade = (trade: Trade) => {
		// Implement actual trade handling logic here
		console.log("New trade:", trade);
		// You can emit this to your socket or handle it however needed
	};

	const ParticipantView = ({ participant }: { participant: StreamVideoParticipant }) => {
		const { user } = useUser();
		
		return (
			<div className="relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm 
				border border-gray-800/50 transition-all duration-300 hover:border-gray-700/50
				hover:shadow-lg hover:shadow-emerald-500/5">
				<img 
					src={user?.imageUrl || "https://picsum.photos/seed/default/200/200"}
					alt={participant?.name || "Participant"}
					className="w-full h-full object-cover"
				/>
				
				<div className="absolute inset-0 flex flex-col justify-end">
					<div className="p-3 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent">
						<p className="text-white font-medium">
							{participant?.name || "Participant"}
						</p>
					</div>
				</div>
			</div>
		);
	};

	const handleStarClick = (symbol: string) => {
		setWatchlist(prev => 
			prev.includes(symbol) 
				? prev.filter(item => item !== symbol)
				: [...prev, symbol]
		);
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		const threshold = window.innerHeight - 150;
		if (e.clientY > threshold && !isMinimized) {
			setIsControlsVisible(true);
		}
	};

	const handleControlsMouseEnter = () => {
		if (!isMinimized) {
			setIsControlsVisible(true);
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
		}
	};

	const handleControlsMouseLeave = () => {
		hideTimeoutRef.current = setTimeout(() => {
			setIsControlsVisible(false);
		}, 1000);
	};

	const handleMinimizeToggle = () => {
		setIsMinimized(!isMinimized);
		setIsControlsVisible(false);
	};

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
		};
	}, []);

	const handleClickOutside = (e: MouseEvent) => {
		const controlsElement = document.getElementById('floating-controls');
		if (controlsElement && !controlsElement.contains(e.target as Node) && isDetached) {
			// Reset everything to initial state
			setControlsPosition({ x: 0, y: 0 });
			setIsDetached(false);
			setIsMinimized(false);
			setIsControlsVisible(false);
		}
	};

	useEffect(() => {
		// Only add listener if controls are not in default position
		if (controlsPosition.x !== 0 || controlsPosition.y !== 0) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [controlsPosition]);

	const handleToggleMultiChart = () => {
		setIsMultiChartEnabled(!isMultiChartEnabled);
		if (!isMultiChartEnabled && !chartLayouts.includes(currentSymbol)) {
			setChartLayouts(prev => [...prev, currentSymbol]);
		}
	};

	const handleSymbolChange = (newSymbol: string) => {
		setCurrentSymbol(newSymbol);
		if (isChartShared) {
			shareChart({
				symbol: newSymbol,
				isLive: true
			});
		}
	};

	const MainContentArea = () => {
		if (isMultiChartEnabled) {
			return (
				<div className="grid grid-cols-2 gap-4 p-4 h-full">
					{chartLayouts.map((symbol, index) => (
						<div key={`${symbol}-${index}`} className="relative rounded-xl overflow-hidden border border-white/5 
							bg-gray-900/20 backdrop-blur-sm">
							<ChartViewer 
								symbol={symbol}
								onSymbolChange={(newSymbol) => {
									const newLayouts = [...chartLayouts];
									newLayouts[index] = newSymbol;
									setChartLayouts(newLayouts);
								}}
								onToggleFavorite={handleStarClick}
								isFavorited={watchlist.includes(symbol)}
								onShare={shareChart}
								compact={true}
							/>
							{chartLayouts.length > 1 && (
								<button
									onClick={() => {
										setChartLayouts(prev => prev.filter((_, i) => i !== index));
									}}
									className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/30 
										rounded-full text-red-400 transition-colors z-10"
								>
									<IoMdRemove size={16} />
								</button>
							)}
						</div>
					))}
					{/* Add Chart Button - Using ChartViewer's search */}
					<div className="rounded-xl border border-white/5 bg-gray-900/20 backdrop-blur-sm">
						<ChartViewer 
							symbol=""
							onSymbolChange={(newSymbol) => {
								setChartLayouts(prev => [...prev, newSymbol]);
							}}
							onToggleFavorite={handleStarClick}
							isFavorited={false}
							compact={true}
							isAddChart={true} // Add this prop to ChartViewer
						/>
					</div>
				</div>
			);
		}

		return (
			<div className="h-full rounded-xl overflow-hidden border border-white/5 
				bg-gray-900/20 backdrop-blur-sm">
				<ChartViewer 
					symbol={currentSymbol}
					onSymbolChange={handleSymbolChange}
					onToggleFavorite={handleStarClick}
					isFavorited={watchlist.includes(currentSymbol)}
					onShare={shareChart}
					onToggleMultiChart={handleToggleMultiChart}
					isMultiChartEnabled={isMultiChartEnabled}
				/>
			</div>
		);
	};

	return (
		<TradesProvider>
			<section 
				className="relative min-h-screen w-full overflow-hidden bg-black/95"
				onMouseMove={handleMouseMove}
			>
				<div className="relative flex size-full">
					{/* Left Panel - Trading Tools */}
					<ResizableBox
						width={panelWidth}
						height={Infinity}
						minConstraints={[60, Infinity]}
						maxConstraints={[600, Infinity]}
						axis="x"
						onResize={handleResize}
						className="transition-all duration-300 ease-in-out"
					>
						<div className="h-full relative bg-gray-900/40 backdrop-blur-md border-r border-white/5">
							{/* Toggle Button */}
							<button
								onClick={togglePanel}
								className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10
									bg-gray-800 rounded-full p-1.5 text-gray-300 hover:bg-gray-700
									shadow-lg border border-white/10 transition-all duration-200
									hover:scale-110 hover:text-emerald-400"
							>
								{isPanelExpanded ? <IoMdContract size={16} /> : <IoMdExpand size={16} />}
							</button>

							{/* Panel Content */}
							<div className={`h-full ${isPanelExpanded ? 'w-full' : 'w-[60px]'}`}>
								{/* Meeting Name Section */}
								{isPanelExpanded && (
									<div className="border-b border-white/5">
										<div className="p-4">
											{/* Live Status & Time */}
											<div className="flex items-center gap-2 mb-2">
												<div className="flex items-center gap-1.5">
													<span className="animate-pulse text-emerald-400 text-[8px]">●</span>
													<span className="text-xs text-emerald-400 font-medium">LIVE</span>
												</div>
												<span className="text-xs text-white/50">•</span>
												<span className="text-xs text-white/50">{new Date().toLocaleTimeString()}</span>
											</div>
											
											{/* Meeting Name */}
											<div className="space-y-1">
												<h1 className="text-xl font-bold text-white/90 truncate">
													{meetingName}
												</h1>
												<p className="text-sm text-white/50">
													Trading Room
												</p>
											</div>

											{/* Participants Preview */}
											<div className="flex items-center gap-2 mt-3">
												<div className="flex -space-x-2">
													{[...Array(3)].map((_, i) => (
														<div
															key={i}
															className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 overflow-hidden"
														>
															<img
																src={user?.imageUrl || `https://picsum.photos/seed/trader${i + 1}/200/200`}
																alt={`Participant ${i + 1}`}
																className="w-full h-full object-cover"
																/>
														</div>
													))}
												</div>
												<span className="text-xs text-white/50">+2 others</span>
											</div>
										</div>
									</div>
								)}

								{/* Rest of the panel content remains the same */}
								{isPanelExpanded && (
									<div className="h-[calc(100vh-64px)] overflow-y-auto">
										<div className="p-4 space-y-6">
											<TraderStats trader={currentTrader} />
											<TradeEntryContainer 
												currentSymbol={currentSymbol}
												onNewTrade={handleNewTrade}
											/>
											<TradingDashboard
												watchlist={watchlist}
												onSymbolSelect={setCurrentSymbol}
												onStarClick={handleStarClick}
											/>
											<TradesFeed />
										</div>
									</div>
								)}
							</div>
						</div>
					</ResizableBox>

					{/* Main Content Area - Chart */}
					<div className="flex-1 h-full flex flex-col bg-black/40">
						<div className="flex-1 p-6">
							<MainContentArea />
						</div>
					</div>

					{/* New Right Panel - Video Feeds */}
					<ResizableBox
						width={videosPanelWidth}
						height={Infinity}
						minConstraints={[60, Infinity]}
						maxConstraints={[600, Infinity]}
						axis="x"
						onResize={(e, { size }) => setVideosPanelWidth(size.width)}
						resizeHandles={['w']}
						className={`transition-all duration-300 ease-in-out ${isVideosPanelExpanded ? '' : 'w-[60px]'}`}
						>
						<div className="h-full relative bg-gray-900/40 backdrop-blur-md border-l border-white/5">
							{/* Toggle Button */}
							<button
								onClick={() => {
									setIsVideosPanelExpanded(!isVideosPanelExpanded);
									setVideosPanelWidth(isVideosPanelExpanded ? 60 : 300);
								}}
								className="absolute -left-3 top-1/2 transform -translate-y-1/2 z-10
									bg-gray-800 rounded-full p-1.5 text-gray-300 hover:bg-gray-700
									shadow-lg border border-white/10 transition-all duration-200
									hover:scale-110 hover:text-emerald-400"
							>
								{isVideosPanelExpanded ? <IoMdContract size={16} /> : <IoMdExpand size={16} />}
							</button>

							{/* Video Grid */}
							<div className="h-full p-2">
								<PaginatedGridLayout
									groupSize={3}
									containerClassName="h-full w-full"
									participantsClassName="grid grid-cols-1 gap-6"
									ParticipantViewUI={({ participant }) => (
										<div className="relative w-full h-[200px] rounded-lg overflow-hidden 
											bg-gray-900/50 backdrop-blur-sm border border-white/10 
											transition-all duration-300 hover:border-emerald-500/30 
											hover:shadow-lg hover:shadow-emerald-500/10 mb-2"
										>
											{/* Video Container */}
											<div className="absolute inset-0 bg-black/20">
												{participant?.videoTrack ? (
													<video
														className="h-full w-full object-cover"
														autoPlay
														muted
														playsInline
													/>
												) : (
													<img 
														src={user?.imageUrl || "https://picsum.photos/seed/default/200/200"}
														alt={participant?.name || "Participant"}
														className="h-full w-full object-cover"
													/>
												)}
											</div>

											{/* Overlay content - made more compact */}
											<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
												<div className="absolute bottom-0 left-0 right-0 p-2 space-y-1">
													{/* Participant Name & Status */}
													<div className="flex items-center justify-between">
														<div className="flex items-center gap-1.5">
															<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
															<span className="text-sm font-medium text-white truncate">
																{participant?.name || user?.firstName || 'Trader'}
															</span>
														</div>
														<span className="text-[10px] text-emerald-400 bg-emerald-500/10 
															px-1.5 py-0.5 rounded-full">
															Live
														</span>
													</div>

													{/* Trading Status - more compact */}
													<div className="flex items-center gap-1.5 text-[10px] text-white/70">
														<span className="bg-white/10 px-1.5 py-0.5 rounded-full">
															3 Active
														</span>
														<span className="text-emerald-400">
															+$1,234
														</span>
													</div>
												</div>
											</div>

											{/* Audio Indicator - made smaller */}
											<div className="absolute top-2 right-2">
												<div className="p-1 rounded-full bg-gray-900/80 backdrop-blur-sm 
													border border-white/10">
													<svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" 
														stroke="currentColor" strokeWidth="2">
														<path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
														<path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5" />
														<path d="M12 19v3" />
													</svg>
												</div>
											</div>
										</div>
									)}
									VideoPlaceholder={() => (
										<div className="flex items-center justify-center w-full h-[200px] rounded-lg 
											bg-gray-800/50 border border-white/5 mb-2">
											<div className="flex flex-col items-center gap-1.5">
												<FaVideo className="text-gray-400 text-2xl" />
												<span className="text-xs text-gray-400">
													Waiting...
												</span>
											</div>
										</div>
									)}
								/>
							</div>
						</div>
					</ResizableBox>

					{/* Updated Floating Controls */}
					<div 
						className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300
							${isControlsVisible && !isMinimized ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
						onMouseEnter={handleControlsMouseEnter}
						onMouseLeave={handleControlsMouseLeave}
					>
						<div className="flex items-center gap-4 p-4 rounded-2xl
							bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-xl
								hover:border-white/20 transition-colors duration-200 relative
								cursor-default"
						>
							{/* Top Bar with Minimize Button */}
							<div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-between px-2">
								{/* Added a drag handle indicator */}
								<div className="flex-1 flex justify-center">
									<div className="w-12 h-1 bg-white/10 rounded-full" />
								</div>
								<button
									onClick={handleMinimizeToggle}
									className="text-white/50 hover:text-white/90 transition-colors
										duration-200 p-1.5 rounded-full hover:bg-white/10"
								>
									<IoMdRemove size={16} />
								</button>
							</div>
							
							{/* Controls Content - Only CallControls */}
							<div className="mt-4 flex items-center gap-4">
								<CallControls onLeave={handleLeave} />
							</div>
						</div>
					</div>

					{/* Updated minimized indicator */}
					{isMinimized && (
						<div 
							className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[100] 
								cursor-pointer transition-all duration-200
								hover:opacity-100 hover:translate-y-0
								opacity-50 translate-y-2"
							onClick={() => {
								setIsMinimized(false);
								setIsControlsVisible(true);
							}}
							onMouseEnter={() => setIsControlsVisible(true)}
						>
							<div className="px-4 py-2 rounded-full bg-gray-900/90 backdrop-blur-md 
								border border-white/10 shadow-lg hover:border-white/20
								transition-all duration-200">
								<div className="w-8 h-1 bg-white/20 rounded-full" />
							</div>
						</div>
					)}
				</div>

				{/* Live Chart Indicator */}
				{liveChartStreamer && liveChartStreamer !== user?.id && (
					<div className="absolute top-6 right-6 flex items-center gap-2 
						bg-gray-900/90 px-4 py-2 rounded-full border border-emerald-500/20 
						shadow-lg backdrop-blur-sm">
						<span className="animate-pulse text-emerald-400 text-[8px]">●</span>
						<span className="text-sm text-white/90 font-medium">Viewing shared chart</span>
					</div>
				)}

				{/* Trade Details Modal */}
				{selectedTrade && (
					<TradeDetailsModal
						trade={selectedTrade}
						traderName={selectedTrader}
						onClose={() => setSelectedTrade(null)}
					/>
				)}
			</section>
		</TradesProvider>
	);
};