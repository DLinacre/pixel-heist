import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '🚀 Pixel Heist | Tactical Stealth Infiltration Web Game',
  description:
    'Sneak through procedurally generated buildings, avoid guards, hack security systems, and escape with as much loot as possible before time runs out. Single-Page Core MVP (Next.js 15 + Phaser 3 + TypeScript).',
  keywords: [
    'stealth game',
    'puzzle game',
    'phaser 3',
    'next.js 15',
    'typescript',
    'tactical',
    'html5 game',
  ],
  authors: [{ name: 'David Linacre', url: 'https://github.com/DLinacre' }],
  creator: 'David Linacre',
  publisher: 'David Linacre',
  metadataBase: new URL('https://dlinacre.github.io/pixel-heist/'),
  alternates: {
    canonical: 'https://dlinacre.github.io/pixel-heist/',
  },
  openGraph: {
    title: '🚀 Pixel Heist | Tactical Stealth Infiltration Web Game',
    description:
      'High-performance HTML5 Canvas stealth infiltration engine with procedural levels, 4-state Guard AI, and lockpicking minigames.',
    url: 'https://dlinacre.github.io/pixel-heist/',
    siteName: 'Pixel Heist',
    images: [
      {
        url: 'https://dlinacre.github.io/pixel-heist/og-preview.png',
        width: 1200,
        height: 630,
        alt: 'Pixel Heist Tactical Stealth Game Preview',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '🚀 Pixel Heist | Tactical Stealth Infiltration Web Game',
    description:
      'Tactical stealth web game powered by Next.js 15, Phaser 3, and TypeScript.',
    images: ['https://dlinacre.github.io/pixel-heist/og-preview.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' https://dlinacre.github.io; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://dlinacre.github.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https:; worker-src 'self' blob:; object-src 'none'"
        />
        <link rel="manifest" href="/pixel-heist/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoGame',
              name: 'Pixel Heist',
              description:
                'Tactical stealth infiltration web game with procedural level generation, 4-state Guard AI, and interactive lockpicking.',
              operatingSystem: 'Any (web browser)',
              applicationCategory: 'GameApplication',
              genre: ['Stealth', 'Tactical', 'Puzzle'],
              url: 'https://dlinacre.github.io/pixel-heist/',
              author: {
                '@type': 'Person',
                name: 'David Linacre',
                url: 'https://github.com/DLinacre',
              },
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-cyber-dark flex flex-col justify-between antialiased selection:bg-cyber-cyan/30">
        <a
          href="#game-canvas"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyber-cyan focus:text-cyber-dark focus:font-bold focus:rounded-lg focus:shadow-lg"
        >
          Skip to Game Canvas
        </a>
        {children}
      </body>
    </html>
  );
}
