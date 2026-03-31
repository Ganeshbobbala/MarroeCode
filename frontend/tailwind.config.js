/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0f19',
        surface: '#171b26',
        surfaceHover: '#1f2536',
        primary: '#5d5fef',
        primaryHover: '#4f41eb',
        accent: '#a855f7',
        success: '#1fb15b',
        warning: '#f4b005',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
