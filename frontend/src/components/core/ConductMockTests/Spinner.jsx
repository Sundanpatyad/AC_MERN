import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ title }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress === 100) {
          clearInterval(timer);
          return 100;
        }
        return prevProgress + 1;
      });
    }, 50);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col mt-10 items-center h-screen bg-black text-gray-200 p-4">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className=""
        >
          <svg className="w-12 h-12 md:w-16 md:h-16 text-slate-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" fill="none" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M12 2a10 10 0 0110 10c0 .33-.02.65-.05.97l-2-.02c.03-.32.05-.64.05-.97a8 8 0 00-16 0c0 .33.02.65.05.97l-2 .02C2.02 12.65 2 12.33 2 12A10 10 0 0112 2z"
            />
          </svg>
        </motion.div>

        <div className="mt-4 text-md md:text-lg text-gray-500 text-center">
          Loading your experience
        </div>

        <div className="mt-2 text-sm md:text-base text-gray-400 text-center">
          Awakening Classes 😉
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;