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
        // 1. 기존 프로젝트 폰트 설정 유지
        heading: ['"Black Han Sans"', 'sans-serif'],
        body: ['"Noto Sans KR"', 'sans-serif'],

        // 2. 가독성 극대화를 위해 새로 추가한 명품 고딕/포인트 폰트 라인업
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        suit: ['SUIT', 'sans-serif'],
        'nanum-neo': ['"NanumSquare Neo"', 'sans-serif'],
        'single-day': ['"Single Day"', 'cursive'],
      },
    },
  },
  plugins: [],
}