

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'

export default function RankOneStoryBlack() {
  const [isHovered, setIsHovered] = useState(false)



  return (
    <section className=" bg-black">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-5xl text-center mt-10 font-bold text-white mb-2">Success Story</h2>
          <p className="text-xl text-gray-400">Discover the journey of our top performer</p>
        </motion.div>

        <a href="https://youtu.be/zZqPFZo8IUo?si=MbeDgOr_YtO9bH_x">  
         <motion.div
          className="relative max-w-2xl mx-auto overflow-hidden rounded-lg shadow-2xl cursor-pointer"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
        <img
            src="/rank1.png"
            alt="Rank 1 JKSSB Patwari Exam 2024"
            className="w-full h-auto"
          />
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-full p-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Play className="w-12 h-12 text-black" />
            </motion.div>
          </motion.div>
        </motion.div>
        </a>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mt-6"
        >
          <h3 className="text-2xl font-semibold text-white mb-2">Rank 1 in JKSSB Patwari Exam 2024</h3>
          <p className="text-gray-400">Click to watch the inspiring journey to success</p>
        </motion.div>
      </div>
    </section>
  )
}