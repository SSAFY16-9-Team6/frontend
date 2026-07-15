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
        body: ['"Noto Sans KR"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}