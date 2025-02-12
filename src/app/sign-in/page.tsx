'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const ReactConfetti = dynamic(() => import('react-confetti'), {
  ssr: false
})

const TutorialVideoModal = dynamic(() => import('@/components/TutorialVideoModal'), {
  ssr: false
})

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [waitlistCount, setWaitlistCount] = useState(0)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
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
      console.log('Starting Google OAuth flow...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'email profile'
        }
      });

      if (error) {
        console.error('OAuth initialization error:', error);
        toast.error(error.message);
        return;
      }

      console.log('OAuth flow initiated:', data);
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Failed to sign in with Google');
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Insert into waitlist table
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }])

      if (error) {
        if (error.code === '23505') { // unique violation
          toast.success('You\'re already on the waitlist! We\'ll notify you when we launch.')
        } else {
          throw error
        }
      } else {
        toast.success('Successfully joined the waitlist!')
        setEmail('')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
      
      <TutorialVideoModal 
        isOpen={isVideoModalOpen} 
        onClose={() => setIsVideoModalOpen(false)} 
      />
      
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
              <p className="text-lg text-gray-400 font-medium">Trade Together, Grow Together.</p>
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
                    <h3 className="text-xl font-semibold text-white mb-2">Live Trading Sessions</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Join live trading rooms where traders share their charts, analysis, and trade setups in real-time.
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
                      TradingView-powered charts with real-time annotation features.
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
                    <h3 className="text-xl font-semibold text-white mb-2">Trading Performance</h3>
                    <p className="text-gray-400 leading-relaxed">
                      Track your trading performance during streams and analyze your history to improve your strategy over time.
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
              <div className="flex flex-col justify-center items-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-500 text-transparent bg-clip-text">Trade</p>
                <p className="text-sm text-gray-400">Together Live</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 text-transparent bg-clip-text">Learn</p>
                <p className="text-sm text-gray-400">From Each Other</p>
              </div>
              <div className="flex flex-col justify-center items-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-500 text-transparent bg-clip-text">Grow</p>
                <p className="text-sm text-gray-400">As One Community</p>
              </div>
            </div>
          </div>

          {/* Subtle decorative elements */}
          <div className="absolute top-[20%] right-[-200px] w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-200px] left-[-100px] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
      </motion.div>

      {/* Right Column - Waitlist Form */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Coming Soon!</h2>
            <p className="text-gray-400">Join the waitlist for early access</p>
          </div>

          <motion.button
            onClick={() => setIsVideoModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mb-8 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Watch a Sneak Peek</span>
          </motion.button>

          <div className="bg-gray-800/50 p-8 rounded-2xl backdrop-blur-xl border border-gray-700/50">
            <form onSubmit={handleJoinWaitlist} className="space-y-6">
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
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join the Waitlist'}
                </button>
              </motion.div>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Get early access to TradeParty.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <img
                    key={i}
                    src={`https://picsum.photos/seed/user${i}/32/32`}
                    alt={`Waitlist user ${i + 1}`}
                    className="w-8 h-8 rounded-full border-2 border-gray-800 object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                Join {waitlistCount > 0 ? `${waitlistCount.toLocaleString()}+` : 'other'} traders on the waitlist
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 