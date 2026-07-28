import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0b10',
          panel: '#111420',
          border: '#242a42',
          cyan: '#00f0ff',
          neon: '#00e5ff',
          green: '#00ff88',
          yellow: '#ffcc00',
          orange: '#ff6600',
          red: '#ff2a5f',
          purple: '#9d00ff',
        },
      },
      fontFamily: {
        mono: ['Courier New', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 240, 255, 0.4)',
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.4)',
        'neon-red': '0 0 15px rgba(255, 42, 95, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
