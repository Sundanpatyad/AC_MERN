import React from 'react'
import { Spotlight } from '../../ui/Spotlight'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSelector } from 'react-redux'
import { FaYoutube } from "react-icons/fa"
import { CiLogin } from "react-icons/ci"
import rank from '../../../assets/Logo/rank1.png'

// Import your custom components and motion variants
import HighlightText from './HighlightText'
import AnimatedText from './AnimatedText'
import { fadeIn } from '../../common/motionFrameVarients'

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <div className="relative min-h-screen w-full px-16 bg-black overflow-hidden">
      <Spotlight />
      
      <div className="absolute inset-0 bg-black bg-grid-slate-400/[0.2] pointer-events-none"></div>
      
      <div className="relative z-10 container mx-auto px-4 flex flex-col-reverse md:flex-row gap-20 items-center justify-center min-h-screen">
        {/* Left Column - Text Content (on desktop) */}
        <div className="text-center lg:text-left space-y-6 order-2 lg:order-1">
          {/* Mock Tests Link */}
          <Link 
            to="/mocktest" 
            className="inline-block group relative mx-auto lg:mx-0"
          >
            <div className="relative flex items-center space-x-2 bg-zinc-950 rounded-full px-4 py-2 ring-1 ring-white/10 hover:ring-white/20 transition-all duration-300">
              <span className="text-white text-sm font-medium">MockTests</span>
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white"
              >
                <path
                  d="M10.75 8.75L14.25 12L10.75 15.25"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </Link>

          {/* Main Heading */}
          <motion.h1
            variants={fadeIn('left', 0.1)}
            initial='hidden'
            whileInView='show'
            viewport={{ once: false, amount: 0.1 }}
            className="text-4xl md:text-6xl lg:text-5xl xl:text-7xl font-bold text-white mb-4"
          >
            We Know That <br />
            Together <i>
              <AnimatedText
                texts={['We', 'Yes', 'We']}
                interval={1500}
              />
            </i> Can<br />
            <HighlightText text="Awakening Classes" />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeIn('right', 0.1)}
            initial='hidden'
            whileInView='show'
            viewport={{ once: false, amount: 0.1 }}
            className="text-sm md:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 mb-6"
          >
            Transform your learning journey with Awakening Classes. Our innovative platform breaks traditional educational barriers, offering personalized, flexible, and comprehensive learning experiences.
          </motion.p>

          {/* Additional Description */}
          <motion.div
            variants={fadeIn('right', 0.2)}
            initial='hidden'
            whileInView='show'
            viewport={{ once: false, amount: 0.1 }}
            className="text-xs md:text-sm hidden text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-6"
          >
            <ul className="space-y-2 text-left">
              <li>• Adaptive Learning Paths</li>
              <li>• Expert-Led Video Courses</li>
              <li>• Interactive Quizzes & Assessments</li>
              <li>• 24/7 Doubt Resolution</li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 w-full max-w-md mx-auto lg:mx-0">
            {token ? (
              <>
                <Link 
                  to="/dashboard/enrolled-courses" 
                  className="w-full sm:w-auto py-3 px-6 text-sm font-medium text-white border border-slate-600 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Explore More
                </Link>
                <Link
                  to="https://www.youtube.com/@awakeningclasses"
                  target="_blank"
                  className="w-full sm:w-auto py-3 px-6 text-sm font-medium bg-slate-100 text-zinc-900 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-200 transition-colors"
                >
                  <FaYoutube className="text-lg" />
                  <span>Free Youtube Lectures</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="w-full sm:w-auto py-3 px-6 text-sm font-semibold text-white border border-slate-600 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  Login to your account
                </Link>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto py-3 px-6 text-sm font-semibold bg-slate-100 text-zinc-900 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-200 transition-colors"
                >
                  <CiLogin className="text-lg" />
                  <span>Signup for free</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Image (on desktop) */}
        <div className="order-1 lg:order-2 mb-8 lg:mb-0 flex items-center justify-center">
          <div className="relative">
            <a href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x" >
              <img 
                src={rank} 
                alt="Awakening Classes" 
                className="w-full max-w-xl rounded-2xl shadow-2xl transfor transition-transform duration-300"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-2xl text-center">
                <h3 className="text-sm md:text-base font-semibold">Interactive Learning Platform</h3>
                <p className="text-xs md:text-sm text-slate-300">
                  Learn, Grow, and Achieve Your Potential
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection