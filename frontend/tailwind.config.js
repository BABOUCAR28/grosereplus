/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#1e5aa8',
          600: '#164a8c',
          700: '#123b70',
          900: '#0b2547',
        },
        accent: {
          500: '#2f9e44',
          600: '#278a3b',
        },
        orange: {
          100: '#fdead9',
          400: '#f2994a',
          500: '#e8802c',
          600: '#d9691e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
