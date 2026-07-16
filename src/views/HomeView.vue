<!-- src/views/HomeView.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES } from '../data/constants'

const router = useRouter()

// 각 카테고리 ID별 고화질 이미지 매핑 객체
const categoryImages: Record<string, string> = {
  '12': 'https://images.unsplash.com/photo-1546874177-9e664107314e?auto=format&fit=crop&w=600&q=80', // 관광지
  '14': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80', // 문화시설
  '15': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80', // 축제공연행사
  '25': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80', // 여행코스
  '28': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=600&q=80', // 레포츠
  '32': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', // 숙박
  '38': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80', // 쇼핑
}

// 각 카테고리 카드 상세 메타데이터 (가독성을 위한 파스텔톤 배경 및 텍스트/아이콘 전용 테마색 지정)
const categoryDetails = ref([
  {
    id: '12',
    description: '해운대 · 광안리 · 감천 등 명소',
    count: 142,
    textColor: 'text-[#FF6B4A]', // 하단 개수 강조 컬러
    iconBg: 'bg-[#FF4D2D]'      // 아이콘 원형 배경
  },
  {
    id: '14',
    description: '박물관 · 갤러리 · 공연장',
    count: 87,
    textColor: 'text-[#A394FF]',
    iconBg: 'bg-[#6C5DD3]'
  },
  {
    id: '15',
    description: 'BIFF · 불꽃축제 · 어방축제',
    count: 63,
    textColor: 'text-[#FFB55F]',
    iconBg: 'bg-[#FF9F43]'
  },
  {
    id: '25',
    description: '반나절 · 당일 · 1박2일 코스',
    count: 38,
    textColor: 'text-[#10E3D1]',
    iconBg: 'bg-[#0BA09B]'
  },
  {
    id: '28',
    description: '서핑 · 클라이밍 · 수상레저',
    count: 54,
    textColor: 'text-[#50E469]',
    iconBg: 'bg-[#2ECC71]'
  },
  {
    id: '32',
    description: '호텔 · 게스트하우스 · 펜션',
    count: 209,
    textColor: 'text-[#5EADFF]',
    iconBg: 'bg-[#3182CE]'
  },
  {
    id: '38',
    description: '국제시장 · 서면 · 센텀시티',
    count: 95,
    textColor: 'text-[#FFA1EB]',
    iconBg: 'bg-[#E040FB]'
  }
])

// constants.ts 의 카테고리 정보와 아이콘, 설명, 이미지 매핑 진행
const categoryList = CATEGORIES.map(cat => {
  const detail = categoryDetails.value.find(d => d.id === cat.id)
  const bgImg = categoryImages[cat.id] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
  
  // 정밀하게 조정된 SVG 뷰박스 및 스케일의 패스 정보
  let svgPath = 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z'
  if (cat.id === '12') svgPath = 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
  else if (cat.id === '14') svgPath = 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
  else if (cat.id === '15') svgPath = 'M9 18V5l12-2v13 M9 10l12-2 M9 21a3 3 0 1 1-6-0 3 3 0 0 1 6 0z M21 19a3 3 0 1 1-6-0 3 3 0 0 1 6 0z'
  else if (cat.id === '25') svgPath = 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z'
  else if (cat.id === '28') svgPath = 'M5.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 15h3.5L18 10H12 M12 15L9 9H5'
  else if (cat.id === '32') svgPath = 'M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18 M6 6h2 M6 10h2 M6 14h2 M16 6h2 M16 10h2 M16 14h2 M11 6h2 M11 10h2 M11 14h2 M11 18h2'
  else if (cat.id === '38') svgPath = 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'

  return {
    ...cat,
    description: detail?.description || '부산의 다양한 핫플레이스',
    count: detail?.count || 0,
    bgImage: bgImg,
    textColor: detail?.textColor || 'text-[#FF4D2D]',
    iconBg: detail?.iconBg || 'bg-gray-100',
    svgPath
  }
})

function goCategory(categoryId: string) {
  router.push({
    name: 'tourism',
    query: { category: categoryId }
  })
}
</script>

<template>
  <div class="w-full">
    <!-- 1. HERO SECTION (부산 바다 배경 이미지) -->
    <section class="relative h-[480px] w-full overflow-hidden bg-[#0F1F4B]">
      <div 
        class="absolute inset-0 bg-cover bg-center filter brightness-75 scale-105"
        style="background-image: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80');"
      ></div>
      <div class="absolute inset-0 bg-black/35"></div>

      <div class="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
        <div class="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
          <span class="inline-block">📍</span> 부산 로컬 여행 가이드
        </div>

        <h1 class="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl" style="font-family: var(--font-heading);">
          부산, 현지인처럼
        </h1>

        <p class="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/90 md:text-lg">
          해운대 · 광안리부터 영도 골목, 전포동 카페거리까지<br />
          2030이 발굴한 찐 부산 여행 정보
        </p>
      </div>
    </section>

    <!-- 2. CATEGORY SECTION (고급스럽고 깊이감 있는 어두운 카드 배경) -->
    <section class="mx-auto max-w-7xl px-6 py-12 md:py-16">
      <div class="mb-8">
        <span class="text-sm font-bold tracking-wider text-[#FF4D2D] uppercase">카테고리</span>
        <h2 class="mt-1 text-2xl font-black text-[#0F1F4B] md:text-3xl" style="font-family: var(--font-heading);">
          무엇을 찾고 계신가요?
        </h2>
      </div>

      <!-- 카테고리 카드 그리드 -->
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          v-for="cat in categoryList" 
          :key="cat.id"
          @click="goCategory(cat.id)"
          class="group relative flex flex-col justify-between rounded-[28px] p-6 h-[200px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg cursor-pointer bg-black"
        >
          <!-- 카드별 어두운 배경 이미지 적용 (배경 이미지의 밝기를 50% 수준으로 확 낮추어 글씨를 돋보이게 함) -->
          <div 
            class="absolute inset-0 bg-cover bg-center brightness-[0.45] transition-transform duration-500 group-hover:scale-105"
            :style="{ backgroundImage: `url(${cat.bgImage})` }"
          ></div>

          <!-- 어두운 오버레이 레이어 추가로 가독성 한층 강화 -->
          <div class="absolute inset-0 bg-black/15"></div>

          <!-- 내부 콘텐츠 레이어 (배경 위에 뜨도록 z-index 보장, 텍스트 흰색으로 완전 복구) -->
          <div class="relative z-10">
            <!-- 동그란 아이콘 영역 (미니멀하고 세련되게 축소) -->
            <div 
              class="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-md transition-transform duration-300 group-hover:scale-110"
              :class="cat.iconBg"
            >
              <!-- 12px~14px 크기로 작게 설정하여 깨짐 방지 -->
              <svg 
                class="h-5 w-5 fill-none stroke-current stroke-[2.2]" 
                viewBox="0 0 24 24" 
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path :d="cat.svgPath" />
              </svg>
            </div>

            <!-- 제목 및 설명 (선명한 흰색과 반투명 흰색으로 가독성 극대화) -->
            <h3 class="mt-5 text-xl font-bold text-white tracking-tight">
              {{ cat.name }}
            </h3>
            <p class="mt-1.5 text-xs text-white/80 font-medium line-clamp-1">
              {{ cat.description }}
            </p>
          </div>

          <!-- 개수 표시 및 화살표 (각 카테고리 고유 테마 컬러 매핑) -->
          <div class="relative z-10 flex items-center font-bold text-sm" :class="cat.textColor">
            <span>{{ cat.count }}곳</span>
            <svg class="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>