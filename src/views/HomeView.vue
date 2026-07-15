<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES } from '../data/constants' // constants.ts 경로에 맞게 조정
import { FEATURED_PLACES, EVENTS } from '../data/mockData'
import PlaceCard from '../components/PlaceCard.vue'
import Chatbot from '../components/Chatbot.vue'

const router = useRouter()

// 각 카테고리 카드에 들어갈 상세 메타데이터 (SVG 내부 패스 정보 정의)
const categoryDetails = ref([
  {
    id: '12', // 관광지
    description: '해운대 · 광안리 · 감천 등 명소',
    count: 142,
    bgClass: 'bg-[#FFF0ED]',
    textColor: 'text-[#FF4D2D]',
    iconColor: 'text-[#FF4D2D]',
    iconBg: 'bg-[#FF4D2D]/10',
    // 카메라 아이콘
    svgPath: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
  },
  {
    id: '14', // 문화시설
    description: '박물관 · 갤러리 · 공연장',
    count: 87,
    bgClass: 'bg-[#F2EFFF]',
    textColor: 'text-[#6C5DD3]',
    iconColor: 'text-[#6C5DD3]',
    iconBg: 'bg-[#6C5DD3]/10',
    // 책 아이콘
    svgPath: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
  },
  {
    id: '15', // 축제공연행사
    description: 'BIFF · 불꽃축제 · 어방축제',
    count: 63,
    bgClass: 'bg-[#FFF9EC]',
    textColor: 'text-[#FF9F43]',
    iconColor: 'text-[#FF9F43]',
    iconBg: 'bg-[#FF9F43]/10',
    // 음표 아이콘
    svgPath: 'M9 18V5l12-2v13 M9 10l12-2 M9 21a3 3 0 1 1-6-0 3 3 0 0 1 6 0z M21 19a3 3 0 1 1-6-0 3 3 0 0 1 6 0z'
  },
  {
    id: '25', // 여행코스
    description: '반나절 · 당일 · 1박2일 코스',
    count: 38,
    bgClass: 'bg-[#E6F9F6]',
    textColor: 'text-[#0BA09B]',
    iconColor: 'text-[#0BA09B]',
    iconBg: 'bg-[#0BA09B]/10',
    // 나침반 아이콘
    svgPath: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z'
  },
  {
    id: '28', // 레포츠
    description: '서핑 · 클라이밍 · 수상레저',
    count: 54,
    bgClass: 'bg-[#EAF9F2]',
    textColor: 'text-[#2ECC71]',
    iconColor: 'text-[#2ECC71]',
    iconBg: 'bg-[#2ECC71]/10',
    // 자전거 아이콘
    svgPath: 'M5.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 15h3.5L18 10H12 M12 15L9 9H5'
  },
  {
    id: '32', // 숙박
    description: '호텔 · 게스트하우스 · 펜션',
    count: 209,
    bgClass: 'bg-[#EBF3FC]',
    textColor: 'text-[#3182CE]',
    iconColor: 'text-[#3182CE]',
    iconBg: 'bg-[#3182CE]/10',
    // 빌딩 아이콘
    svgPath: 'M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18 M6 6h2 M6 10h2 M6 14h2 M16 6h2 M16 10h2 M16 14h2 M11 6h2 M11 10h2 M11 14h2 M11 18h2'
  },
  {
    id: '38', // 쇼핑
    description: '국제시장 · 서면 · 센텀시티',
    count: 95,
    bgClass: 'bg-[#FFF0F8]',
    textColor: 'text-[#E040FB]',
    iconColor: 'text-[#E040FB]',
    iconBg: 'bg-[#E040FB]/10',
    // 쇼핑백 아이콘
    svgPath: 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'
  },
  {
    id: '39', // 음식점
    description: '회 · 밀면 · 돼지국밥 · 카페',
    count: 318,
    bgClass: 'bg-[#FFF3EC]',
    textColor: 'text-[#FF6B4A]',
    iconColor: 'text-[#FF6B4A]',
    iconBg: 'bg-[#FF6B4A]/10',
    // 수저/포크 아이콘
    svgPath: 'M18 8V2M14 8V2M22 8V2c0 2.4-1.2 4-4 4v16M3 2v7c0 3.3 2.7 6 6 6v7M9 15v7'
  }
])

// constants.ts와 매핑하여 전체 카테고리 목록 생성
const categoryList = CATEGORIES.map(cat => {
  const detail = categoryDetails.value.find(d => d.id === cat.id)
  return {
    ...cat,
    description: detail?.description || '부산의 다양한 핫플레이스',
    count: detail?.count || 0,
    bgClass: detail?.bgClass || 'bg-white',
    textColor: detail?.textColor || 'text-[#0F1F4B]',
    iconColor: detail?.iconColor || 'text-[#0F1F4B]',
    iconBg: detail?.iconBg || 'bg-gray-100',
    svgPath: detail?.svgPath || 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z'
  }
})

// 음식점 등 constants.ts에 명시되지 않았으나 예시 이미지에 있는 카테고리 보완용
if (!categoryList.some(c => c.id === '39')) {
  categoryList.push({
    id: '39',
    name: '음식점',
    color: 'bg-[#FF4D2D]',
    description: '회 · 밀면 · 돼지국밥 · 카페',
    count: 318,
    bgClass: 'bg-[#FFF3EC]',
    textColor: 'text-[#FF6B4A]',
    iconColor: 'text-[#FF6B4A]',
    iconBg: 'bg-[#FF6B4A]/10',
    svgPath: 'M18 8V2M14 8V2M22 8V2c0 2.4-1.2 4-4 4v16M3 2v7c0 3.3 2.7 6 6 6v7M9 15v7'
  })
}

// 카테고리 클릭 핸들러 (나중에 화면 연결할 수 있도록 정의)
function goCategory(categoryId: string) {
  // query parameter를 담아 tourism 화면으로 이동합니다.
  router.push({
    name: 'tourism',
    query: { category: categoryId }
  })
}
</script>

<template>
  <div class="w-full">
    <!-- 1. HERO SECTION (그라데이션 대신 실제 바다 배경 이미지 적용) -->
    <section class="relative h-[480px] w-full overflow-hidden bg-[#0F1F4B]">
      <!-- 배경 이미지 -->
      <div 
        class="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105"
        style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');"
      ></div>
      <!-- 글씨 가독성을 높여주는 반투명 오버레이 -->
      <div class="absolute inset-0 bg-black/35"></div>

      <!-- 콘텐츠 영역 -->
      <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <!-- 뱃지 -->
        <div class="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <span class="inline-block">📍</span> 부산 로컬 여행 가이드
        </div>

        <!-- 메인 카피 -->
        <h1 class="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl" style="font-family: var(--font-heading);">
          부산, 현지인처럼
        </h1>

        <!-- 서브 카피 -->
        <p class="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/90 md:text-lg">
          해운대 · 광안리부터 영도 골목, 전포동 카페거리까지<br />
          2030이 발굴한 찐 부산 여행 정보
        </p>
      </div>
    </section>

    <!-- 2. CATEGORY SECTION -->
    <section class="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div class="mb-8">
        <span class="text-sm font-bold tracking-wider text-[#FF4D2D] uppercase">카테고리</span>
        <h2 class="mt-1 text-2xl font-black text-[#0F1F4B] md:text-3xl" style="font-family: var(--font-heading);">
          무엇을 찾고 계신가요?
        </h2>
      </div>

      <!-- 카테고리 카드 그리드 -->
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          v-for="cat in categoryList" 
          :key="cat.id"
          @click="goCategory(cat.id)"
          class="group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
          :class="cat.bgClass"
        >
          <div>
            <!-- 동그란 아이콘 영역 (순수 단색 SVG 아이콘) -->
            <div 
              class="flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110"
              :class="cat.iconBg"
            >
              <svg 
                class="h-6 w-6 fill-none stroke-current stroke-[2.2]" 
                :class="cat.iconColor"
                viewBox="0 0 24 24" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path :d="cat.svgPath" />
              </svg>
            </div>

            <!-- 제목 및 설명 -->
            <h3 class="mt-6 text-lg font-bold text-[#0F1F4B]">
              {{ cat.name }}
            </h3>
            <p class="mt-1 text-sm text-[#4F5B72]">
              {{ cat.description }}
            </p>
          </div>

          <!-- 개수 표시 및 화살표 -->
          <div class="mt-6 flex items-center font-bold text-sm" :class="cat.textColor">
            <span>{{ cat.count }}곳</span>
            <svg class="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- 3.기존 추천 장소 & 이벤트 섹션 -->
    <section class="mx-auto max-w-7xl px-6 pb-16">
      <hr class="border-[#E6D8C4] mb-12" />
      <div class="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <!-- 추천 장소 -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-[#0F1F4B]">추천 장소</h2>
          <div class="grid gap-4 md:grid-cols-2">
            <PlaceCard v-for="place in FEATURED_PLACES" :key="place.id" :place="place" />
          </div>
        </div>

        <!-- 이벤트 -->
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-[#0F1F4B]">이벤트</h2>
          <div class="space-y-3">
            <div v-for="event in EVENTS" :key="event.id" class="rounded-[20px] border border-[#E6D8C4] bg-white p-4">
              <div class="text-sm font-semibold text-[#FF4D2D]">{{ event.date }}</div>
              <div class="mt-1 text-base font-medium text-[#0F1F4B]">{{ event.title }}</div>
            </div>
          </div>
          <Chatbot />
        </div>
      </div>
    </section>
  </div>
</template>