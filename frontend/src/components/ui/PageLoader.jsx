import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const PageLoader = () => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const controls = useAnimation();

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
    }, 50);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loadingProgress === 100) {
      controls.start("loaded");
    }
  }, [loadingProgress, controls]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    loaded: { opacity: 0, transition: { duration: 0.5, delay: 0.5 } }
  };

  const textVariants = {
    initial: { y: 50, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    loaded: { y: -50, opacity: 0, transition: { duration: 0.5 } }
  };

  const progressVariants = {
    initial: { scaleX: 0 },
    animate: { scaleX: loadingProgress / 100, transition: { duration: 0.2, ease: "easeInOut" } }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden"
      variants={containerVariants}
      initial="initial"
      animate={controls}
    >
      {/* Stars */}
      {[...Array(100)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
            y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Loading text */}
      <motion.div
        className="text-white text-3xl md:text-6xl font-bold mb-1"
        variants={textVariants}
      >
        Awakening Classes
      </motion.div>
      <motion.div
        className="text-white text-md md:text-3xl font-bold mb-4"
        variants={textVariants}
      >
        Together We Can 😉
      </motion.div>

      {/* Progress Bar */}
      <motion.div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mt-4">
        <motion.div
          className="h-full bg-white"
          variants={progressVariants}
        />
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