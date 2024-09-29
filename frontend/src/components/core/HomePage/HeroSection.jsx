import React from 'react'
import { Spotlight } from '../../ui/Spotlight'
import { Link } from 'react-router-dom'
import HighlightText from './HighlightText'
import { HoverBorderGradientDemo } from '../../ui/homebutton'
import AnimatedText from './AnimatedText'
import { motion } from 'framer-motion'
import { fadeIn } from '../../common/motionFrameVarients'
import { useSelector } from 'react-redux'
import { FaYoutube } from "react-icons/fa";
import { CiLogin } from "react-icons/ci";

const HeroSection = () => {
  const { token } = useSelector((state) => state.auth)

  return (
    <>
      <Spotlight />
      <div className=' md:h-[100vh] w-full bg-black bg-grid-slate-400/[0.2] relative flex items-center flex-col'>
        <div className="absolute cursor-pointer inset-0 w-full h-full bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>

        <Link to={"/mocktest"} className="bg-zinc-900 no-underline mt-20 group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6  text-white inline-block">
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <div className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-0.5 px-4 ring-1 ring-white/10 ">
            <span>
              MockTests
            </span>
            <svg
              fill="none"
              height="16"
              viewBox="0 0 24 24"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
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
          <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
        </Link>

        <motion.div
          id='heading-hero'
          variants={fadeIn('left', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='text-center z-20 text-gray-200 text-4xl mt-6 font-semibold w-80 lg:w-full lg:text-8xl'
        >
          We Know That <br />
          Together <i>
            <AnimatedText
              texts={['We', 'Yes', 'We']}
              interval={1500}
            />
          </i> Can<br />
          <HighlightText text={"Awakening Classes"} />
        </motion.div>

        <motion.div
          variants={fadeIn('right', 0.1)}
          initial='hidden'
          whileInView={'show'}
          viewport={{ once: false, amount: 0.1 }}
          className='mt-2 w-[80%] text-center text-xs lg:text-lg text-slate-200'
        >
          With our online courses, you can learn at your own pace, from anywhere in the world, and get access to a wealth of resources, quizzes, and personalized feedback from instructors.
        </motion.div>

        {token ?
          <div className='flex mt-10 flex-col md:flex-row w-72 md:w-full align-center justify-center gap-4 z-10'>
            <Link to={"/dashboard/enrolled-courses"} className='text-md text-sm border  border-slate-600 rounded-xl px-6 py-2 text-center'>
              Explore More
              {/* <HoverBorderGradientDemo title={"Explore More"} /> */}
            </Link>
            <Link
              to={"https://www.youtube.com/@awakeningclasses"}
              className='text-md flex items-center justify-center bg-slate-100 text-zinc-900 text-center rounded-xl px-6 py-2'
            >
              <FaYoutube className="mr-2 text-md" />
              Free Youtube Lectures
            </Link>

          </div>
          :

<>
          <div className='flex mt-10 flex-col md:flex-row w-72 md:w-full align-center justify-center gap-4 z-10'>
            <Link to={"/login"} className='text-md text-sm border font-semibold  border-slate-600 rounded-xl px-6 py-2 text-center'>
              Login to your account
              {/* <HoverBorderGradientDemo title={"Explore More"} /> */}
            </Link>
            <Link
              to={"/signup"}
              className='text-md flex items-center font-semibold justify-center bg-slate-100 text-zinc-900 text-center rounded-xl px-4 py-2'
            >
              <CiLogin className="mr-2 text-md" />
              Signup for free
            </Link>

          </div>
         
          </>
        }
        <div className="w-full mt-10 md:mt-20 overflow-hidden">
        </div>
      </div>
    </>
  )
}

export default HeroSection;