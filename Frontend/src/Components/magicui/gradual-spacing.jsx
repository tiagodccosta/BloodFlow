import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

// Utility function to conditionally join class names
const cn = (...classes) => classes.filter(Boolean).join(' ');

const GradualSpacing = ({
  text,
  duration = 0.5,
  delayMultiple = 0.04,
  framerProps = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  className,
}) => {
  const words = text.split(" ");
  let totalDelay = 0;

  return (
    <div className="flex justify-center space-x-1 flex-wrap">
      <AnimatePresence>
        {words.map((word, wordIndex) => (
          <span key={wordIndex} className="inline-block">
            {word.split("").map((char, charIndex) => {
              const delay = totalDelay * delayMultiple;
              totalDelay++;
              return (
                <motion.span
                  key={`${wordIndex}-${charIndex}`}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={framerProps}
                  transition={{ duration, delay }}
                  className={cn("drop-shadow-sm", className)}
                >
                  {char}
                </motion.span>
              );
            })}
            {/* Add a space between words */}
            <motion.span
              key={`${wordIndex}-space`}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={framerProps}
              transition={{ duration, delay: totalDelay * delayMultiple }}
              className={cn("drop-shadow-sm", className)}
            >
              &nbsp;
            </motion.span>
          </span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default GradualSpacing;
