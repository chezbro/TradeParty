'use client';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
	console.error('Missing Supabase environment variables');
}

import { Toaster } from "react-hot-toast";
import { StreamVideoProvider } from "./providers/StreamVideoProvider";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { TradesProvider } from "@/context/TradesContext";
import { usePathname } from 'next/navigation';
import { memo, useEffect, useState } from 'react';
import { Header } from "@/components/Header";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import "./globals.css";

const AuthenticatedProviders = memo(({ children }: { children: React.ReactNode }) => {
	return (
		<StreamVideoProvider>
			<WatchlistProvider>
				<TradesProvider>
					{children}
				</TradesProvider>
			</WatchlistProvider>
		</StreamVideoProvider>
	);
});

AuthenticatedProviders.displayName = 'AuthenticatedProviders';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
	const supabase = createClientComponentClient();

	useEffect(() => {
		const checkAuth = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			setIsAuthenticated(!!session);
		};
		
		checkAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsAuthenticated(!!session);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	return (
		<html lang="en">
			<body>
				{isAuthenticated && <Header />}
				<div className={isAuthenticated ? "pt-16" : ""}>
					{isAuthenticated ? (
						<AuthenticatedProviders>{children}</AuthenticatedProviders>
					) : (
						children
					)}
				</div>
				<Toaster />
			</body>
		</html>
	);
}