/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        anker: {
          bg: '#F8F7F4',
          accent: '#2D4A6B',
        },
      },
    },
  },
  plugins: [],
}
