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
    <>
    <div className="flex flex-col justify-center items-center h-screen bg-black text-gray-200 p-4">
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className=""
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

     
      </div>
    </div>
       <div className="bottom-10 text-md md:text-sm text-gray-500 text-center">
       Awakening Classes
     </div>
     </>
  );
};

export default LoadingSpinner;