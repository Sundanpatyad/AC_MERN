
import { motion } from 'framer-motion'
import React from 'react'

function Marquee() {
  return (
    <div data-scroll data-scroll-speed=".1" className='py-10 w-full z-10  bg-zinc-900 text-slate-200 rounded-t-2xl'>
        <div className='text border-t-2 border-b-2 flex border-zinc-300 whitespace-nowrap  pr-2 overflow-hidden font-bold'>
            <motion.h1 initial={{x:0}} animate={{x:'-100%'}} transition={{ease:"linear", repeat:Infinity, duration:5}} className='text-[10vw] leading-none pr-2 font-bold'>JKSSB EXAMS</motion.h1>
            <motion.h1 initial={{x:0}} animate={{x:'-100%'}} transition={{ease:"linear", repeat:Infinity, duration:5}} className='text-[10vw] leading-none pr-2 font-bold'>JKSSB EXAMS</motion.h1>
            <motion.h1 initial={{x:0}} animate={{x:'-100%'}} transition={{ease:"linear", repeat:Infinity, duration:5}} className='text-[10vw] leading-none pr-2 font-bold'>JKSSB EXAMS</motion.h1>
        </div>
    </div>
  )
}

export default Marquee