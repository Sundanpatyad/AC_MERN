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
        {/* Spinner container */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative w-10 h-10"
        >
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-4 border-gray-300 border-t-gray-800 rounded-full"></div>
        </motion.div>

        <div className="mt-4 text-md md:text-xl text-gray-300 text-center font-semibold tracking-wider">
          Loading your experience
        </div>

        <div className="mt-2 text-sm md:text-lg text-gray-400 text-center italic animate-pulse">
          {title || 'Awakening Classes 😉'}
        </div>

        <div className="mt-4 text-base md:text-lg text-gray-500 text-center font-mono">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
