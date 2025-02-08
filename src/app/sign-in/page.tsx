'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
})

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Show confetti before navigation
      setShowConfetti(true)
      
      // Delay navigation to show the confetti
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      router.refresh()
      router.push('/')
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        toast.error(error.message);
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {showConfetti && (
        <div className="fixed inset-0 z-50">
          <ReactConfetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
          />
        </div>
      )}
      
      {/* Left Column - Branding */}
      <motion.div 
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="hidden lg:block w-1/2 relative bg-[#0F172A] overflow-hidden"
      >
        {/* Content Container */}
        <div className="relative h-full flex flex-col p-16">
          {/* Logo Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-bold mb-6">
            <span className="font-bold bg-gradient-to-r from-green-400 to-blue-500 
                            text-transparent bg-clip-text">
                            TradeParty</span>
            </h1>
            <div className="flex items-center space-x-3">
              <div className="h-px flex-grow bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
              <p className="text-lg text-gray-400 font-medium">Trading Made Fun.</p>
            </div>
          </div>

          {/* Main Feature Highlights */}
          <div className="flex-grow">
            <div className="space-y-12 max-w-md">
              <div className="relative">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Live Trading Streams</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Join live trading rooms with expert traders sharing their screens and analysis in real-time.
                    </p>
                  </div>
                </div>
                <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/5 to-transparent rounded-2xl transform -rotate-1"></div>
              </div>

              <div className="relative">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Interactive Charts</h3>
                    <p className="text-gray-400 leading-relaxed">
                      TradingView-powered charts with real-time annotations from session hosts.
                    </p>
                  </div>
                </div>
                <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl transform rotate-1"></div>
              </div>

              <div className="relative">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Live Chat & Q&A</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Interact with hosts and other traders during sessions through chat and live Q&A.
                    </p>
                  </div>
                </div>
                <div className="absolute -z-10 top-0 left-0 w-full h-full bg-gradient-to-r from-indigo-500/5 to-transparent rounded-2xl transform -rotate-1"></div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-auto pt-16">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <p className="text-2xl font-bold text-white">500+</p>
                <p className="text-sm text-gray-400">Live Sessions</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">50+</p>
                <p className="text-sm text-gray-400">Expert Hosts</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">10k+</p>
                <p className="text-sm text-gray-400">Active Members</p>
              </div>
            </div>
          </div>

          {/* Subtle decorative elements */}
          <div className="absolute top-[20%] right-[-200px] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
      </motion.div>

      {/* Right Column - Sign In Form */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">Sign in to join live trading sessions</p>
          </div>

          <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-xl border border-gray-700/50">
            <form onSubmit={handleSignIn} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700/50"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800/50 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="w-full px-4 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 font-medium shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <p className="mt-8 text-center text-sm text-gray-400">
              New to TradeParty?{' '}
              <Link href="/sign-up" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  )
} 