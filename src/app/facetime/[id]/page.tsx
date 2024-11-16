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
import { FaChartLine, FaUsers, FaVideo, FaStar } from 'react-icons/fa';
import { TradeEntryPanel } from '@/components/TradeEntryPanel';
import { TradesProvider } from '@/context/TradesContext';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { IoMdExpand, IoMdContract } from 'react-icons/io';
import { ActiveTradeOverlay } from '@/components/ActiveTradeOverlay';
import { TradeDetailsModal } from '@/components/TradeDetailsModal';
import { Trade } from '@/types/trade';
import { FC } from 'react';
import { ChartViewer } from '@/components/ChartViewer';
import { StarIcon } from '@radix-ui/react-icons';

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

export default function FaceTimePage() {
	const { id } = useParams<{ id: string }>();
	const { isLoaded } = useUser();
	const { call, isCallLoading } = useGetCallById(id);
	const [confirmJoin, setConfirmJoin] = useState<boolean>(false);
	const [camMicEnabled, setCamMicEnabled] = useState<boolean>(false);
	const router = useRouter();
	
	useEffect(() => {
		if (camMicEnabled) {
			call?.camera.enable();
			call?.microphone.enable();
		} else {
			call?.camera.disable();
			call?.microphone.disable();
		}

	}, [call, camMicEnabled]);

	const handleJoin = () => { 
		call?.join();
		setConfirmJoin(true)
	}

	if (isCallLoading || !isLoaded) return <p>Loading...</p>;

	if (!call) return (<p>Call not found</p>);

	return (
		<main className='min-h-screen w-full items-center justify-center'>
			<StreamCall call={call}>
			<StreamTheme>
				{confirmJoin ? <MeetingRoom /> : (
					<div className='flex flex-col items-center justify-center gap-5'>
							<h1 className='text-3xl font-bold'>Join Call</h1>
							<p className='text-lg'>Are you sure you want to join this call?</p>
							<div className='flex gap-5'>
								<button onClick={handleJoin} className='px-4 py-3 bg-green-600 text-green-50'>Join</button>
								<button onClick={() => router.push("/")} className='px-4 py-3 bg-red-600 text-red-50'>Cancel</button>
							</div>
						</div>
				)}
				</StreamTheme>
			</StreamCall>
		</main>
	);

}

const MeetingRoom = () => {
	const [layout, setLayout] = useState<CallLayoutType>("trading");
	const [isPanelExpanded, setIsPanelExpanded] = useState(true);
	const [panelWidth, setPanelWidth] = useState(300);
	const router = useRouter();
	const [selectedTrade, setSelectedTrade] = useState<null | Trade>(null);
	const [selectedTrader, setSelectedTrader] = useState<string>('');
	const call = useCall();
	const [isControlsVisible, setIsControlsVisible] = useState(false);
	const [currentSymbol, setCurrentSymbol] = useState<string>('AAPL');
	const [watchlist, setWatchlist] = useState<string[]>(['AAPL']);

	const handleResize = useCallback((e: any, { size }: { size: { width: number } }) => {
		setPanelWidth(size.width);
	}, []);

	const togglePanel = () => {
		setIsPanelExpanded(!isPanelExpanded);
		setPanelWidth(isPanelExpanded ? 60 : 300);
	};

	const handleLeave = () => {
		confirm("Are you sure you want to leave the trading session?") && router.push("/");
	};

	const handleTradeClick = (trade: any, traderName: string) => {
		setSelectedTrade(trade);
		setSelectedTrader(traderName);
	};

	const handleNewTrade = (trade: Trade, participantId: string) => {
		const existingTrades = mockTrades.tradesByParticipant.get(participantId) || [];
		mockTrades.tradesByParticipant.set(participantId, [...existingTrades, trade]);
	};

	const ParticipantView = ({ participant }: { participant: StreamVideoParticipant }) => {
		const participantName = participant?.name || participant?.userId || 'Trader';
		const sessionId = participant?.sessionId || '';
		
		return (
			<div className="relative rounded-lg overflow-hidden shadow-lg bg-gray-800 border border-gray-700 transition-transform hover:scale-[1.02]">
				{/* Original participant video content will be rendered here by the Stream SDK */}
				<div className="absolute bottom-0 left-0 right-0">
					<div className="p-3 bg-gradient-to-t from-black/70 to-transparent">
						<p className="text-white text-sm font-medium mb-2">
							{participantName}
						</p>
					</div>
					<ActiveTradeOverlay 
						trades={mockTrades.tradesByParticipant.get(sessionId) || []}
						onTradeClick={(trade) => handleTradeClick(trade, participantName)}
					/>
				</div>
			</div>
		);
	};

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
								className={`bg-gray-800 border-r border-gray-700 transition-all duration-300 ${
									isPanelExpanded ? '' : 'hover:bg-gray-750'
								}`}
							>
								<div className="h-full relative">
									{/* Toggle Button */}
									<button
										onClick={togglePanel}
										className="absolute -right-3 top-1/2 transform -translate-y-1/2 z-10
												bg-gray-700 rounded-full p-1 text-gray-300 hover:bg-gray-600
												shadow-lg border border-gray-600"
									>
										{isPanelExpanded ? <IoMdContract size={16} /> : <IoMdExpand size={16} />}
									</button>

									{/* Panel Content */}
									<div className={`h-full overflow-hidden ${isPanelExpanded ? 'px-4' : 'px-2'}`}>
										<div className="py-4 border-b border-gray-700">
											<h2 className="text-lg font-semibold text-white flex items-center gap-2">
												<FaChartLine className="text-green-400" />
												{isPanelExpanded && "Trading Dashboard"}
											</h2>
										</div>
										
										{isPanelExpanded && (
											<div className="py-4 space-y-4">
												<TraderStats trader={mockTrader} />
												<div className="border-t border-gray-700 pt-4">
													<h3 className="text-white text-lg font-semibold mb-3">Watchlist</h3>
													<div className="space-y-2">
														{watchlist.map((symbol) => (
															<div 
																key={symbol}
																className="flex items-center justify-between p-2 hover:bg-gray-700 rounded cursor-pointer text-gray-200"
																onClick={() => setCurrentSymbol(symbol)}
															>
																<span>{symbol}</span>
																<FaStar 
																	size={20}
																	className="text-yellow-500"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleStarClick(symbol);
																	}}
																/>
															</div>
														))}
														{watchlist.length === 0 && (
															<p className="text-sm text-gray-400">No starred symbols yet</p>
														)}
													</div>
												</div>
												<TradingDashboard />
												<TradesFeed />
											</div>
										)}
									</div>
								</div>
							</ResizableBox>

							{/* Main Content Area */}
							<div className="flex-1 h-full flex flex-col">
								<div className="flex-1 p-4">
									<ChartViewer 
										symbol={currentSymbol}
										onSymbolChange={(newSymbol: string) => {
											console.log('Symbol changed to:', newSymbol);
											setCurrentSymbol(newSymbol);
										}}
										onShare={(symbol) => {
											console.log(`Sharing chart: ${symbol}`);
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

							{/* Trade Entry Panel */}
							<TradeEntryPanel onNewTrade={(trade: Trade) => {
								const currentParticipantId = call?.sessionId;
								if (currentParticipantId) {
									handleNewTrade(trade, currentParticipantId);
								}
							}} />
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
		if (e.clientY > threshold) {
			setIsControlsVisible(true);
		} else {
			setIsControlsVisible(false);
		}
	};

	const handleStarClick = (symbol: string) => {
		setWatchlist(prev => 
			prev.includes(symbol) 
				? prev.filter(item => item !== symbol)
				: [...prev, symbol]
		);
	};

	return (
		<section 
			className="relative min-h-screen w-full overflow-hidden"
			onMouseMove={handleMouseMove}
		>
			<div className="relative flex size-full items-center justify-center">
				<div className="flex size-full items-center">
					<CallLayout />
				</div>
				<div className={`fixed bottom-0 flex w-full items-center justify-center gap-5 p-4 bg-gray-900/95 backdrop-blur border-t border-gray-800 transition-all duration-300 ${
					isControlsVisible 
						? 'translate-y-0 opacity-100' 
						: 'translate-y-full opacity-0'
				}`}>
					<CallControls onLeave={handleLeave} />
					<select 
						value={layout}
						onChange={(e) => setLayout(e.target.value as CallLayoutType)}
						className="bg-gray-800 text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
					>
						<option value="trading">Trading View</option>
						<option value="grid">Grid View</option>
						<option value="speaker">Speaker View</option>
					</select>
				</div>
			</div>
			{selectedTrade && (
				<TradeDetailsModal
					trade={selectedTrade}
					traderName={selectedTrader}
					onClose={() => setSelectedTrade(null)}
				/>
			)}
		</section>
	);
};