'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SignIn() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectPath = searchParams.get('redirect') || '/';

  const handleSignIn = async (provider: 'google' | 'github') => {
    const supabase = createClientComponentClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectPath}`,
      },
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-8">Sign in to start your TradeParty</h1>
      <div className="space-y-4">
        <button
          onClick={() => handleSignIn('google')}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Continue with Google
        </button>
        <button
          onClick={() => handleSignIn('github')}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900"
        >
          Continue with GitHub
        </button>
      </div>
    </div>
  );
} 