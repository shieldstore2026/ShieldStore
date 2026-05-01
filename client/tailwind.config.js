module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          950: '#0d0d0d',
          900: '#141414',
          800: '#1a1a1a',
          700: '#252525',
          600: '#333',
        },
        accent: {
          DEFAULT: '#ff9d00',
          light: '#ffb547',
          dark: '#d98200',
        },
        brand: {
          navy: '#0f172a',
          steel: '#1e293b',
          ember: '#ff9d00',
        },
        neutral: {
          100: '#fafafa',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
        },
        /* legacy aliases for gradual migration */
        neon: { cyan: '#00d4ff', purple: '#a855f7', pink: '#ec4899', green: '#00ff88', orange: '#ff8c00' },
        ff: { orange: '#ff8c00', gold: '#ffa94d', yellow: '#facc15', dark: '#0d0d0d' },
        dark: { 950: '#0d0d0d', 900: '#141414', 800: '#1a1a1a', 700: '#252525' },
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.25)',
        'card-hover': '0 10px 25px -5px rgb(0 0 0 / 0.35), 0 4px 10px -6px rgb(0 0 0 / 0.2)',
        'accent': '0 0 24px rgba(255, 140, 0, 0.25)',
        'accent-lg': '0 12px 48px -12px rgba(255, 140, 0, 0.28)',
      },
      backgroundImage: {
        'mesh-page':
          'radial-gradient(ellipse 90% 60% at 85% -10%, rgba(255, 157, 0, 0.11) 0%, transparent 52%), radial-gradient(ellipse 70% 50% at -5% 95%, rgba(41, 76, 131, 0.16) 0%, transparent 48%), linear-gradient(180deg, #0d0d0d 0%, #0b1220 55%, #0d0d0d 100%)',
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'glow-pulse': { '0%, 100%': { boxShadow: '0 0 20px rgba(255, 140, 0, 0.2)' }, '50%': { boxShadow: '0 0 28px rgba(255, 140, 0, 0.35)' } },
        'float': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
