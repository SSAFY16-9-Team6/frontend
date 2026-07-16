# 부산로컬 (busan-info-app) — Frontend

간단한 부산 지역 정보 탐색 웹 애플리케이션의 프론트엔드입니다. Vue 3 + Vite 기반으로 지도 검색, 게시판, 챗봇, 평점·태그 기능과 통계 페이지를 제공합니다.

## 주요 기능
- 장소 검색 및 지도 표시 (Naver Map)
- 장소 카드 및 상세 보기
- 게시판(글 작성/조회/수정/삭제)
- 챗봇 통합(외부 백엔드 API 호출)
- 평점 및 태그 기반 필터
- 통계 대시보드

## 기술 스택
- Vue 3
- Vite
- TypeScript
- Tailwind CSS
- vue-router

## 빠른 시작
1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 빌드

```bash
npm run build
```

4. 프로덕션 미리보기

```bash
npm run preview
```

## 환경 변수
프로젝트 루트에 `.env` 파일을 두고 아래 변수를 설정하세요:

- `VITE_NAVER_MAP_CLIENT_ID` — 네이버 지도 API 클라이언트 ID
- `VITE_WEATHER_API_KEY` — 기상청(또는 프록시) API 키
- `VITE_WEATHER_API_BASE_URL` — 날씨 API 기본 URL (백엔드 프록시 사용 시 설정)

예:

```env
VITE_NAVER_MAP_CLIENT_ID='your_client_id'
VITE_WEATHER_API_KEY='your_weather_key'
VITE_WEATHER_API_BASE_URL='http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0'
```

## 프로젝트 구조(주요 파일)

- `src/main.ts` — 앱 진입점
- `src/App.vue` — 최상위 레이아웃(네비게이션, Footer, Chatbot 포함)
- `src/router/index.ts` — 라우터 설정
- `src/components/` — 재사용 컴포넌트 모음
  - `Navbar.vue`, `Footer.vue`, `Chatbot.vue`, `NaverMap.vue`, `PlaceCard.vue`
  - `common/` (AppButton, InfoCard, PageHeader)
  - `ui/` (PostCard, SearchBar, StarRating, Tag)
- `src/views/` — 페이지 단위 뷰
  - `HomeView.vue`, `MapView.vue`, `TourismView.vue`, `BoardView.vue`, `StatsView.vue` 등

## 외부 연동
- 네이버 지도: `NaverMap.vue`에서 `VITE_NAVER_MAP_CLIENT_ID`를 사용해 클라이언트 스크립트를 로드합니다.
- 챗봇: `Chatbot.vue`에서 외부 백엔드 엔드포인트로 POST 요청을 보냅니다. (예: `https://backend-xxf5.onrender.com/api/v1/chatbot/message`)

## 유의사항
- `.env` 에 민감한 키를 저장할 때 저장소에 커밋되지 않도록 `.gitignore`에 추가하세요.
- 네이버 지도 API 키는 도메인 제한을 걸어 사용하세요.

## 기여
- 버그 리포트 및 기능 제안은 이 저장소 이슈 트래커를 이용해주세요.

---
부가 설명이나 데모 스크린샷을 추가해 드릴게요. README 내용을 영어 버전으로 변환하거나 GitHub 루트 `README.md`에 병합해 드릴까요?
