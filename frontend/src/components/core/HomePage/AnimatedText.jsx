import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AnimatedText = ({ texts, interval, wrapper = 'span' }) => {
  const [index, setIndex] = useState(0);
  const [currentText, setCurrentText] = useState(texts[0]);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % texts.length;
        setCurrentText(texts[newIndex]);
        return newIndex;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [texts, interval]);

  const Wrapper = motion[wrapper];

  return (
    <AnimatePresence mode='wait'>
      <Wrapper
        key={currentText}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: 'easeInOut'
        }}
        style={{
          display: 'inline-block',
          position: 'relative'
        }}
      >
        {currentText}
      </Wrapper>
    </AnimatePresence>
  );
};

export default AnimatedText;