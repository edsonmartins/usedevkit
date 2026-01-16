import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0a0a0b',
          surface: '#111113',
          border: '#1a1a1d',
          green: '#00ff9d',
          coral: '#ff6b6b',
          blue: '#4d9fff',
          yellow: '#ffd93d',
          purple: '#c792ea',
          text: '#e8e8ea',
          dim: '#6b6b6e',
        },
      },
      fontFamily: {
        mono: ['var(--font-jetbrains)', 'monospace'],
        display: ['var(--font-space)', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1a1a1d 1px, transparent 1px), linear-gradient(to bottom, #1a1a1d 1px, transparent 1px)",
        'glow-green': 'radial-gradient(ellipse at center, rgba(0, 255, 157, 0.15) 0%, transparent 70%)',
        'glow-coral': 'radial-gradient(ellipse at center, rgba(255, 107, 107, 0.1) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '24px 24px',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'typeline': 'typeline 0.8s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        typeline: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(4px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
