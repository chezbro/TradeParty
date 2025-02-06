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
import { Fragment, SetStateAction, useState, Dispatch } from "react";
import { useStreamVideoClient, Call } from "@stream-io/video-react-sdk";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AddToCalendarButton } from 'add-to-calendar-button-react';

interface Props {
	enable: boolean;
	setEnable: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CreateLink({ enable, setEnable }: Props) {
	const [showMeetingLink, setShowMeetingLink] = useState(false);
	const [facetimeLink, setFacetimeLink] = useState<string>("");
	const [meetingDescription, setMeetingDescription] = useState<string>("");
	const [meetingDateTime, setMeetingDateTime] = useState<string>("");
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
								<DialogPanel className='w-full max-w-2xl transform overflow-visible rounded-lg bg-white p-8 align-middle shadow-2xl transition-all text-left relative border border-gray-200'>
									{showMeetingLink ? (
										<MeetingLink 
											facetimeLink={facetimeLink} 
											description={meetingDescription}
											dateTime={meetingDateTime}
										/>
									) : (
										<MeetingForm
											setShowMeetingLink={setShowMeetingLink}
											setFacetimeLink={setFacetimeLink}
											setMeetingDescription={setMeetingDescription}
											setMeetingDateTime={setMeetingDateTime}
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

const MeetingForm = ({
	setShowMeetingLink,
	setFacetimeLink,
	setMeetingDescription,
	setMeetingDateTime,
}: {
	setShowMeetingLink: React.Dispatch<SetStateAction<boolean>>;
	setFacetimeLink: Dispatch<SetStateAction<string>>;
	setMeetingDescription: Dispatch<SetStateAction<string>>;
	setMeetingDateTime: Dispatch<SetStateAction<string>>;
}) => {
	const [description, setDescription] = useState<string>("");
	const [dateTime, setDateTime] = useState<string>("");
	const [callDetail, setCallDetail] = useState<Call>();
	const client = useStreamVideoClient();
	const supabase = createClientComponentClient();

	const handleStartMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!client) return;
		try {
			// Get current user session
			const { data: { session } } = await supabase.auth.getSession();
			if (!session?.user) throw new Error("User not authenticated");

			const id = crypto.randomUUID();
			const call = client.call("default", id);
			if (!call) throw new Error("Failed to create meeting");

			await call.getOrCreate({
				data: {
					starts_at: new Date(dateTime).toISOString(),
					custom: {
						description,
					},
				},
			});

			setCallDetail(call);
			setFacetimeLink(`${call.id}`);
			setMeetingDescription(description);
			setMeetingDateTime(dateTime);
			setShowMeetingLink(true);

			console.log({ call });
			console.log("Meeting Created!");

			// Save meeting to Supabase
			const { error } = await supabase
				.from('meetings')
				.insert({
					name: description,
					created_by: session.user.id,  // Use Supabase user ID
					call_id: call.id,
					status: 'scheduled'
				});

			if (error) throw error;
		} catch (error) {
			console.error(error);
			console.error({ title: "Failed to create Meeting" });
		}
	};

	return (
		<>
			<DialogTitle
				as='h3'
				className='text-xl font-semibold leading-6 mb-2'
			>
				Schedule a TradeParty
			</DialogTitle>

			<Description className='text-sm text-gray-500 mb-6'>
				Schedule a TradeParty meeting with friends and peers.
			</Description>

			<form className='w-full' onSubmit={handleStartMeeting}>
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
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className='mt-1 block w-full text-sm py-2.5 px-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors mb-4'
					required
					placeholder='Enter a name for this TradeParty session'
				/>

				<label
					className='block text-left text-sm font-medium text-gray-700 mb-1'
					htmlFor='date'
				>
					Date and Time
				</label>

				<input
					type='datetime-local'
					id='date'
					name='date'
					required
					className='mt-1 block w-full text-sm py-2.5 px-3 bg-white border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors mb-4 [color-scheme:light]'
					value={dateTime}
					onChange={(e) => setDateTime(e.target.value)}
				/>

				<button className='w-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white py-2.5 px-4 rounded-md font-medium hover:from-indigo-600 hover:to-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2 shadow-sm'>
					Create TradeParty
				</button>
			</form>
		</>
	);
};

const MeetingLink = ({ 
	facetimeLink, 
	description, 
	dateTime 
}: { 
	facetimeLink: string;
	description: string;
	dateTime: string;
}) => {
	const [copied, setCopied] = useState<boolean>(false);
	const handleCopy = () => setCopied(true);

	return (
		<div className="space-y-4">
			<DialogTitle
				as='h3'
				className='text-xl font-semibold leading-6 text-gray-900 mb-2'
			>
				Copy TradeParty Link
			</DialogTitle>

			<Description className='text-sm text-gray-500 mb-6'>
				You can share the TradeParty link with your participants
			</Description>

			<div className='bg-gray-50 p-4 rounded-md border border-gray-100 flex items-center justify-between'>
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

			<div className='pt-4 pb-2'>				
				<div className='flex justify-center' style={{ zIndex: 50 }}>
					<AddToCalendarButton
						name={`TradeParty: ${description}`}
						description={`Join TradeParty meeting at: ${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
						startDate={dateTime.split('T')[0]}
						startTime={dateTime.split('T')[1]}
						endTime={new Date(new Date(dateTime).getTime() + 60 * 60 * 1000).toTimeString().slice(0, 5)}
						timeZone="UTC"
						options={['Google', 'Apple', 'Microsoft365', 'Outlook.com', 'Yahoo']}
						buttonStyle="default"
						lightMode="light"
						styleLight="--btn-background: linear-gradient(to right, rgb(99 102 241), rgb(37 99 235)); --btn-text: #ffffff; --btn-shadow: rgba(37 99 235 / 0.2); --btn-border: none;"
						size="3"
					/>
				</div>
			</div>
		</div>
	);
};