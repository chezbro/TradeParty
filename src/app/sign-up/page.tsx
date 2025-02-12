'use client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleJoinWaitlist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email }])

      if (error) {
        if (error.code === '23505') {
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
      {/* Left Column - Branding */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-12 relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-6">
            TradeParty
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            Join the Future of Social Trading
          </p>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-emerald-500/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Live Chart Sharing</h3>
                <p className="text-gray-400">Share your TradingView charts in real-time</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-blue-500/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Multi-Chart Layout</h3>
                <p className="text-gray-400">View and analyze multiple charts simultaneously</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Trading Community</h3>
                <p className="text-gray-400">Trade and learn together with like-minded traders</p>
              </div>
            </div>
          </div>
          <div className="mt-12">
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-800"></div>
                ))}
              </div>
              <p className="text-sm text-gray-400">Join 10,000+ traders who use TradeParty daily</p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 backdrop-blur-3xl"></div>
      </motion.div>

      {/* Right Column - Waitlist Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900"
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Coming Soon</h2>
            <p className="text-gray-400">Be the first to experience TradeParty</p>
          </div>

          <div className="text-center p-8 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-4">Join the Waitlist</h2>
            <p className="text-gray-400 mb-6">
              We're currently in private beta. Join our waitlist to get early access when we launch.
            </p>
            <form onSubmit={handleJoinWaitlist} className="space-y-6">
              <div>
                <input
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
                  className="w-full px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </motion.div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
              Get notified when we launch and receive exclusive early access benefits
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 