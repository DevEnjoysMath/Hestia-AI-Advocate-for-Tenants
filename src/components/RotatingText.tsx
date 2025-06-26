'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RotatingTextProps {
  texts: string[];
  mainClassName?: string;
  staggerFrom?: 'first' | 'last';
  initial?: any;
  animate?: any;
  exit?: any;
  staggerDuration?: number;
  splitLevelClassName?: string;
  transition?: any;
  rotationInterval?: number;
}

const RotatingText: React.FC<RotatingTextProps> = ({
  texts,
  mainClassName = '',
  staggerFrom = 'first',
  initial = { y: '100%' },
  animate = { y: 0 },
  exit = { y: '-120%' },
  staggerDuration = 0.025,
  splitLevelClassName = '',
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [texts.length, rotationInterval]);

  const currentText = texts[currentIndex];
  const letters = currentText.split('');

  return (
    <div className={`flex font-google-sans ${mainClassName}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="flex"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {letters.map((letter, index) => {
            const delay = staggerFrom === 'first' 
              ? index * staggerDuration 
              : (letters.length - index - 1) * staggerDuration;

            return (
              <div key={`${index}-${letter}`} className={splitLevelClassName}>
                <motion.div
                  initial={initial}
                  animate={animate}
                  exit={exit}
                  transition={{ ...transition, delay }}
                >
                  {letter === ' ' ? '\u00A0' : letter}
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RotatingText; 