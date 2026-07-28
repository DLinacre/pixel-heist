import React from 'react';

/**
 * WCAG 2.2 AA compliant Skip to Game Canvas link snippet.
 * Place as the very first focusable element inside <body>.
 */
export const SkipToGameCanvasLink: React.FC = () => {
  return (
    <a
      href="#game-canvas"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyber-cyan focus:text-cyber-dark focus:font-bold focus:rounded-lg focus:shadow-lg"
    >
      Skip to Game Canvas
    </a>
  );
};
