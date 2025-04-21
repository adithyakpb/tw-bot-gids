/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tw-teal': '#013D4F',
        'tw-coral': '#F2607A',
        'tw-blue': '#46A1AD',
        'tw-green': '#6A9E78',
        'tw-purple': '#634F7D',
      },
      fontFamily: {
        'bitter': ['Bitter', 'serif'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'messageInRight': 'messageInRight 0.3s ease-in-out',
        'messageInLeft': 'messageInLeft 0.3s ease-in-out',
        'bounce': 'bounce 1.5s infinite ease-in-out',
        'slideDown': 'slideDown 0.2s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        messageInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        messageInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
