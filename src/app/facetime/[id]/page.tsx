"use client";
import { useGetCallById } from "@/app/hooks/useGetCallById";
import supabase from '@/lib/supabase-client';
import {
	StreamCall,
	StreamTheme,
	PaginatedGridLayout,
	SpeakerLayout,
	CallControls,
	StreamVideoParticipant,
	useCall,
	Call
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import { TraderStats } from "@/components/TraderStats";
import { TradesFeed } from "@/components/TradesFeed";
import { TradingDashboard } from "@/components/TradingDashboard";
import { FaChartLine, FaUsers, FaVideo, FaStar, FaChevronDown, FaChevronRight, FaMicrophone, FaCopy } from 'react-icons/fa';
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
import { useMeetingDetails } from '@/app/hooks/useMeetingDetails';
import dynamic from 'next/dynamic';
import { toast } from 'react-hot-toast';

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
	meetingName: string;
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

// Update the StreamVideoParticipant interface to include the properties we're using
interface EnhancedStreamVideoParticipant extends StreamVideoParticipant {
	videoTrack?: MediaStreamTrack;
	name: string;
	isOnline?: boolean;
	isCameraEnabled?: boolean;
	isMicrophoneEnabled?: boolean;
}

// Update the Trade interface to match what's being used
interface ExtendedTrade extends Trade {
	direction: 'long' | 'short';
	entryPrice: number;
	currentPrice: number;
	size: number;
}

// Add new interfaces at the top with other interfaces
interface LiveChart {
	symbol: string;
	sharedBy: string;
	sharedByName?: string;
}

// Add this interface before the MainContentArea component
interface MainContentAreaProps {
	isMultiChartEnabled: boolean;
	chartLayouts: string[];
	currentSymbol: string;
	handleSymbolChange: (symbol: string) => void;
	handleStarClick: (symbol: string) => void;
	watchlist: string[];
	shareChart: (chartData: any) => void;
	isLiveSharing: boolean;
	handleToggleLiveShare: () => void;
	broadcaster: { userId: string; symbol: string } | null;
	user: any; // Replace with proper user type if available
	handleToggleMultiChart: () => void;
	setChartLayouts: (layouts: string[] | ((prev: string[]) => string[])) => void;
	liveCharts: LiveChart[];
	isChartFullscreen: boolean;
	onToggleFullscreen: () => void;
	onTogglePanels: (hideForFullscreen: boolean) => void;
}

// Update the component definition to use the interface
const MainContentArea = memo<MainContentAreaProps>(({ 
	isMultiChartEnabled,
	chartLayouts,
	currentSymbol,
	handleSymbolChange,
	handleStarClick,
	watchlist,
	shareChart,
	isLiveSharing,
	handleToggleLiveShare,
	broadcaster,
	user,
	handleToggleMultiChart,
	setChartLayouts,
	liveCharts,
	isChartFullscreen,
	onToggleFullscreen,
	onTogglePanels
}) => {
	if (isMultiChartEnabled) {
		return (
			<div className={`grid ${isChartFullscreen ? '' : 'grid-cols-2'} gap-4 p-4 h-full`}>
				{/* Add a header section for controls */}
				<div className={`${isChartFullscreen ? 'col-span-full' : 'col-span-2'} flex items-center justify-between mb-4`}>
					<div className="flex items-center gap-2">
						{/* Single Chart View Button */}
						<button
							onClick={() => {
								handleToggleMultiChart();
								// This will use the first chart in the layout when switching back
								handleSymbolChange(chartLayouts[0]);
							}}
							className="flex items-center gap-2 px-3 py-2 rounded-lg
								bg-gray-700 text-gray-300 border border-gray-600 
								hover:bg-gray-600 transition-colors"
						>
							<FaChartLine size={16} />
							<span className="text-sm">Single Chart View</span>
						</button>
					</div>
				</div>

				{/* Existing chart grid */}
				{chartLayouts.map((symbol, index) => (
					<div key={`${symbol}-${index}`} className={`relative rounded-xl overflow-hidden border border-white/5 
						bg-gray-900/20 backdrop-blur-sm ${isChartFullscreen ? 'col-span-full' : ''}`}>
						<ChartViewer 
							symbol={symbol}
							onSymbolChange={(newSymbol) => {
								const newLayouts = [...chartLayouts];
								newLayouts[index] = newSymbol;
								setChartLayouts(newLayouts);
							}}
							onToggleFavorite={handleStarClick}
							isFavorited={watchlist.includes(symbol)}
							compact={!isChartFullscreen}
							onFullscreenChange={(hide: boolean) => {
								onTogglePanels(hide);
								onToggleFullscreen();
							}}
							onShare={shareChart}
						/>
						{chartLayouts.length > 1 && !isChartFullscreen && (
							<button
								onClick={() => {
									setChartLayouts((prev: string[]) => prev.filter((_, i) => i !== index));
								}}
								className="absolute top-2 right-2 p-2 bg-red-500/20 hover:bg-red-500/30 
										rounded-full text-red-400 transition-colors z-10"
							>
								<IoMdRemove size={16} />
							</button>
						)}
					</div>
				))}

				{/* Live shared charts from other participants */}
				{liveCharts
					.filter(chart => chart.sharedBy !== user?.id) // Don't show our own shared chart
					.map((chart) => (
						<div 
							key={chart.sharedBy}
							className="relative rounded-xl overflow-hidden border border-emerald-500/20 
								bg-gray-900/20 backdrop-blur-sm"
						>
							<div className="absolute top-2 left-2 z-10 flex items-center gap-2 
								bg-gray-900/90 px-3 py-1.5 rounded-full border border-emerald-500/20">
								<span className="animate-pulse text-emerald-400 text-[8px]">●</span>
								<span className="text-sm text-white/90">
									{chart.sharedByName}'s Chart
								</span>
							</div>
							<ChartViewer 
								symbol={chart.symbol}
								onSymbolChange={() => {}} // Read-only
								onShare={shareChart}
								compact={true}
								isReadOnly={true} // Add this prop to ChartViewer
							/>
						</div>
				))}

				{/* Add Chart Button */}
				{chartLayouts.length + liveCharts.length < 4 && (
					<div className="rounded-xl border border-white/5 bg-gray-900/20 backdrop-blur-sm">
						<ChartViewer 
							symbol=""
							onSymbolChange={(newSymbol) => {
								setChartLayouts(prev => [...prev, newSymbol]);
							}}
							onToggleFavorite={handleStarClick}
							isFavorited={false}
							compact={true}
							isAddChart={true}
							onShare={shareChart}
						/>
					</div>
				)}
			</div>
		);
	}

	// Single chart view with live broadcast indicator
	return (
		<div className="h-full rounded-xl overflow-hidden border border-white/5 
			bg-gray-900/20 backdrop-blur-sm relative">
			{/* Live Broadcast Indicator */}
			{broadcaster && broadcaster.userId !== user?.id && (
				<div className="absolute top-4 left-4 z-20 flex items-center gap-2 
					bg-gray-900/90 px-3 py-2 rounded-full border border-emerald-500/20">
					<span className="animate-pulse text-emerald-400 text-[8px]">●</span>
					<span className="text-sm text-white/90">
						Viewing Shared Chart
					</span>
				</div>
			)}

			<ChartViewer 
				symbol={currentSymbol}
				onSymbolChange={handleSymbolChange}
				onToggleFavorite={handleStarClick}
				isFavorited={watchlist.includes(currentSymbol)}
				onShare={shareChart}
				onToggleMultiChart={handleToggleMultiChart}
				isMultiChartEnabled={isMultiChartEnabled}
				isLiveSharing={isLiveSharing}
				onToggleLiveShare={handleToggleLiveShare}
				isReadOnly={Boolean(broadcaster && broadcaster.userId !== user?.id)}
				onFullscreenChange={(hide: boolean) => {
					onTogglePanels(hide);
					onToggleFullscreen();
				}}
			/>
		</div>
	);
});

MainContentArea.displayName = 'MainContentArea';

// Add this interface near the top with other interfaces
interface ParticipantViewProps {
    participant: StreamVideoParticipant & {
        user?: {
            name?: string;
            image?: string;
        };
        status?: string;
        tracks?: {
            video?: { enabled?: boolean; track?: MediaStreamTrack };
            audio?: { enabled?: boolean };
        };
    };
}

// Create a separate ParticipantViewUI component
const ParticipantViewUI: React.FC<any> = (props) => {
    const { user } = useSupabaseUser();
    const participant = props.participant;

    console.log('Participant data:', {
        participant,
        userData: participant?.user,
        image: participant?.user?.image,
        name: participant?.user?.name
    });

    const isOnline = participant?.status === 'online' || 
        Boolean(participant?.tracks?.video?.enabled || participant?.tracks?.audio?.enabled);
    const hasVideo = participant?.tracks?.video?.enabled;
    const hasAudio = participant?.tracks?.audio?.enabled;
    
    return (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden 
            bg-gray-900/50 backdrop-blur-sm border border-white/10 
            transition-all duration-300 hover:border-emerald-500/30 
            hover:shadow-lg hover:shadow-emerald-500/10 mb-2"
        >
            {/* Rest of your existing participant view JSX */}
            {/* ... */}
        </div>
    );
};

// Update the MeetingRoomProps interface to include all required props
interface MeetingRoomProps {
	shareChart: (chartData: any) => void;
	sharedCharts: SharedChart[];
	socket: Socket | null;
	meetingName: string;
}

// Update the MobileHeader props interface
interface MobileHeaderProps {
	meetingName: string;
	user: any; // Or use your specific user type
	call: Call | null | undefined; // Allow for undefined
	id: string;
}

// Update the MobileHeader component definition
const MobileHeader = memo(({ meetingName, user, call, id }: MobileHeaderProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const lastScrollY = useRef(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setIsVisible(currentScrollY < lastScrollY.current || currentScrollY < 50);
			lastScrollY.current = currentScrollY;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 md:hidden
			${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
			<div className="bg-gray-900/90 backdrop-blur-md border-b border-white/10 p-4">
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-lg font-bold text-white/90 truncate">{meetingName}</h1>
						<div className="flex items-center gap-2 mt-1">
							<div className="flex items-center gap-1.5">
								<span className="animate-pulse text-emerald-400 text-[8px]">●</span>
								<span className="text-xs text-emerald-400 font-medium">LIVE</span>
							</div>
							{call?.state.createdBy?.id === user?.id && (
								<>
									<span className="text-xs text-white/50">•</span>
									<div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
										<span className="text-xs text-emerald-400 font-medium">Host</span>
									</div>
								</>
							)}
						</div>
					</div>
					<button
						onClick={() => {
							navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${id}`);
							toast.success('Meeting link copied to clipboard');
						}}
						className="p-2 hover:bg-white/5 rounded-lg transition-colors"
					>
						<FaCopy className="w-4 h-4 text-emerald-400" />
					</button>
				</div>
			</div>
		</div>
	);
});

MobileHeader.displayName = 'MobileHeader';

// Update the MeetingRoom component to include mobile layout changes
const MeetingRoom: FC<MeetingRoomProps> = memo(({ shareChart, sharedCharts, socket, meetingName }) => {
	const { user } = useSupabaseUser();
	const params = useParams<{ id: string }>();
	const id = params?.id; // Safely access id with optional chaining
	const call = useCall();
	
	console.log('Creator check:', {
		createdBy: call?.state.createdBy,
		userId: user?.id,
		isCreator: call?.state.createdBy?.id === user?.id
	});

	const router = useRouter();
	const [layout, setLayout] = useState<CallLayoutType>("trading");
	const [isPanelExpanded, setIsPanelExpanded] = useState(true);
	const [panelWidth, setPanelWidth] = useState(300);
	const [selectedTrade, setSelectedTrade] = useState<null | ExtendedTrade>(null);
	const [selectedTrader, setSelectedTrader] = useState<string>('');
	const [isControlsVisible, setIsControlsVisible] = useState(false);
	const [currentSymbol, setCurrentSymbol] = useState('BTCUSDT');
	const [watchlist, setWatchlist] = useState<string[]>(['AAPL']);
	const [isChartShared, setIsChartShared] = useState(false);
	const [liveChartStreamer, setLiveChartStreamer] = useState<string | null>(null);
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
	const [isLiveSharing, setIsLiveSharing] = useState(false);
	const [liveCharts, setLiveCharts] = useState<LiveChart[]>([]);
	const [broadcaster, setBroadcaster] = useState<{ userId: string; symbol: string; userName?: string } | null>(null);
	const [arePanelsVisible, setArePanelsVisible] = useState(true);
	const [isChartFullscreen, setIsChartFullscreen] = useState(false);
	const [sharingPermissions, setSharingPermissions] = useState<string[]>([]);

	// Create a trader object from the current user
	const currentTrader = {
		userId: user?.id || 'anonymous',
		name: user?.firstName && user?.lastName 
			? `${user.firstName} ${user.lastName}`
			: user?.username || 'Anonymous Trader',
		profitLoss: 0,
		
		winRate: 0,
		totalTrades: 0,
		openPositions: 0
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

	const handleTradeClick = (trade: ExtendedTrade, traderName: string) => {
		setSelectedTrade(trade);
		setSelectedTrader(traderName);
	};

	const handleNewTrade = (trade: Trade) => {
		// Implement actual trade handling logic here
		console.log("New trade:", trade);
		// You can emit this to your socket or handle it however needed
	};

	const ParticipantView = ({ participant }: { participant: StreamVideoParticipant }) => {
		const { user } = useSupabaseUser();
		const call = useCall();
		
		return (
			<div className="relative w-full aspect-video rounded-lg overflow-hidden 
				bg-gray-900/50 backdrop-blur-sm border border-white/10 
				transition-all duration-300 hover:border-emerald-500/30"
			>
				{/* This is the actual video element */}
				<div className="absolute inset-0">
					<video
						ref={(el) => {
							if (el) {
								el.srcObject = participant.videoStream || null;
							}
						}}
						autoPlay
						playsInline
						muted={participant.userId === user?.id}
						className="w-full h-full object-cover"
					/>
				</div>

				{/* Participant info overlay */}
				<div className="absolute bottom-0 left-0 right-0 p-3 
					bg-gradient-to-t from-black/90 to-transparent">
					<p className="text-white text-sm font-medium">
						{participant.name || 'Anonymous'}
						{call?.state.createdBy?.id === participant.userId && (
							<span className="ml-2 px-2 py-0.5 text-xs bg-emerald-500/20 
								text-emerald-400 rounded-full border border-emerald-500/20">
								Host
							</span>
						)}
					</p>
				</div>
			</div>
		);
	};

	const handleStarClick = useCallback((symbol: string) => {
		setWatchlist(prev => 
			prev.includes(symbol) 
				? prev.filter(item => item !== symbol)
				: [...prev, symbol]
		);
	}, []);

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

	const handleToggleMultiChart = useCallback(() => {
		setIsMultiChartEnabled(prev => {
			const newValue = !prev;
			if (!newValue && !chartLayouts.includes(currentSymbol)) {
				setChartLayouts(prevLayouts => [...prevLayouts, currentSymbol]);
			}
			return newValue;
		});
	}, [currentSymbol, chartLayouts]);

	const handleSymbolChange = useCallback((newSymbol: string) => {
		setCurrentSymbol(newSymbol);
		
		if (isLiveSharing && call) {
			call.sendCustomEvent({
				type: 'chart_update',
				data: {
					symbol: newSymbol,
					userId: call.state.localParticipant?.userId
				}
			});
		}
	}, [isLiveSharing, call]);

	// Simplified event handler for chart sharing
	useEffect(() => {
		if (!call) return;

		const handleCustomEvent = (event: any) => {
			console.log('Received custom event:', event);
			
			// Extract the actual event data from the custom field
			const eventType = event.custom.type;
			const eventData = event.custom.data;
			
			console.log('Processed event:', { eventType, eventData });
			
			if (eventType === 'chart_update') {
				const { symbol, userId, userName } = eventData;
				console.log('Chart update:', { symbol, userId, userName, currentUser: user?.id });
				
				// If someone else is broadcasting, update our view
				if (userId !== user?.id) {
					setCurrentSymbol(symbol);
					setBroadcaster({ 
						userId, 
						symbol,
						userName: event.user.name || userName // Fallback to event data if needed
					});
				}
			} else if (eventType === 'stop_sharing') {
				const { userId } = eventData;
				if (userId !== user?.id && broadcaster?.userId === userId) {
					setBroadcaster(null);
				}
			}
		};

		call.on('custom', handleCustomEvent);
		return () => call.off('custom', handleCustomEvent);
	}, [call, user?.id, broadcaster]);

	// Handle toggling live share
	const handleToggleLiveShare = useCallback(() => {
		if (!call) return;

		const newIsLiveSharing = !isLiveSharing;
		setIsLiveSharing(newIsLiveSharing);

		// Send event based on new state
		call.sendCustomEvent({
			type: newIsLiveSharing ? 'chart_update' : 'stop_sharing',
			data: {
				symbol: currentSymbol,
				userId: call.state.localParticipant?.userId,
				userName: call.state.localParticipant?.name
			}
		});
	}, [isLiveSharing, call, currentSymbol]);

	// Then add a separate useEffect for any side effects if needed
	useEffect(() => {
		if (!call) return;
		// Any side effects related to live sharing state changes
	}, [isLiveSharing, call]);

	const handleTogglePanels = (hideForFullscreen: boolean) => {
		setArePanelsVisible(!hideForFullscreen);
		setIsPanelExpanded(!hideForFullscreen);
		setIsVideosPanelExpanded(!hideForFullscreen);
		setIsChartFullscreen(hideForFullscreen);
	};

	// Add permission handling
	useEffect(() => {
		if (!call) return;

		const handleCustomEvent = (event: any) => {
			const eventType = event.custom.type;
			const eventData = event.custom.data;

			if (eventType === 'sharing_permission') {
				const { userId, action } = eventData;
				setSharingPermissions(prev => {
					if (action === 'grant' && !prev.includes(userId)) {
						return [...prev, userId];
					} else if (action === 'remove') {
						return prev.filter(id => id !== userId);
					}
					return prev;
				});
			} else if (eventType === 'chart_update') {
				// Only accept updates from users with permission
				if (sharingPermissions.includes(eventData.userId)) {
					setCurrentSymbol(eventData.symbol);
					setBroadcaster({ 
						userId: eventData.userId, 
						symbol: eventData.symbol,
						userName: event.user.name || eventData.userName
					});
				}
			}
		};

		call.on('custom', handleCustomEvent);
		return () => call.off('custom', handleCustomEvent);
	}, [call, sharingPermissions]);

	// Use the memoized MainContentArea in your render
	return (
		<TradesProvider>
			<section 
				className="relative min-h-screen w-full overflow-hidden bg-black/95"
				onMouseMove={handleMouseMove}
			>
				{/* Add Mobile Header */}
				<MobileHeader 
					meetingName={meetingName}
					user={user}
					call={call || null}
					id={id as string}
				/>

				{/* Update the main content layout */}
				<div className="relative flex flex-col md:flex-row size-full">
					{/* Left Panel - Trading Tools */}
					<ResizableBox
						width={panelWidth}
						height={Infinity}
						minConstraints={[60, Infinity]}
						maxConstraints={[600, Infinity]}
						axis="x"
						onResize={handleResize}
						resizeHandles={['e']}
						className={`transition-all duration-300 ease-in-out hidden md:block ${
							arePanelsVisible ? '' : 'hidden'
						}`}
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
												{/* Add Host Badge */}
												{call?.state.createdBy?.id === user?.id && (
													<>
														<span className="text-xs text-white/50">•</span>
														<div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full">
															<span className="text-xs text-emerald-400 font-medium">Host</span>
														</div>
													</>
												)}
											</div>
											
											{/* Meeting Name */}
											<div className="space-y-1">
												<h1 className="text-xl font-bold text-white/90 truncate">
													{meetingName}
												</h1>
												<div className="flex items-center gap-2">
													<p className="text-xs text-white/60">
														Invite Others
													</p>
													{call?.state.createdBy?.id === user?.id && (
														<button
															onClick={() => {
																navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${id}`);
																toast.success('Meeting link copied to clipboard');
															}}
															className="p-1.5 hover:bg-white/5 rounded-lg transition-colors 
																text-emerald-400 hover:text-emerald-300"
															title="Copy invite link"
														>
															<FaCopy size={12} />
														</button>
													)}
												</div>
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
												currentSymbol={currentSymbol}
												onSymbolSelect={setCurrentSymbol}
											/>
										</div>
									</div>
								)}
							</div>
						</div>
					</ResizableBox>

					{/* Main Content Area - Modified for mobile */}
					<div className="flex-1 h-full flex flex-col bg-black/40">
						{/* Chart Section */}
						<div className="flex-1 p-6 md:p-6">
							<MainContentArea 
								isMultiChartEnabled={isMultiChartEnabled}
								chartLayouts={chartLayouts}
								currentSymbol={currentSymbol}
								handleSymbolChange={handleSymbolChange}
								handleStarClick={handleStarClick}
								watchlist={watchlist}
								shareChart={shareChart}
								isLiveSharing={isLiveSharing}
								handleToggleLiveShare={handleToggleLiveShare}
								broadcaster={broadcaster}
								user={user}
								handleToggleMultiChart={handleToggleMultiChart}
								setChartLayouts={setChartLayouts}
								liveCharts={liveCharts}
								isChartFullscreen={isChartFullscreen}
								onToggleFullscreen={() => setIsChartFullscreen(!isChartFullscreen)}
								onTogglePanels={handleTogglePanels}
							/>
						</div>

						{/* Mobile Video Grid */}
						<div className="md:hidden w-full h-[40vh] bg-gray-900/40 backdrop-blur-md border-t border-white/5">
							<div className="h-full p-2">
								<PaginatedGridLayout
									groupSize={4}
									ParticipantViewUI={ParticipantViewUI}
									VideoPlaceholder={() => null}
								/>
							</div>
						</div>
					</div>

					{/* Right Panel - Video Feeds (hidden on mobile) */}
					<ResizableBox
						width={videosPanelWidth}
						height={Infinity}
						minConstraints={[60, Infinity]}
						maxConstraints={[600, Infinity]}
						axis="x"
						onResize={(e, { size }) => setVideosPanelWidth(size.width)}
						resizeHandles={['w']}
						className={`transition-all duration-300 ease-in-out hidden md:block ${
							arePanelsVisible ? '' : 'hidden'
						}`}
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
							<div className="h-full p-2 flex flex-col">
								<div className="flex-1">
									<PaginatedGridLayout
										groupSize={4}
										ParticipantViewUI={ParticipantViewUI}
										VideoPlaceholder={() => null}
										/>
								</div>

								{/* New Invite Section - Only visible to host */}
								{call?.state.createdBy === user?.id && (
									<div className="mt-4 p-4 bg-gray-900/40 rounded-xl border border-white/10">
										<div className="flex flex-col gap-3">
											<h3 className="text-sm font-medium text-white/90">
												Invite Others
											</h3>
											
											<div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg border border-white/5">
												<input 
													type="text"
													readOnly
													value={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${id}`}
													className="flex-1 bg-transparent text-xs text-white/70 outline-none"
												/>
												<button
													onClick={() => {
														navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${id}`);
														// You might want to add a toast notification here
													}}
													className="p-2 hover:bg-white/5 rounded-lg transition-colors"
												>
													<FaCopy className="w-3 h-3 text-emerald-400" />
												</button>
											</div>

											<p className="text-xs text-white/50">
												Share this link with others to invite them to the trading session
											</p>
										</div>
									</div>
								)}
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
								<div className="flex items-center gap-3 p-2">
									<CallControls
										onLeave={handleLeave}
									/>
								</div>
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
});

MeetingRoom.displayName = 'MeetingRoom';

// Create a custom hook for Supabase user
const useSupabaseUser = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoaded(true);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, isLoaded };
};

export default function FacetimePage() {
	const { user, isLoaded } = useSupabaseUser();
	const params = useParams<{ id: string }>();
	const id = params?.id; // Safely access id with optional chaining
	const { call, isCallLoading } = useGetCallById(id as string);
	const [confirmJoin, setConfirmJoin] = useState<boolean>(false);
	const [camMicEnabled, setCamMicEnabled] = useState<boolean>(false);
	const router = useRouter();
	const [sharedCharts, setSharedCharts] = useState<SharedChart[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const { meetingDetails, isLoading: isMeetingLoading } = useMeetingDetails(id || '');
	const [isChartFullscreen, setIsChartFullscreen] = useState(false);

	// Early return if no id is present
	if (!id) {
		router.push('/'); // Redirect to home if no id
		return null;
	}

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
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			transports: ['polling', 'websocket']
		});

		// Add heartbeat to keep connection alive
		const heartbeat = setInterval(() => {
			if (socketInstance.connected) {
				socketInstance.emit('ping');
			}
		}, 30000);

		setSocket(socketInstance);

		return () => {
			clearInterval(heartbeat);
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

	// Add debug logging
	useEffect(() => {
		console.log('Meeting Details:', {
			meetingDetails,
			isLoading: isMeetingLoading,
			id
		});
	}, [meetingDetails, isMeetingLoading, id]);

	// Add debug logging before the render
	useEffect(() => {
		console.log('Host Check:', {
			callCreatedBy: call?.state.createdBy,
			userId: user?.id,
			isHost: call?.state.createdBy === user?.id,
			fullCallState: call?.state,
			userDetails: user
		});
	}, [call?.state.createdBy, user?.id, call?.state, user]);

	useEffect(() => {
		if (call && confirmJoin) {
			// Enable camera and microphone when joining
			call.camera.enable();
			call.microphone.enable();
		}
		
		return () => {
			if (call) {
				call.camera.disable();
				call.microphone.disable();
			}
		};
	}, [call, confirmJoin]);

	if (!user) {
		return <div>Loading...</div>;
	}

	if (isCallLoading || !isLoaded || isMeetingLoading) {
		return (
			<div className="min-h-screen w-full bg-black flex items-center justify-center">
				<p className="text-white/70">Loading TradeParty...</p>
			</div>
		);
	}

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
							meetingName={meetingDetails?.name || "Loading..."}
						/>
					) : (
						<div className='h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-black'>
							<div className='flex flex-col items-center justify-center gap-4 p-12 bg-gray-800/80 backdrop-blur-md rounded-3xl border border-gray-600 shadow-2xl max-w-lg mx-auto'>
								<h1 className='text-6xl font-extrabold text-white mb-2 text-center'>
									{meetingDetails?.name || "Loading..."}
								</h1>
								<p className='text-xl text-gray-300 mb-2 text-center'>
									{call?.state.createdBy?.id === user?.id 
										? "You are the Host."
										: "Ready to join the TradeParty?"}
								</p>
								<div className='flex gap-6'>
									<button 
										onClick={handleJoin} 
										className='px-10 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-200'
									>
										{call?.state.createdBy?.id === user?.id ? 'Start Now' : 'Join Now'}
									</button>
									<button 
										onClick={() => router.push("/")} 
										className='px-10 py-4 bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-200'
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

