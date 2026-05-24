/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        surface: {
          base: '#0a0a0a',
          card: '#141414',
          elevated: '#1e1e1e',
        },
        accent: {
          DEFAULT: '#e5e5e5',
          light: '#f5f5f5',
          dark: '#a3a3a3',
        },
        text: {
          primary: '#f5f5f5',
          secondary: '#a3a3a3',
          muted: '#525252',
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body: ['"Noto Serif SC"', '"Source Han Serif SC"', 'serif'],
        ui: ['"SF Pro Display"', '"PingFang SC"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'float-delayed': 'float 23s ease-in-out 2s infinite',
        'float-slow': 'float 28s ease-in-out 5s infinite',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'bounce-icon': 'bounceIcon 0.4s ease-out',
        'sway': 'sway 8s ease-in-out infinite',
        'sway-delayed': 'sway 10s ease-in-out 2s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0) scale(1)', opacity: '0.3' },
          '25%': { transform: 'translateY(-30px) translateX(15px) scale(1.1)', opacity: '0.6' },
          '50%': { transform: 'translateY(-15px) translateX(-10px) scale(0.95)', opacity: '0.4' },
          '75%': { transform: 'translateY(-40px) translateX(5px) scale(1.05)', opacity: '0.5' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.08)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 255, 255, 0.15)' },
        },
        bounceIcon: {
          '0%': { transform: 'scale(1)' },
          '40%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
      },
    },
  },
  plugins: [],
};