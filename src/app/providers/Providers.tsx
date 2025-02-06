'use client';
import { StreamVideoProvider } from "./StreamVideoProvider";
import { WatchlistProvider } from "@/context/WatchlistContext";
import { TradesProvider } from "@/context/TradesContext";
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { Header } from "@/components/Header";
import { Toaster } from "react-hot-toast";
import { SupabaseUserProvider } from "@/contexts/SupabaseUserContext";

export const Providers = memo(({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/sign-in' || pathname === '/sign-up';

  if (isAuthPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-16">
        <SupabaseUserProvider>
          <StreamVideoProvider>
            <WatchlistProvider>
              <TradesProvider>
                {children}
              </TradesProvider>
            </WatchlistProvider>
          </StreamVideoProvider>
        </SupabaseUserProvider>
      </div>
      <Toaster />
    </>
  );
});

Providers.displayName = 'Providers'; 