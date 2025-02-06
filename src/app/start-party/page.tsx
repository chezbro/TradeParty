'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function StartParty() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, redirect to sign in
        router.push('/auth/signin?redirect=/start-party');
      } else {
        // If authenticated, create and redirect to new meeting room
        router.push('/meeting/new');
      }
    };

    checkAuthAndRedirect();
  }, [router, supabase]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-pulse">Preparing your TradeParty...</div>
    </div>
  );
} 