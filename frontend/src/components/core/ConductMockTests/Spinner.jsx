import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ title }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col mt-20 items-center h-screen bg-black text-gray-200 p-4">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <svg className="w-16 h-16 md:w-20 md:h-20 text-slate-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M12 2a10 10 0 0110 10c0 .33-.02.65-.05.97l-2-.02c.03-.32.05-.64.05-.97a8 8 0 00-16 0c0 .33.02.65.05.97l-2 .02C2.02 12.65 2 12.33 2 12A10 10 0 0112 2z"
            />
          </svg>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full"
              animate={{ boxShadow: ["0 0 10px #ffffff", "0 0 20px #ffffff", "0 0 10px #ffffff"] }}
              transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>

        <div className="mt-4 text-lg md:text-xl text-gray-300 text-center font-semibold tracking-wider">
          Loading your experience
        </div>

        <div className="mt-2 text-base md:text-lg text-gray-400 text-center italic animate-pulse">
          Awakening Classes 😉
        </div>

        <div className="mt-4 text-base md:text-lg text-gray-500 text-center font-mono">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
