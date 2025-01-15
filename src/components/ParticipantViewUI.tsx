import React from 'react';
import { useSupabaseUser } from '@/app/hooks/useSupabaseUser';
import { useCall } from '../contexts/CallContext';
import { FaShare } from 'react-icons/fa';

const ParticipantViewUI: React.FC<any> = (props) => {
	const { user } = useSupabaseUser();
	const call = useCall();
	const participant = props.participant;
	const isHost = call?.state.createdBy?.id === user?.id;
	const { sharingPermissions, setSharingPermissions } = props;

	const toggleSharingPermission = () => {
		if (!isHost || !participant.userId) return;

		setSharingPermissions((prev: string[]) => {
			if (prev.includes(participant.userId)) {
				// Remove permission
				call?.sendCustomEvent({
					type: 'sharing_permission',
					data: { 
						userId: participant.userId,
						action: 'remove'
					}
				});
				return prev.filter(id => id !== participant.userId);
			} else {
				// Grant permission
				call?.sendCustomEvent({
					type: 'sharing_permission',
					data: { 
						userId: participant.userId,
						action: 'grant'
					}
				});
				return [...prev, participant.userId];
			}
		});
	};

	return (
		<div className="relative w-full aspect-video rounded-lg overflow-hidden 
			bg-gray-900/50 backdrop-blur-sm border border-white/10 
			transition-all duration-300 hover:border-emerald-500/30"
		>
			{/* Existing participant view code... */}

			{/* Add permission controls for host */}
			{isHost && participant.userId !== user?.id && (
				<button
					onClick={toggleSharingPermission}
					className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
						sharingPermissions.includes(participant.userId)
							? 'bg-emerald-500/20 text-emerald-400'
							: 'bg-gray-700/50 text-gray-400'
					}`}
					title={`${sharingPermissions.includes(participant.userId) ? 'Revoke' : 'Grant'} sharing permission`}
				>
					<FaShare size={12} />
				</button>
			)}
		</div>
	);
};

export default ParticipantViewUI; 