import dynamic from 'next/dynamic';
import React from 'react';

/**
 * High-performance SSR-exempt dynamic import of Phaser 3 Canvas Engine.
 * Prevents Next.js 15 server-side hydration mismatches and optimizes first load JS.
 */
export const PhaserGameDynamic = dynamic(
  () => import('@/game/PhaserGame').then((m) => m.PhaserGame),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[600px] bg-cyber-dark flex items-center justify-center text-cyber-cyan font-mono text-sm border border-cyber-border rounded-xl animate-pulse">
        INITIALIZING PIXEL HEIST TACTICAL ENGINE (60 FPS)...
      </div>
    ),
  }
);
