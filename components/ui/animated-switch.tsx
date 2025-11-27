'use client';
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSwitchProps {
  onComplete: () => Promise<boolean>; // Modified to return Promise<boolean>
  type?: 'approve' | 'reject'; // Optional type prop for different styles
}

const AnimatedSwitch: React.FC<AnimatedSwitchProps> = ({ 
  onComplete, 
  type = 'approve' 
}) => {
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

  const getColors = () => {
    if (type === 'reject') {
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        slider: 'bg-red-500 dark:bg-red-600',
        text: 'Slide to reject',
      };
    }
    return {
      bg: 'bg-green-100 dark:bg-green-900/30',
      slider: 'bg-green-500 dark:bg-green-600',
      text: 'Slide to approve',
    };
  };

  const colors = getColors();

  return (
    <div
      ref={constraintsRef}
      className={`relative h-14 w-64 overflow-hidden rounded-full ${colors.bg}`}
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
        className={`absolute left-1 top-1 h-12 w-12 cursor-grab rounded-full ${colors.slider} active:cursor-grabbing`}
      />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {isCompleted ? 'Release to confirm' : colors.text}
        </span>
      </div>
    </div>
  );
};

export default AnimatedSwitch;
