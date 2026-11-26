/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          dark: '#0a0a0a',
          panel: '#111111',
          border: '#333333',
          neonBlue: '#00f3ff',
          neonGreen: '#39ff14',
          accent: '#2a2a2a',
        }
      },
      backgroundImage: {
        'grid-pattern': "url('/grid.svg')",
      }
    },
  },
  plugins: [],
}
