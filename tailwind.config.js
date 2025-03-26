/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fdf4ef',
          100: '#fae8de',
          200: '#f4ceb9',
          300: '#ecad8d',
          400: '#e38962',
          500: '#d56d42',
          600: '#c5532a',
          700: '#a0430a', // Burnt Copper Main
          800: '#853a0d',
          900: '#6e3410',
        },
        secondary: {
          50: '#f6faf9',
          100: '#dfe8e6', // Sea Mist Main
          200: '#c1d5d1',
          300: '#a3c1ba',
          400: '#83a89f',
          500: '#689085',
          600: '#53746b',
          700: '#445d56',
          800: '#384a45',
          900: '#2f3c38',
        },
      },
    },
  },
  plugins: [],
} 