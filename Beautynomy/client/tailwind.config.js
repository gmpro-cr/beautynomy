/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Elegant Blush - Soft and sophisticated primary
        blush: {
          50: '#fdf8f6',
          100: '#faf1ed',
          200: '#f5e3db',
          300: '#efd0c3',
          400: '#e8b8a4',
          500: '#d99b82',
          600: '#c98169',
          700: '#b56956',
          800: '#96584a',
          900: '#7b4a40',
        },
        // Muted Mauve - Calm and refined
        mauve: {
          50: '#faf8fb',
          100: '#f4eff6',
          200: '#ebe3ee',
          300: '#dccfe3',
          400: '#c7b3d4',
          500: '#b193c3',
          600: '#9775ad',
          700: '#7e5f92',
          800: '#695078',
          900: '#584463',
        },
        // Soft Sage - Natural and calming
        sage: {
          50: '#f6f8f6',
          100: '#edf0ed',
          200: '#d9e2d9',
          300: '#bccfbc',
          400: '#97b397',
          500: '#759775',
          600: '#5c7d5c',
          700: '#4a654a',
          800: '#3d533d',
          900: '#344634',
        },
        // Warm Cream - Elegant neutral
        cream: {
          50: '#fdfcfb',
          100: '#fbf9f6',
          200: '#f7f3ed',
          300: '#f0e9df',
          400: '#e6dbc9',
          500: '#d9c9b0',
          600: '#c7b196',
          700: '#b09778',
          800: '#8f7d65',
          900: '#766854',
        },
        // Cool Gray - Modern and sophisticated
        slate: {
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#868e96',
          700: '#495057',
          800: '#343a40',
          900: '#212529',
        },
        // Accent Terracotta - Warm and inviting
        terracotta: {
          50: '#fdf6f4',
          100: '#fbeae6',
          200: '#f7d5cc',
          300: '#f0b8a7',
          400: '#e69279',
          500: '#d97352',
          600: '#c65a3a',
          700: '#a64930',
          800: '#893f2c',
          900: '#72372a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
        'lg': '0 8px 20px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'xl': '0 12px 28px rgba(0, 0, 0, 0.12), 0 6px 12px rgba(0, 0, 0, 0.08)',
        '2xl': '0 20px 40px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '112': '28rem',
      },
    },
  },
  plugins: [],
}
