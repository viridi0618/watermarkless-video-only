/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { purple: '#a855f7', pink: '#ec4899' },
        background: { light: '#f8f9ff', dark: '#1a1a2e' },
        card: { light: 'rgba(255, 255, 255, 0.8)', dark: 'rgba(30, 30, 50, 0.8)' },
      },
      borderRadius: { btn: '20px', card: '24px', input: '16px', tab: '20px', 'tab-item': '16px' },
      fontFamily: { display: ['Inter', 'system-ui', 'sans-serif'] },
      backdropBlur: { glass: '10px' },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        shake: { '0%, 100%': { transform: 'translateX(0)' }, '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' }, '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px rgba(168, 85, 247, 0.5)' }, '50%': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' } },
      },
    },
  },
  plugins: [],
};
