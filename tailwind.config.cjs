/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        deepNavy: '#0F1F4B',
        coral: '#FF4D2D',
        mint: '#0BA09B',
        sandCream: '#F9F1E5',
      },
      fontFamily: {
        heading: ['"Black Han Sans"', 'sans-serif'],
        body: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacMacSystemFont', 'system-ui', 'sans-serif'],
        suit: ['SUIT', 'sans-serif'],
        'nanum-neo': ['"NanumSquare Neo"', 'sans-serif'],
        'single-day': ['"Single Day"', 'cursive'],
      },
    },
  },
  plugins: [],
}