/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        anker: {
          bg: 'var(--bg)',
          card: 'var(--bg-card)',
          subtle: 'var(--bg-subtle)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          faint: 'var(--text-muted)',
          accent: 'var(--accent-primary)',
          accent2: 'var(--accent-secondary)',
          sand: 'var(--accent-sand)',
          border: 'var(--border)',
        },
      },
      borderRadius: {
        anker: 'var(--radius)',
        'anker-sm': 'var(--radius-sm)',
      },
      boxShadow: {
        anker: 'var(--shadow)',
        'anker-hover': 'var(--shadow-hover)',
      },
    },
  },
  plugins: [],
}
