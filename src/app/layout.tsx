'use client';
import { Toaster } from "react-hot-toast";
import { StreamVideoProvider } from "./providers/StreamVideoProvider";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { TradesProvider } from "@/context/TradesContext";
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Header } from "@/components/Header";
import '@stream-io/video-react-sdk/dist/css/styles.css';
import "./globals.css";

const Providers = memo(({ children }: { children: React.ReactNode }) => {
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

Providers.displayName = 'Providers';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

	if (isAuthPage) {
		return (
			<html lang="en">
				<body>
					{children}
					<Toaster />
				</body>
			</html>
		);
	}

	return (
		<html lang="en">
			<body>
				<Header />
				<div className="pt-16">
					<Providers>{children}</Providers>
				</div>
				<Toaster />
			</body>
		</html>
	);
}