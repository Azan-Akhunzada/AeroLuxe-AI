/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#0B0C10',
          50: '#F5F6F8',
          800: '#141720',
          900: '#0F1119',
          950: '#0B0C10',
        },
        charcoal: {
          DEFAULT: '#1F2833',
          700: '#1A222C',
          800: '#1F2833',
          900: '#161D26',
        },
        gold: {
          300: '#F0E0A8',
          400: '#E2C96B',
          DEFAULT: '#D4AF37',
          500: '#D4AF37',
          600: '#B8932A',
          700: '#8C6F1F',
        },
        emerald: {
          400: '#34D399',
          DEFAULT: '#10B981',
          500: '#10B981',
          600: '#059669',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        luxe: '0 24px 60px -20px rgba(0,0,0,0.85), 0 0 0 1px rgba(212,175,55,0.08)',
        'luxe-lg': '0 40px 100px -30px rgba(0,0,0,0.95), 0 0 0 1px rgba(212,175,55,0.14)',
        gold: '0 0 0 1px rgba(212,175,55,0.35), 0 12px 40px -12px rgba(212,175,55,0.35)',
        emerald: '0 0 0 1px rgba(16,185,129,0.35), 0 12px 40px -12px rgba(16,185,129,0.4)',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg,#F5E7B2 0%,#D4AF37 35%,#8C6F1F 65%,#E2C96B 100%)',
        'emerald-sheen': 'linear-gradient(135deg,#6EE7B7 0%,#10B981 50%,#047857 100%)',
        'obsidian-fade': 'radial-gradient(120% 120% at 50% 0%, #1F2833 0%, #0F1119 45%, #0B0C10 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dash: {
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.6s linear infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        pulseRing: 'pulseRing 1.8s cubic-bezier(0.24,0,0.38,1) infinite',
        slideUp: 'slideUp 0.45s cubic-bezier(0.16,1,0.3,1) both',
        dash: 'dash 1.2s ease-out forwards',
      },
    },
  },
  plugins: [],
};
