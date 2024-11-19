"use client";
import { useUser } from "@clerk/nextjs";
import { tokenProvider } from "@/actions/stream.actions";
import { StreamVideo, StreamVideoClient } from "@stream-io/video-react-sdk";
import { useState, ReactNode, useEffect } from "react";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;

export const StreamVideoProvider = ({ children }: { children: ReactNode }) => {
	const [videoClient, setVideoClient] = useState<StreamVideoClient>();
	const { user, isLoaded } = useUser();

	useEffect(() => {
		if (!isLoaded || !user || !apiKey) return;
		if (!tokenProvider) return;

		console.log('Clerk user data:', {
			id: user.id,
			name: user.fullName,
			image: user.imageUrl
		});

		const client = new StreamVideoClient({
			apiKey,
			user: {
				id: user.id,
				name: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || 'Anonymous',
				image: user.imageUrl || '',
			},
			tokenProvider,
		});

		setVideoClient(client);

		return () => {
			client.disconnectUser();
		};
	}, [user, isLoaded]);

	if (!videoClient) return null;

	return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};