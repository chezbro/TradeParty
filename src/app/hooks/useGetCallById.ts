import { useEffect, useState } from "react";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetCallById = (id: string | string[]) => {
	const [call, setCall] = useState<Call>();
	const [isCallLoading, setIsCallLoading] = useState(true);
	const [sharingPermissions, setSharingPermissions] = useState<string[]>([]);

	const client = useStreamVideoClient();

	useEffect(() => {
		if (!client) return;

		const loadCall = async () => {
			try {
				const { calls } = await client.queryCalls({
					filter_conditions: { id },
				});

				if (calls.length > 0) {
					const loadedCall = calls[0];
					setCall(loadedCall);
					
					if (loadedCall.state.createdBy) {
						setSharingPermissions([loadedCall.state.createdBy.id]);
					}
				}

				setIsCallLoading(false);
			} catch (error) {
				console.error(error);
				setIsCallLoading(false);
			}
		};

		loadCall();
	}, [client, id]);

	return { call, isCallLoading, sharingPermissions, setSharingPermissions };
};