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
	useCall,
	Call
} from "@stream-io/video-react-sdk";
import { useParams } from "next/navigation";
import {  useEffect, useState, useCallback, useRef, memo } from "react";
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
import { MeetingRoom } from '@/components/MeetingRoom';

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

// Memoize the MainContentArea component
const MainContentArea = memo(({ 
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
				{/* Your charts */}
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
							isFullscreen={isChartFullscreen}
							onFullscreenChange={onTogglePanels}
						/>
						{chartLayouts.length > 1 && !isChartFullscreen && (
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
				isFullscreen={isChartFullscreen}
				onFullscreenChange={onTogglePanels}
			/>
		</div>
	);
});

MainContentArea.displayName = 'MainContentArea';

export default function FacetimePage() {
	const { id } = useParams<{ id: string }>();
	const { isLoaded } = useUser();
	const { call, isCallLoading } = useGetCallById(id);
	const [confirmJoin, setConfirmJoin] = useState<boolean>(false);
	const [camMicEnabled, setCamMicEnabled] = useState<boolean>(false);
	const router = useRouter();
	const [sharedCharts, setSharedCharts] = useState<SharedChart[]>([]);
	const [socket, setSocket] = useState<Socket | null>(null);
	const { user } = useUser();
	const { meetingDetails, isLoading: isMeetingLoading } = useMeetingDetails(id);
	const [isChartFullscreen, setIsChartFullscreen] = useState(false);

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
			},
			reconnection: true,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			transports: ['websocket'], // Prefer WebSocket
			pooling: true
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
							<div className='flex flex-col items-center justify-center gap-6 p-10 bg-gray-800/70 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-lg'>
								<h1 className='text-5xl font-bold text-white mb-2'>
									{meetingDetails?.name || "Loading..."}
								</h1>
								<p className='text-lg text-gray-300 mb-4'>Ready to join the TradeParty?</p>
								<div className='flex gap-4'>
									<button 
										onClick={handleJoin} 
										className='px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-200'
									>
										{call?.state.createdBy === user?.id ? 'Start Now' : 'Join Now'}
									</button>
									<button 
										onClick={() => router.push("/")} 
										className='px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-transform transform hover:scale-105 duration-200'
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