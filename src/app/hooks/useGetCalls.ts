import { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";

export const useGetCalls = () => {
	const supabase = createClientComponentClient();
	const client = useStreamVideoClient();
	const [calls, setCalls] = useState<Call[]>();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const loadCalls = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			if (!client || !session?.user?.id) return;

			setIsLoading(true);

			try {
				const { calls } = await client.queryCalls({
					sort: [{ field: "starts_at", direction: -1 }],
					filter_conditions: {
						starts_at: { $exists: true },
						$or: [
							{ created_by_user_id: session.user.id },
							{ members: { $in: [session.user.id] } },
						],
					},
				});

				setCalls(calls);
			} catch (error) {
				console.error(error);
			} finally {
				setIsLoading(false);
			}
		};

		loadCalls();
	}, [client, supabase]);

	const now = new Date();

	const upcomingCalls = calls?.filter(({ state: { startsAt } }: Call) => {
		return startsAt && new Date(startsAt) > now;
	});

	return { upcomingCalls, isLoading };
};