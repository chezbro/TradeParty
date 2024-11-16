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
import { ActiveTradeOverlay } from '@/components/ActiveTradeOverlay';
import { TradeDetailsModal } from '@/components/TradeDetailsModal';
import { Trade } from '@/types/trade';
import { FC } from 'react';
import { ChartViewer } from '@/components/ChartViewer';
import { StarIcon } from '@radix-ui/react-icons';
import { io, Socket } from "socket.io-client";
import Draggable from 'react-draggable';
import { WatchlistContainer } from '@/components/WatchlistContainer';

type CallLayoutType = "grid" | "speaker-left" | "speaker-right" | "trading";

interface Trader {
	name: string;
	profitLoss: number;
	winRate: number;
	totalTrades: number;
	// Add other trader properties as needed
}

// Mock trader data (you can replace this with real data from your context/API)
const mockTrader: Trader = {
	name: "John Doe",
	profitLoss: 1250.50,
	winRate: 68.5,
	totalTrades: 45,
};

// Add this mock data (replace with real data later)
const mockTrades = {
	tradesByParticipant: new Map<string, Array<Trade>>()
};

interface SharedChart {
	id: string;
	data: any;
	sharedBy: string;
}

interface MeetingRoomProps {
	shareChart: (chartData: any) => void;
	sharedCharts: SharedChart[];
	socket: Socket | null;
}

// Add this near the top of the file with other interfaces
interface MockParticipant extends StreamVideoParticipant {
	name: string;
	userId: string;
	sessionId: string;
	image: string;
	activeTrades: Trade[];
}

// Add this before the MeetingRoom component
const mockParticipants: MockParticipant[] = [
	{
		name: "Sarah Chen",
		userId: "trader_1",
		sessionId: "session_1",
		image: "https://picsum.photos/seed/trader1/200/200",
		activeTrades: [
			{
				id: "t1",
				symbol: "AAPL",
				type: "LONG",
				entry: 175.50,
				target: 180.00,
				stopLoss: 173.00,
				timestamp: new Date().toISOString(),
				status: "OPEN",
				profitLoss: 250.75,
				pnl: 250.75
			}
		]
	},
	{
		name: "Marcus Rodriguez",
		userId: "trader_2",
		sessionId: "session_2",
		image: "https://picsum.photos/seed/trader2/200/200",
		activeTrades: [
			{
				id: "t2",
				symbol: "TSLA",
				type: "SHORT",
				entry: 242.30,
				target: 235.00,
				stopLoss: 245.00,
				timestamp: new Date().toISOString(),
				status: "OPEN",
				profitLoss: -120.50,
				pnl: -120.50
			}
		]
	},
	{
		name: "Emma Thompson",
		userId: "trader_3",
		sessionId: "session_3",
		image: "https://picsum.photos/seed/trader3/200/200",
		activeTrades: [
			{
				id: "t3",
				symbol: "META",
				type: "LONG",
				entry: 480.25,
				target: 495.00,
				stopLoss: 475.00,
				timestamp: new Date().toISOString(),
				status: "OPEN",
				profitLoss: 875.25,
				pnl: 875.25
			}
		]
	}
];

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

const MeetingRoom = ({ shareChart, sharedCharts, socket }: MeetingRoomProps) => {
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

	const handleTradeClick = (trade: any, traderName: string) => {
		setSelectedTrade(trade);
		setSelectedTrader(traderName);
	};

	const handleNewTrade = (trade: Trade, participantId: string) => {
		const existingTrades = mockTrades.tradesByParticipant.get(participantId) || [];
		mockTrades.tradesByParticipant.set(participantId, [...existingTrades, trade]);
	};

	// Update the ParticipantView component
	const ParticipantView = ({ participant }: { participant: StreamVideoParticipant }) => {
		const mockParticipant = mockParticipants[Math.floor(Math.random() * mockParticipants.length)] || {
			name: participant?.name || participant?.userId || 'Trader',
			sessionId: participant?.sessionId || '',
			image: "https://picsum.photos/seed/default/200/200",
			activeTrades: []
		};
		
		return (
			<div className="relative rounded-xl overflow-hidden bg-gray-900/50 backdrop-blur-sm 
				border border-gray-800/50 transition-all duration-300 hover:border-gray-700/50
				hover:shadow-lg hover:shadow-emerald-500/5">
				{/* Participant Video/Image */}
				<img 
					src={mockParticipant.image} 
					alt={mockParticipant.name}
					className="w-full h-full object-cover"
				/>
				
				{/* Participant Info & Trades Overlay */}
				<div className="absolute inset-0 flex flex-col justify-end">
					{/* Active Trades Section */}
					<div className="p-3 space-y-2 bg-gradient-to-t from-gray-900/95 via-gray-900/80 to-transparent">
						{/* Trader Name */}
						<div className="flex items-center justify-between">
							<p className="text-white font-medium">{mockParticipant.name}</p>
							<span className="text-xs text-emerald-400">
								{mockParticipant.activeTrades.length} Active {mockParticipant.activeTrades.length === 1 ? 'Trade' : 'Trades'}
							</span>
						</div>
						
						{/* Active Trades List */}
						<div className="space-y-1.5">
							{mockParticipant.activeTrades.map((trade) => (
								<div
									key={trade.id}
									onClick={() => handleTradeClick(trade, mockParticipant.name)}
									className="group flex items-center gap-2 p-1.5 rounded-lg 
										bg-white/5 hover:bg-white/10 cursor-pointer 
										transition-all duration-200 border border-white/10"
								>
									{/* Symbol & Type */}
									<div className="flex items-center gap-2 flex-1">
										<span className={`text-xs px-1.5 py-0.5 rounded font-medium
											${trade.type === 'LONG' 
												? 'bg-green-500/20 text-green-400' 
												: 'bg-red-500/20 text-red-400'}`}>
											{trade.type}
										</span>
										<span className="text-white/90 font-medium">{trade.symbol}</span>
									</div>
									
									{/* PnL */}
									<div className={`text-sm font-medium
										${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
										{trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
									</div>
									
									{/* View Details Icon */}
									<div className="opacity-0 group-hover:opacity-100 transition-opacity">
										<svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	};

	// Update the mockTrades object to include the mock participants' trades
	mockParticipants.forEach(participant => {
		mockTrades.tradesByParticipant.set(participant.sessionId, participant.activeTrades);
	});

	const CallLayout = () => {
		switch (layout) {
			case "grid":
				return (
					<div className="grid grid-cols-3 gap-4 p-4 h-full">
						<PaginatedGridLayout
							VideoPlaceholder={() => (
								<div className="flex items-center justify-center h-full bg-gray-800 rounded-lg">
									<FaVideo className="text-gray-400 text-4xl" />
								</div>
							)}
							ParticipantViewUI={(props) => <ParticipantView {...props} />}
						/>
					</div>
				);
			case "trading":
				return (
					<TradesProvider>
						<div className="flex h-full bg-gray-900">
							{/* Resizable Left Panel */}
							<ResizableBox
								width={panelWidth}
								height={Infinity}
								minConstraints={[60, Infinity]}
								maxConstraints={[600, Infinity]}
								axis="x"
								onResize={handleResize}
								className="h-screen transition-all duration-300 ease-in-out"
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
										<div className="p-4 border-b border-white/5">
											<h2 className={`font-medium flex items-center gap-3 text-white/90
												${isPanelExpanded ? 'text-lg' : 'justify-center'}`}>
												<FaChartLine className="text-emerald-400 text-xl" />
												{isPanelExpanded && "Trading Dashboard"}
											</h2>
										</div>
										
										{isPanelExpanded && (
											<div className="h-[calc(100vh-64px)] overflow-y-auto">
												<div className="p-4 space-y-6">
													<TraderStats trader={mockTrader} />
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

							{/* Main Content Area */}
							<div className="flex-1 h-full flex flex-col">
								<div className="flex-1 p-4 relative">
									<ChartViewer 
										symbol={currentSymbol}
										onSymbolChange={(newSymbol: string) => {
											setCurrentSymbol(newSymbol);
											if (isChartShared) {
												shareChart({
													symbol: newSymbol,
													isLive: true
												});
											}
										}}
										onToggleFavorite={handleStarClick}
										isFavorited={watchlist.includes(currentSymbol)}
									/>
								</div>
								<div className="h-1/2">
									<div className="grid grid-cols-3 gap-4 p-4 h-full">
										<SpeakerLayout
											participantsBarPosition="right"
											ParticipantViewUIBar={(props) => <ParticipantView {...props} />}
											ParticipantViewUISpotlight={(props) => <ParticipantView {...props} />}
										/>
									</div>
								</div>
							</div>

							{/* Bottom Action Buttons */}
							<div className="flex items-center gap-4 p-4 bg-gray-800 border-t border-gray-700">
								<TradeEntryPanel onNewTrade={(trade: Trade) => {
									const currentParticipantId = call?.sessionId;
									if (currentParticipantId) {
										handleNewTrade(trade, currentParticipantId);
									}
								}} />
								
								{/* Share Chart Button */}
								{isChartShared ? (
									<button
										onClick={() => {
											setIsChartShared(false);
											socket?.emit('stop-chart-stream');
											setLiveChartStreamer(null);
										}}
										className="flex items-center gap-2 bg-red-500 hover:bg-red-600 
											px-4 py-2 rounded-lg text-white font-medium transition-colors
											border border-red-400"
									>
										<span className="animate-pulse text-white text-lg">●</span>
										Stop Sharing Chart
									</button>
								) : (
									<button
										onClick={() => {
											setIsChartShared(true);
											shareChart({
												symbol: currentSymbol,
												isLive: true
											});
											setLiveChartStreamer(user?.id || null);
										}}
										className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 
											px-4 py-2 rounded-lg text-white font-medium transition-colors
											border border-blue-400"
									>
										<svg 
											className="w-5 h-5 text-white" 
											viewBox="0 0 24 24" 
											fill="none" 
											stroke="currentColor" 
											strokeWidth="2"
										>
											<path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
										</svg>
										Share Chart Live
									</button>
								)}
							</div>
						</div>
					</TradesProvider>
				);
			default:
				return (
					<SpeakerLayout 
						participantsBarPosition='right' 
						ParticipantViewUIBar={(props) => <ParticipantView {...props} />}
					/>
				);
		}
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		const threshold = window.innerHeight - 100; // 100px from bottom
		
		// Only auto-hide if controls are at the bottom (default position)
		const shouldAutoHide = controlsPosition.x === 0 && controlsPosition.y === 0;
		
		if (shouldAutoHide && e.clientY > threshold) {
			setIsControlsVisible(true);
			// Clear any existing timeout
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
			// Set new timeout to hide controls
			hideTimeoutRef.current = setTimeout(() => {
				if (!isDragging && !isHovering) {
					setIsControlsVisible(false);
				}
			}, 2000); // 2 second delay
		} else if (shouldAutoHide) {
			// Clear any existing timeout
			if (hideTimeoutRef.current) {
				clearTimeout(hideTimeoutRef.current);
			}
			hideTimeoutRef.current = setTimeout(() => {
				if (!isDragging && !isHovering) {
					setIsControlsVisible(false);
				}
			}, 2000);
		}
	};

	const handleStarClick = (symbol: string) => {
		setWatchlist(prev => 
			prev.includes(symbol) 
				? prev.filter(item => item !== symbol)
				: [...prev, symbol]
		);
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

	return (
		<TradesProvider>
			<section 
				className="relative min-h-screen w-full overflow-hidden bg-black/95"
				onMouseMove={handleMouseMove}
			>
				<div className="relative flex size-full">
					{/* Left Panel */}
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
								<div className="p-4 border-b border-white/5">
									<h2 className={`font-medium flex items-center gap-3 text-white/90
										${isPanelExpanded ? 'text-lg' : 'justify-center'}`}>
										<FaChartLine className="text-emerald-400 text-xl" />
										{isPanelExpanded && "Trading Dashboard"}
									</h2>
								</div>
								
								{isPanelExpanded && (
									<div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)]">
										<TraderStats trader={mockTrader} />
										
										<div className="space-y-4">
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

					{/* Main Content Area */}
					<div className="flex-1 h-full flex flex-col bg-black/40">
						<div className="flex-1 p-6">
							<div className="h-full rounded-xl overflow-hidden border border-white/5 
								bg-gray-900/20 backdrop-blur-sm">
								<ChartViewer 
									symbol={currentSymbol}
									onSymbolChange={handleSymbolChange}
									onToggleFavorite={handleStarClick}
									isFavorited={watchlist.includes(currentSymbol)}
									onShare={shareChart}
								/>
							</div>
						</div>

						{/* Video Grid */}
						<div className="h-1/3 p-4">
							<div className="h-full rounded-xl overflow-hidden border border-white/5 
								bg-gray-900/20 backdrop-blur-sm">
								<SpeakerLayout
									participantsBarPosition="right"
									ParticipantViewUIBar={(props) => <ParticipantView participant={props.participant} />}
									ParticipantViewUISpotlight={(props) => <ParticipantView participant={props.participant} />}
								/>
							</div>
						</div>
					</div>

					{/* Floating Controls */}
					<Draggable
						position={controlsPosition}
						onStart={() => {
							setIsDragging(true);
							setIsDetached(true);
						}}
						onStop={(e, data) => {
							setIsDragging(false);
							setControlsPosition({ x: data.x, y: data.y });
						}}
						bounds="parent"
					>
						<div 
							id="floating-controls"
							className={`fixed z-[100] transition-all duration-300
								${isControlsVisible || isDragging || isHovering || isDetached 
								  ? 'opacity-100' 
								  : 'opacity-0'}
								${isMinimized ? 'scale-75' : 'scale-100'}`}
							style={{
								touchAction: 'none',
								position: 'fixed',
								left: '50%',
								bottom: '24px',
								
								transform: isDetached 
									? `translate(${controlsPosition.x}px, ${controlsPosition.y}px) ${isMinimized ? 'scale(0.75)' : 'scale(1)'}` 
									: `translate(-50%, 0) ${isMinimized ? 'scale(0.75)' : 'scale(1)'}`,
							}}
							onMouseEnter={() => setIsHovering(true)}
							onMouseLeave={() => setIsHovering(false)}
						>
							<div className={`handle flex items-center gap-4 p-4 rounded-2xl
								bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-xl
								hover:border-white/20 transition-colors duration-200 relative
								${isMinimized ? 'opacity-75 hover:opacity-100' : ''}`}
							>
								{/* Top Bar with Drag Handle and Minimize Button */}
								<div className="absolute top-0 left-0 right-0 h-6 flex items-center justify-center">
									{/* Drag Handle */}
									<div className="w-12 h-1 bg-white/20 rounded-full cursor-move 
										hover:bg-white/30 transition-colors duration-200"
									/>
									
									{/* Minimize Button */}
									<button
										onClick={(e) => {
											e.stopPropagation();
											if (isDetached) {
												// If detached, clicking minimize returns it to bottom
												setIsDetached(false);
												setControlsPosition({ x: 0, y: 0 });
												setIsMinimized(false);
											} else {
												// If at bottom, just toggle minimize state
												setIsMinimized(!isMinimized);
											}
										}}
										className="absolute right-2 top-1/2 -translate-y-1/2
											text-white/50 hover:text-white/90 transition-colors
											duration-200 p-1 rounded-full hover:bg-white/10"
									>
										<IoMdRemove size={16} />
									</button>
								</div>
								
								{/* Controls Content */}
								<div className={`mt-4 flex items-center gap-4 transition-all duration-300
									${isMinimized ? 'opacity-75' : 'opacity-100'}`}
								>
									<CallControls onLeave={handleLeave} />
									<div className="h-8 w-px bg-white/10" />
									<select 
										value={layout}
										onChange={(e) => setLayout(e.target.value as CallLayoutType)}
										className="bg-gray-800 text-white/90 rounded-lg px-4 py-2 text-sm
											border border-white/10 focus:outline-none focus:ring-2 
											focus:ring-emerald-500/50 transition-all duration-200
											cursor-pointer"
									>
										<option value="trading">Trading View</option>
										<option value="grid">Grid View</option>
										<option value="speaker">Speaker View</option>
									</select>
								</div>
							</div>
						</div>
					</Draggable>
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