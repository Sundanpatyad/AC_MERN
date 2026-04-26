import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FaYoutube } from "react-icons/fa"
import { ArrowRight } from 'lucide-react'
import rank from '../../../assets/Logo/rank1-home.png'
import HighlightText from './HighlightText'
import AnimatedText from './AnimatedText'

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center overflow-hidden noise-bg">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-white/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-20 lg:py-32">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

          {/* ── Left Column ── */}
          <div className="flex-[1.2] text-center lg:text-left space-y-10">

            {/* Pill badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/mocktest"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass glass-hover text-xs font-medium text-white/70 transition-all duration-300"
              >
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                New Mock Tests Live
                <ArrowRight size={12} className="opacity-50" />
              </Link>
            </motion.div>

            {/* Heading */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight"
              >
                Together <br />
                <span className="text-white/40 font-light italic">
                  <AnimatedText texts={['We', 'Yes', 'We']} interval={1800} />
                </span>{' '}
                Can.
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-2xl md:text-3xl font-medium tracking-tight"
              >
                <HighlightText text="Awakening Classes" />
              </motion.div>
            </div>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-white/40 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light"
            >
              Premium coaching for competitive exams. We blend traditional wisdom with modern technology to ensure your success.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              {token ? (
                <>
                  <Link
                    to="/dashboard/enrolled-courses"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
                  >
                    My Learning Path
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="https://www.youtube.com/@awakeningclasses"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold glass glass-hover text-white transition-all duration-300"
                  >
                    <FaYoutube size={18} className="text-red-500" />
                    Watch Lectures
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
                  >
                    Get Started Now
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold glass glass-hover text-white transition-all duration-300"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex gap-12 justify-center lg:justify-start pt-8 border-t border-white/[0.05]"
            >
              {[
                { value: '10k+', label: 'Students' },
                // { value: '50+', label: 'Tests' },
                { value: '95%', label: 'Success' },
              ].map((stat) => (
                <div key={stat.label} className="group cursor-default">
                  <div className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">{stat.value}</div>
                  <div className="text-xs uppercase tracking-widest text-white/30 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right Column ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 w-full max-w-xl lg:max-w-none"
          >
            <a
              href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-emerald-500/10 via-white/5 to-blue-500/10 blur-2xl opacity-50 group-hover:opacity-100 transition duration-700" />
              <div className="relative rounded-3xl overflow-hidden glass border-white/10 aspect-video lg:aspect-square xl:aspect-[4/5]">
                <img
                  src={rank}
                  alt="Rank 1 Success Story"
                  className="w-full h-full object-cover object-top scale-[1.02] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Overlay Content */}
                {/* <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-[10px] font-bold text-black uppercase tracking-tighter">New Success</span>
                    <span className="text-xs text-white/60 font-medium">JKSSB 2024</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white leading-tight">Meet our Rank 1 Achiever</h3>
                  <div className="flex items-center gap-2 text-sm text-white/70 group-hover:text-white transition-colors">
                    <span className="w-8 h-px bg-white/20 group-hover:w-12 transition-all" />
                    Watch full interview
                  </div>
                </div> */}

                {/* Floating Play Button */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full glass border-white/20 flex items-center justify-center scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center translate-x-0.5 shadow-xl">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent" />
                  </div>
                </div>
              </div>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  )
}

export default HeroSection