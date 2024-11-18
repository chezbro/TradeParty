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
import { useUser } from "@clerk/nextjs";
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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
								<DialogPanel className='w-full max-w-2xl transform overflow-visible rounded-2xl bg-white p-6 align-middle shadow-xl transition-all text-center relative'>
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
	const { user } = useUser();
	const supabase = createClientComponentClient();

	const handleStartMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!client || !user) return;
		try {
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
					created_by: user?.id,
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
				className='text-lg font-bold leading-6 text-green-600'
			>
				Schedule a TradeParty
			</DialogTitle>

			<Description className='text-xs opacity-40 mb-4'>
				Schedule a TradeParty meeting with your cliq
			</Description>

			<form className='w-full' onSubmit={handleStartMeeting}>
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
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className='mt-1 block w-full text-sm py-3 px-4 border-gray-200 border-[1px] rounded mb-3'
					required
					placeholder='Enter a name for this TradeParty session'
				/>

				<label
					className='block text-left text-sm font-medium text-gray-700'
					htmlFor='date'
				>
					Date and Time
				</label>

				<input
					type='datetime-local'
					id='date'
					name='date'
					required
					className='mt-1 block w-full text-sm py-3 px-4 border-gray-200 border-[1px] rounded mb-3 [color-scheme:light]'
					value={dateTime}
					onChange={(e) => setDateTime(e.target.value)}
				/>

				<button className='w-full bg-green-600 text-white py-3 rounded mt-4'>
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
				className='text-lg font-bold leading-6 text-green-600'
			>
				Copy TradeParty Link
			</DialogTitle>

			<Description className='text-xs opacity-40'>
				You can share the TradeParty link with your participants
			</Description>

			<div className='bg-gray-100 p-4 rounded flex items-center justify-between'>
				<p className='text-xs text-gray-500'>
					{`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
				</p>

				<CopyToClipboard
					onCopy={handleCopy}
					text={`${process.env.NEXT_PUBLIC_FACETIME_HOST}/${facetimeLink}`}
				>
					<FaCopy className='text-green-600 text-lg cursor-pointer' />
				</CopyToClipboard>
			</div>

			{copied && (
				<p className='text-red-600 text-xs'>Link copied to clipboard</p>
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
						styleLight="--btn-background: #16a34a; --btn-text: #ffffff; --btn-shadow: #16a34a33; --btn-border: none;"
						size="3"
					/>
				</div>
			</div>
		</div>
	);
};