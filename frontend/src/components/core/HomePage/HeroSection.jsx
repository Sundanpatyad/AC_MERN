import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FaYoutube } from 'react-icons/fa'
import { ArrowRight, Play } from 'lucide-react'
import rank from '../../../assets/Logo/rank1-home.png'

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] w-full flex items-center bg-page">
      <div className="page-shell py-10 md:py-14 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="text-center lg:text-left space-y-6 md:space-y-7">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-sm font-semibold tracking-wide text-muted"
            >
              Awakening Classes
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-4xl sm:text-5xl md:text-6xl font-semibold text-fg tracking-tight leading-[1.08]"
            >
              Prepare with purpose.
              <br />
              <span className="text-muted font-medium">Succeed with clarity.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-base md:text-lg text-muted max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Focused coaching and realistic mock tests for competitive exams.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1"
            >
              {token ? (
                <>
                  <Link to="/dashboard/enrolled-courses" className="btn-primary">
                    My courses
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="https://www.youtube.com/@awakeningclasses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    <FaYoutube size={16} className="text-brand" />
                    Lectures
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn-primary">
                    Get started
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/mocktest" className="btn-secondary">
                    Browse tests
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="w-full max-w-lg mx-auto lg:max-w-none"
          >
            <a
              href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative rounded-2xl overflow-hidden bg-surface aspect-[4/3] lg:aspect-[5/4]">
                <img
                  src={rank}
                  alt="Rank 1 success story"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-solid flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <Play size={22} className="text-solid-fg fill-current ml-0.5" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-sm font-medium text-white">JKSSB Rank 1 interview</p>
                  <p className="text-xs text-white/70 mt-1">Watch the full story</p>
                </div>
              </div>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
