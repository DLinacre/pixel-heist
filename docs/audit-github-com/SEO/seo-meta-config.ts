import type { Metadata } from 'next';

export const seoMetadataConfig: Metadata = {
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
