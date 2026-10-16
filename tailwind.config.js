/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Re-map Tailwind's pink utilities to the steel-blue accent
        pink: {
          50: '#F1F5FA', 100: '#E2EAF3', 200: '#C5D5E6', 300: '#8DB4D9', 400: '#5B8FC2',
          500: '#3A6F9F', 600: '#2E5C86', 700: '#27496A', 800: '#1F3B57', 900: '#172C41',
        },
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in-out',
        'bounce': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}