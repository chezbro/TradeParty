"use client";
import {
	Dialog,
	DialogTitle,
	DialogPanel,
	Transition,
	Description,
	TransitionChild,
} from "@headlessui/react";
import { FaCopy } from "react-icons/fa";
import CopyToClipboard from "react-copy-to-clipboard";
import { Fragment, useState, Dispatch, SetStateAction, useCallback, memo } from "react";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Props {
	enable: boolean;
	setEnable: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InstantMeeting({ enable, setEnable }: Props) {
	const [showMeetingLink, setShowMeetingLink] = useState(false);
	const [facetimeLink, setFacetimeLink] = useState<string>("");

	const closeModal = () => setEnable(false);

	return (
		<>
			<Transition appear show={enable} as={Fragment}>
				<Dialog as='div' className='relative z-[9999]' onClose={closeModal}>
					<TransitionChild
						as={Fragment}
						enter='ease-out duration-300'
							enterFrom='opacity-0'
							enterTo='opacity-100'
							leave='ease-in duration-200'
							leaveFrom='opacity-100'
							leaveTo='opacity-0'
					>
						<div className='fixed inset-0 bg-black/75' />
					</TransitionChild>

					<div className='fixed inset-0 overflow-y-auto'>
						<div className='flex min-h-full items-center justify-center p-4 text-center'>
							<TransitionChild
								as={Fragment}
								enter='ease-out duration-300'
								enterFrom='opacity-0 scale-95'
								enterTo='opacity-100 scale-100'
								leave='ease-in duration-200'
								leaveFrom='opacity-100 scale-100'
								leaveTo='opacity-0 scale-95'
							>
								<DialogPanel className='w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 align-middle shadow-xl transition-all text-center'>
									{showMeetingLink ? (
										<MeetingLink facetimeLink={facetimeLink} />
									) : (
										<MeetingForm
											setShowMeetingLink={setShowMeetingLink}
											setFacetimeLink={setFacetimeLink}
										/>
									)}
								</DialogPanel>
							</TransitionChild>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}

const MeetingForm = memo(({ setShowMeetingLink, setFacetimeLink }: MeetingFormProps) => {
	const [meetingName, setMeetingName] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const client = useStreamVideoClient();

	const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!client) return;
		setIsLoading(true);

		try {
			const call = await client.call("default", crypto.randomUUID());
			await call.getOrCreate();
			setFacetimeLink(call.id);
			setShowMeetingLink(true);
		} catch (error) {
			console.error("Error creating meeting:", error);
			toast.error("Failed to create meeting");
		} finally {
			setIsLoading(false);
		}
	}, [client, setFacetimeLink, setShowMeetingLink]);

	return (
		<>
			<DialogTitle as="h3" className="text-lg font-bold leading-6 text-green-600">
				Create a TradeParty
			</DialogTitle>

			<Description className='text-xs opacity-40 mb-4'>
				Start an instant TradeParty meeting with your cliq
			</Description>

			<form className='w-full' onSubmit={handleSubmit}>
				<label
					className='block text-left text-sm font-medium text-gray-700'
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
					className='mt-1 block w-full text-sm py-3 px-4 border-gray-200 border-[1px] rounded mb-3'
					required
					placeholder='Enter a name for this TradeParty session'
				/>

				<button className='w-full bg-green-600 text-white py-3 rounded mt-4'>
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
				className='text-lg font-bold leading-6 text-green-600'
			>
				Share Your TradeParty
			</DialogTitle>

			<Description className='text-xs opacity-40 mb-4'>
				Start a new TradeParty and invite others to join.
			</Description>

			<div className='bg-gray-100 p-4 rounded flex items-center justify-between'>
				<p className='text-xs text-gray-500'>{`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}</p>

				<CopyToClipboard
					onCopy={handleCopy}
					text={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
				>
					<FaCopy className='text-green-600 text-lg cursor-pointer' />
				</CopyToClipboard>
			</div>

			{copied && (
				<p className='text-red-600 text-xs mt-2'>Link copied to clipboard</p>
			)}

			<Link 
				href={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`} 
				className='w-full block bg-green-600 text-white py-3 rounded mt-4 relative'
				onClick={handleStartMeeting}
			>
				{isLoading ? (
					<div className="flex items-center justify-center">
						<div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
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