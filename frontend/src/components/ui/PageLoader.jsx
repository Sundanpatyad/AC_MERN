import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';


const PageLoader = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev < 100) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 50); // Increase progress every 50 milliseconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load Orbitron font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Stars */}
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Loading text */}
      <motion.div
        className="text-white text-3xl md:text-6xl font-bold mb-1"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        Awakening Classes <br />
      </motion.div>
      <motion.div
        className="text-white text-md md:text-3xl font-bold mb-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeInOut' }}
      >
        Together We Can 😉 <br />
      </motion.div>

      {/* Digital Loader */}
      <motion.div
        className="absolute bottom-5 right-5 text-white text-xl font-bold"
        style={{ fontFamily: 'Orbitron, sans-serif' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        {loadingProgress}%
      </motion.div>
    </motion.div>
  );
};

export default PageLoader;