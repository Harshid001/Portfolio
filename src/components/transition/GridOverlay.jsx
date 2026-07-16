import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGridTransition } from './GridTransitionContext';

const GridOverlay = () => {
  const { isTransitioning, direction } = useGridTransition();
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const updateDims = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    updateDims();
    window.addEventListener('resize', updateDims);
    return () => window.removeEventListener('resize', updateDims);
  }, []);

  if (dimensions.w === 0) return null;

  const cols = 10;
  const squareSize = dimensions.w / cols;
  const rowCount = Math.ceil(dimensions.h / squareSize);
  const totalSquares = cols * rowCount;

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 9998, 
        pointerEvents: 'none', 
        overflow: 'hidden',
        // Slight padding to ensure no gaps at edges due to rounding
        width: '105vw',
        height: '105vh'
      }}
    >
      <AnimatePresence>
        {isTransitioning && (
          Array.from({ length: totalSquares }).map((_, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            
            // If direction is 'down' (navigating down), squares move upward
            const fromBottom = rowCount - 1 - row;
            
            // Stagger delay based on row
            const delayIn = direction === 'down' ? fromBottom * 0.03 : row * 0.03;
            const delayOut = direction === 'down' ? fromBottom * 0.02 : row * 0.02;

            return (
              <motion.div
                key={i}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 0.65 }}
                exit={{ scaleY: 0, opacity: 0 }}
                transition={{
                  duration: 0.25,
                  delay: isTransitioning ? delayIn + 0.2 : delayOut,
                  ease: [0.83, 0, 0.17, 1]
                }}
                style={{
                  position: 'absolute',
                  width: Math.ceil(squareSize) + 1,
                  height: Math.ceil(squareSize) + 1,
                  left: col * squareSize,
                  top: row * squareSize,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 15px rgba(255, 255, 255, 0.4)',
                  transformOrigin: direction === 'down' ? 'bottom' : 'top'
                }}
              />
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
};

export default GridOverlay;
