import type { Metadata } from "next";
import { Inclusive_Sans } from "next/font/google";
import {
	ClerkProvider,
	SignInButton,
	SignedIn,
	SignedOut,
	UserButton,
} from "@clerk/nextjs";
import "./globals.css";
import "react-datepicker/dist/react-datepicker.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { StreamVideoProvider } from "./providers/StreamVideoProvider";
import Link from "next/link";
import { Toaster } from 'react-hot-toast'

const inter = Inclusive_Sans({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
	title: "TradeParty",
	description: "A video conferencing app for everyone",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<ClerkProvider>
			<html lang='en'>
				<body className={inter.className}>
					<StreamVideoProvider>
						{/* Navigation Bar */}
						<header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-white/10">
							<div className="container mx-auto px-4">
								<div className="flex items-center justify-between h-16">
									{/* Logo/Brand */}
									<Link href="/" className="flex items-center gap-2">
										<span className="text-xl font-bold text-white">TradeParty</span>
										<span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
											Beta
										</span>
									</Link>

									{/* Auth Buttons */}
									<div className="flex items-center gap-4">
										<SignedIn>
											<UserButton 
												afterSignOutUrl="/"
												appearance={{
													elements: {
														avatarBox: "w-9 h-9"
													}
												}}
											/>
										</SignedIn>
										<SignedOut>
											<SignInButton mode="modal">
												<button className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors">
													Sign In
												</button>
											</SignInButton>
										</SignedOut>
									</div>
								</div>
							</div>
						</header>

						{/* Add padding to account for fixed header */}
						<div className="pt-16">
							{children}
						</div>
					</StreamVideoProvider>
					<Toaster />
				</body>
			</html>
		</ClerkProvider>
	);
}