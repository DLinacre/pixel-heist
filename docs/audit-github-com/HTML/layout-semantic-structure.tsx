import React from 'react';

/**
 * Semantic HTML layout template for Pixel Heist.
 */
export const SemanticGameLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen bg-cyber-dark text-gray-200">
      <header role="banner" className="border-b border-cyber-border bg-cyber-card">
        {/* HUD Stats */}
      </header>
      <main
        id="game-canvas"
        aria-label="Tactical Stealth Game Canvas"
        className="flex-1 w-full max-w-7xl mx-auto p-4 flex flex-col items-center justify-center relative"
      >
        {children}
      </main>
      <footer role="contentinfo" className="border-t border-cyber-border py-4 text-center text-xs text-gray-500">
        Pixel Heist · MIT License
      </footer>
    </div>
  );
};
