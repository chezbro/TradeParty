"use client";
import {
	Dialog,
	DialogTitle,
	DialogPanel,
	Transition,
	Description,
	TransitionChild,
} from "@headlessui/react";
import { FaCopy, FaTimes } from "react-icons/fa";
import CopyToClipboard from "react-copy-to-clipboard";
import { Fragment, useState, Dispatch, SetStateAction, useCallback, memo } from "react";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Props {
	enable: boolean;
	setEnable: React.Dispatch<React.SetStateAction<boolean>>;
}

interface MeetingFormProps {
	setShowMeetingLink: Dispatch<SetStateAction<boolean>>;
	setFacetimeLink: Dispatch<SetStateAction<string>>;
}

const InstantMeeting = memo(({ enable, setEnable }: Props) => {
	const [showMeetingLink, setShowMeetingLink] = useState(false);
	const [facetimeLink, setFacetimeLink] = useState<string>("");

	const closeModal = () => setEnable(false);

	return (
		<Transition appear show={true} as={Fragment}>
			<Dialog as="div" className="relative z-50" onClose={closeModal}>
				<Transition.Child
					as={Fragment}
					enter="ease-out duration-300"
					enterFrom="opacity-0"
					enterTo="opacity-100"
					leave="ease-in duration-200"
					leaveFrom="opacity-100"
					leaveTo="opacity-0"
				>
					<div className="fixed inset-0 bg-black/80" />
				</Transition.Child>

				<div className="fixed inset-0 overflow-y-auto">
					<div className="flex min-h-full items-center justify-center p-4">
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0 scale-95"
							enterTo="opacity-100 scale-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100 scale-100"
							leaveTo="opacity-0 scale-95"
						>
							<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800/50 p-6 backdrop-blur-xl border border-gray-700/50 transition-all">
								<div className="flex justify-between items-center mb-6">
									<Dialog.Title as="h3" className="text-xl font-semibold text-white">
										{showMeetingLink ? 'Meeting Created' : 'Start Instant Meeting'}
									</Dialog.Title>
									<button
										onClick={closeModal}
										className="text-gray-400 hover:text-white transition-colors"
									>
										<FaTimes />
									</button>
								</div>

								{showMeetingLink ? (
									<MeetingLink facetimeLink={facetimeLink} />
								) : (
									<MeetingForm
										setShowMeetingLink={setShowMeetingLink}
										setFacetimeLink={setFacetimeLink}
									/>
								)}

								{showMeetingLink && facetimeLink && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										className="mt-6"
									>
										<p className="text-gray-400 mb-4">Share this link with your participants:</p>
										<div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700/50 break-all font-mono text-sm text-white">
											{`${window.location.origin}/facetime/${facetimeLink}`}
										</div>
										<button
											onClick={() => {
												navigator.clipboard.writeText(`${window.location.origin}/facetime/${facetimeLink}`);
												toast.success('Link copied to clipboard!');
											}}
											className="w-full mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
										>
											Copy Link
										</button>
									</motion.div>
								)}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	);
});

InstantMeeting.displayName = 'InstantMeeting';

const MeetingForm = memo(({ setShowMeetingLink, setFacetimeLink }: MeetingFormProps) => {
	const [meetingName, setMeetingName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const client = useStreamVideoClient();
	const supabase = createClientComponentClient();

	const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!client) return;
		setIsLoading(true);

		try {
			// Get current user session
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user) throw new Error("User not authenticated");

			const call = await client.call("default", crypto.randomUUID());
			await call.getOrCreate();

			// Save meeting details to Supabase
			const { error: insertError } = await supabase
				.from('meetings')
				.insert({
					name: meetingName,
					created_by: session.user.id,
					call_id: call.id,
					status: 'active'
				});

			if (insertError) throw insertError;

			setFacetimeLink(call.id);
			setShowMeetingLink(true);
		} catch (error) {
			console.error("Error creating meeting:", error);
			toast.error("Failed to create meeting");
		} finally {
			setIsLoading(false);
		}
	}, [client, setFacetimeLink, setShowMeetingLink, meetingName, supabase]);

	return (
		<>
			<DialogTitle as="h3" className="text-xl font-semibold leading-6 mb-2">
				Create a TradeParty
			</DialogTitle>

			<Description className='text-sm text-gray-500 mb-6'>
				Start an instant TradeParty meeting with your cliq
			</Description>

			<form className='w-full' onSubmit={handleSubmit}>
				<label
					className='block text-left text-sm font-medium text-gray-700 mb-1'
					htmlFor='description'
				>
					Name
				</label>
				<input
					type='text'
					name='description'
					id='description'
					value={meetingName}
					onChange={(e) => setMeetingName(e.target.value)}
					className='mt-1 block w-full text-sm py-2.5 px-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors mb-4'
					required
					placeholder='Enter a name for this TradeParty session'
				/>

				<button className='w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-indigo-600 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-sm'>
					Create TradeParty
				</button>
			</form>
		</>
	);
});

MeetingForm.displayName = 'MeetingForm';

const MeetingLink = memo(({ facetimeLink }: { facetimeLink: string }) => {
	const [copied, setCopied] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const handleCopy = useCallback(() => {
		setCopied(true);
	}, []);

	const handleStartMeeting = useCallback(() => {
		setIsLoading(true);
	}, []);

	return (
		<>
			<DialogTitle
				as='h3'
				className='text-xl font-semibold leading-6 mb-2'
			>
				Share Your TradeParty
			</DialogTitle>

			<Description className='text-sm text-gray-500 mb-6'>
				Start a new TradeParty and invite others to join.
			</Description>

			<div className='p-4 rounded-md border border-gray-100 flex items-center justify-between'>
				<p className='text-sm text-gray-600 font-mono'>
					{`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
				</p>

				<CopyToClipboard
					onCopy={handleCopy}
					text={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
				>
					<button className='text-gray-500 hover:text-blue-600 transition-colors p-2 rounded-md hover:bg-blue-50'>
						<FaCopy className='text-lg' />
					</button>
				</CopyToClipboard>
			</div>

			{copied && (
				<p className='text-blue-600 text-sm mt-2 flex items-center gap-2'>
					<span className='w-1.5 h-1.5 bg-blue-600 rounded-full'></span>
					Link copied to clipboard
				</p>
			)}

			<Link 
				href={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`} 
				className='w-full block bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-indigo-600 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-sm text-center'
				onClick={handleStartMeeting}
			>
				{isLoading ? (
					<div className="flex items-center justify-center">
						<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
						<span className="ml-2">Cooking it up...</span>
					</div>
				) : (
					"Ready to Start"
				)}
			</Link>
		</>
	);
});

MeetingLink.displayName = 'MeetingLink';

export default InstantMeeting;