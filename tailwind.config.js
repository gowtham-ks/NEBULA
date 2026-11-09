/** @type {import('tailwindcss').Config} */
export default {
  content: ['./popup.html', './dashboard.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050505',
        coal: '#0e0e10',
        graphite: '#1a1a1d',
        nothing: '#d71921',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '10px' },
    },
  },
  plugins: [],
};
