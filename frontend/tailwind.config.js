/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#07080f',
        text: '#f1f5f9',
        primary: {
          light: '#818cf8',
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        accent1: '#6366f1',
        accent2: '#06b6d4',
        accent3: '#a78bfa',
        surface: 'rgba(255,255,255,0.04)',
        'surface-hover': 'rgba(255,255,255,0.06)',
        'surface-border': 'rgba(255,255,255,0.08)',
        neutral: {
          100: '#1e1f2e',
          200: '#2a2b3d',
          300: '#3a3b50',
          400: '#6b7280',
          500: '#9ca3af',
          600: '#d1d5db',
        },
        white: '#ffffff',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
