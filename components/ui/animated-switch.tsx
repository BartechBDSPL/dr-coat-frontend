'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSwitchProps {
  onComplete: () => Promise<boolean>; // Modified to return Promise<boolean>
}

const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({ onComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const constraintsRef = useRef(null);

  const handleDragEnd = async (event: any, info: any) => {
    const threshold = 150; // Adjust this value as needed
    if (info.offset.x > threshold && !isCompleted) {
      setIsCompleted(true);
      const success = await onComplete();
      if (!success) {
        // Reset the switch if the operation failed
        setIsCompleted(false);
      }
    }
  };

  return (
    <div
      ref={constraintsRef}
      className="relative h-14 w-64 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
    >
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        animate={isCompleted ? { x: 200 } : { x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute left-1 top-1 h-12 w-12 cursor-grab rounded-full bg-primary active:cursor-grabbing"
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {isCompleted ? 'Release to confirm' : 'Slide to approve'}
        </span>
      </div>
    </div>
  );
};

export default AnimatedSwitch;
