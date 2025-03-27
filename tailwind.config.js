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
        copper: {
          50: '#FDF3F1',
          100: '#FAE6E2',
          200: '#F5CCC5',
          300: '#EFB3A8',
          400: '#EA998B',
          500: '#E5806E',
          600: '#DF6751',
          700: '#D44D34',
          800: '#A0430A', // Primary copper color
          900: '#7A3207',
          950: '#4A1E04',
        },
        seamist: {
          50: '#F7FAF9',
          100: '#EFF5F3',
          200: '#DFE8E6', // Primary sea mist color
          300: '#CFDBD8',
          400: '#BFCECA',
          500: '#AFC1BC',
          600: '#9FB4AE',
          700: '#8FA7A0',
          800: '#7F9A92',
          900: '#6F8D84',
          950: '#5F8076',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'expand': 'expand 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        expand: {
          '0%': { height: '0', opacity: '0' },
          '100%': { height: 'auto', opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
} 