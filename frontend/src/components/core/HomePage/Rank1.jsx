import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import rank from '../../../assets/Logo/rank1.png'

export default function RankOneStoryBlack() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <section className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[30%] h-[50%] bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Divider */}
        <div className="w-full h-px bg-white/[0.05] mb-24" />

        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">

          {/* Video thumbnail */}
          <div className="flex-1 flex justify-center w-full">
            <a
              href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block w-full max-w-xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition duration-700" />
              <motion.div
                className="relative rounded-3xl overflow-hidden glass border-white/10 aspect-video"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src={rank}
                  alt="Rank 1 JKSSB Patwari Exam 2024"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: isHovered ? 1 : 0.7, scale: isHovered ? 1 : 0.8 }}
                    transition={{ duration: 0.4 }}
                    className="w-16 h-16 rounded-full glass border-white/20 flex items-center justify-center shadow-2xl"
                  >
                    <Play className="w-6 h-6 text-white fill-white ml-1" />
                  </motion.div>
                </div>
              </motion.div>
            </a>
          </div>

          {/* Text */}
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                Success Story
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.1]">
                Excellence Personified:<br />
                <span className="text-white/40 font-light italic">Rank 1 in JKSSB 2024</span>
              </h2>
            </div>
            
            <p className="text-lg text-white/40 leading-relaxed max-w-md mx-auto lg:mx-0 font-light">
              Witness the journey of our student who secured the top rank in the JKSSB Patwari Examination 2024. A story of dedication, strategy, and excellence.
            </p>

            <a
              href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl glass glass-hover text-sm font-semibold text-white transition-all group"
            >
              Watch the full interview
              <Play size={14} className="fill-current group-hover:scale-110 transition-transform" />
            </a>
          </div>

        </div>
      </div>
    </section>
  )
}