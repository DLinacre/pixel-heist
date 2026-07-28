import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🚀 Pixel Heist | Tactical Stealth Infiltration Webapp',
  description:
    'Sneak through procedurally generated buildings, avoid guards, hack security systems, and escape with as much loot as possible before time runs out. Single-Page Core MVP (Next.js 15 + Phaser 3 + TypeScript).',
  keywords: ['stealth game', 'puzzle game', 'phaser 3', 'next.js 15', 'typescript', 'tactical'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-cyber-dark flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
