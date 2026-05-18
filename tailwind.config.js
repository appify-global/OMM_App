/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      keyframes: {
        'nw-orbit': {
          '0%': { transform: 'rotate(0deg) translateX(42px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(42px) rotate(-360deg)' },
        },
        'nw-glow-pulse': {
          '0%, 100%': { opacity: '0.45', transform: 'scale(0.98)' },
          '50%': { opacity: '0.95', transform: 'scale(1.02)' },
        },
        'nw-beam': {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)', opacity: '0' },
          '20%': { opacity: '0.55' },
          '100%': { transform: 'translateX(220%) skewX(-12deg)', opacity: '0' },
        },
      },
      animation: {
        'nw-orbit': 'nw-orbit 18s linear infinite',
        'nw-glow-pulse': 'nw-glow-pulse 4.5s ease-in-out infinite',
        'nw-beam': 'nw-beam 2.8s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
