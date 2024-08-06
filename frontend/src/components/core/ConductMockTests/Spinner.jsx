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

    const textTimer = setInterval(() => {
      setLoadingText((prevText) => {
        if (prevText === 'Loading Mock Test...') return 'Loading Mock Test';
        return prevText + '.';
      });
    }, 500);

    return () => {
      clearInterval(timer);
      clearInterval(textTimer);
    };
  }, []);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-black text-gray-200 p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-4xl font-bold mb-8 text-center"
      >
        {title}
      </motion.div>

      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ duration: 0.5 }}
        className="relative w-30 md:w-80 h-4 md:h-6 bg-gray-800 rounded-full overflow-hidden"
      >
        <motion.div
          className="absolute top-0 h-full bg-gradient-to-r from-slate-100 via-gray-300 to-slate-500"
          style={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <span className="text-sm md:text-base font-semibold text-white drop-shadow-lg">
            {progress}%
          </span>
        </div>
      </motion.div>

     

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mt-8"
      >
        <svg className="w-12 h-12 md:w-16 md:h-16 text-slate-400" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0, duration: 0.5 }}
        className="mt-8 text-sm md:text-base text-gray-400 text-center"
      >
        Preparing your experience...
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;