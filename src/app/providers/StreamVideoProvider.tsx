"use client";
import supabase from '@/lib/supabase-client';
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { tokenProvider } from "@/actions/stream.actions";
import { PropsWithChildren, useEffect, useState, useCallback } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const StreamVideoProvider = ({ children }: PropsWithChildren) => {
	const [videoClient, setVideoClient] = useState<StreamVideoClient>();

	const setupClient = useCallback(async () => {
		console.log('Setting up Stream client...');
		const { data: { session } } = await supabase.auth.getSession();
		if (!session?.user || !apiKey) return;

		try {
			const user = {
				id: session.user.id,
				name: session.user.email || 'Anonymous',
				image: session.user.user_metadata?.avatar_url || '',
			};

			const client = new StreamVideoClient({
				apiKey,
				user,
				tokenProvider: async () => {
					const token = await tokenProvider();
					return token;
				},
			});

			await client.connectUser({ 
				id: user.id, 
				name: user.name, 
				image: user.image,
				custom: {
					video_permissions: ['camera', 'microphone']
				}
			});

			setVideoClient(client);

			return () => {
				if (client) {
					client.disconnectUser();
				}
			};
		} catch (error) {
			console.error('Error setting up Stream client:', error);
		}
	}, []);

	useEffect(() => {
		let cleanupFn: (() => void) | undefined;

		setupClient().then(cleanup => {
			cleanupFn = cleanup;
		});

		return () => {
			if (cleanupFn) {
				cleanupFn();
			}
		};
	}, [setupClient]);

	if (!videoClient) return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
		</div>
	);

	return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};