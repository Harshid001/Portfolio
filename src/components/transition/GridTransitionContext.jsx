import React, { createContext, useContext, useState } from 'react';

const GridTransitionContext = createContext();

export const useGridTransition = () => useContext(GridTransitionContext);

export const GridTransitionProvider = ({ children }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('down'); 
  const [contentOpacity, setContentOpacity] = useState(1);

  const triggerTransition = (targetHref, scrollDirection) => {
    if (isTransitioning) return;
    setDirection(scrollDirection);
    setIsTransitioning(true);
    
    // 0-200ms: current section fades out
    setContentOpacity(0);
    
    // 500ms: Instant scroll when squares fully cover screen
    setTimeout(() => {
      const targetElement = document.querySelector(targetHref);
      if (targetElement) {
        // Instant scroll
        const top = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top, left: 0, behavior: 'instant' });
      }
      
      // 500-800ms: Next section fades in
      setContentOpacity(1);
    }, 500);

    // 700ms: Trigger squares fade away
    setTimeout(() => {
      setIsTransitioning(false);
    }, 700);
  };

  return (
    <GridTransitionContext.Provider value={{ isTransitioning, direction, triggerTransition, contentOpacity }}>
      {children}
    </GridTransitionContext.Provider>
  );
};
