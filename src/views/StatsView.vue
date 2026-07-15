<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
// constants.ts에서 실제 정의된 CATEGORIES와 DISTRICTS 임포트
import { CATEGORIES, DISTRICTS } from '../data/constants.ts'

const router = useRouter()

// ==========================================
// 📌 1. 통계 데이터 정의 (상수 id/code와 매핑)
// ==========================================

// [A] 카테고리별 통계 데이터 (상수의 id '12', '14', '15', '28' 등과 연결)
const categoryStatsRaw = ref([
  { id: '12', count: 245 }, // 관광지
  { id: '14', count: 189 }, // 문화시설
  { id: '15', count: 142 }, // 축제공연행사
  { id: '28', count: 98 },  // 레포츠
  { id: '32', count: 75 }   // 숙박
])

// [B] 권역별 조회수 데이터 (상수의 code '110', '140', '230' 등과 연결)
const districtViewsRaw = ref([
  { code: '350', views: 34500 }, // 해운대구
  { code: '230', views: 28900 }, // 부산진구
  { code: '200', views: 21200 }, // 영도구
  { code: '110', views: 18000 }, // 중구
  { code: '260', views: 12500 }  // 동래구
])

// ==========================================
// 📌 2. 상수를 매핑한 데이터 가공 (Computed)
// ==========================================

// [A-1] CATEGORIES 상수 결합 및 도넛 차트 컬러웨어 매핑
const mappedCategoryData = computed(() => {
  return categoryStatsRaw.value.map(stat => {
    const matched = CATEGORIES.find(c => c.id === stat.id)
    
    // 상수의 Tailwind bg 클래스('bg-[#FF4D2D]')에서 Hex 색상 코드만 추출하여 SVG 차트에 적용
    let hexColor = '#0F1F4B' // 기본 디폴트 인디고 컬러
    if (matched && matched.color) {
      const matchHex = matched.color.match(/#([A-Fa-f0-9]{6})/)
      if (matchHex) hexColor = `#${matchHex[1]}`
    }

    return {
      id: stat.id,
      name: matched ? matched.name : '기타',
      count: stat.count,
      color: hexColor
    }
  })
})

const totalCount = computed(() => {
  return mappedCategoryData.value.reduce((acc, cur) => acc + cur.count, 0)
})

// [A-2] SVG 원형 도넛 차트의 세그먼트 각도 계산
const donutSegments = computed(() => {
  let accumulatedPercent = 0
  
  return mappedCategoryData.value.map((item) => {
    const percent = (item.count / totalCount.value) * 100
    // 반지름(r)=40일 때 원둘레 약 251.32
    const strokeLength = (percent / 100) * 251.32
    const strokeOffset = 251.32 - strokeLength + (accumulatedPercent / 100) * 251.32
    
    accumulatedPercent += percent
    
    return {
      ...item,
      percent: Math.round(percent),
      strokeDashArray: `${strokeLength} ${251.32 - strokeLength}`,
      strokeDashOffset: -strokeOffset
    }
  })
})

// [B-1] DISTRICTS 상수의 code 기준 권역 데이터 매핑
const mappedDistrictData = computed(() => {
  return districtViewsRaw.value.map(stat => {
    const matched = DISTRICTS.find(d => d.code === stat.code)
    return {
      code: stat.code,
      name: matched ? matched.name : '기타 구',
      views: stat.views
    }
  })
})

// 가로 막대비율 계산용 최대값
const maxViews = computed(() => {
  const views = mappedDistrictData.value.map(d => d.views)
  return Math.max(...views, 1000)
})

const formatViews = (val: number) => {
  return val.toLocaleString() + '회'
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F8F6] py-12 px-4 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-5xl">
      
      <!-- 상단 헤더 영역 -->
      <div class="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">데이터</span>
          <h1 class="font-heading text-2xl sm:text-3xl font-bold text-[#0F1F4B] mt-1">부산 여행 통계 대시보드</h1>
          <p class="text-sm text-[#4F5B72] mt-1">카테고리별 명소 분포도와 구별(권역별) 누적 조회수를 간결하게 차트화합니다.</p>
        </div>
      </div>

      <!-- 메인 통계 2단 그리드 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- [1] 카테고리별 명소 분포 (원형/도넛 차트) -->
        <div class="rounded-[24px] bg-white p-6 sm:p-8 border border-[#F5F0E6] shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-[#0F1F4B]">카테고리별 명소 분포</h3>
            <p class="text-xs text-[#8A866F] mt-0.5">상수(CATEGORIES) 기준 명소 업로드 분포 비율</p>
          </div>

          <!-- 도넛 차트 컨텐츠 -->
          <div class="my-8 flex flex-col sm:flex-row items-center justify-center gap-8">
            <!-- SVG 커스텀 도넛 그래픽 -->
            <div class="relative w-44 h-44 flex-shrink-0">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FAF9F6" stroke-width="12" />
                <circle
                  v-for="(segment, index) in donutSegments"
                  :key="'donut-' + index"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  :stroke="segment.color"
                  stroke-width="12"
                  :stroke-dasharray="segment.strokeDashArray"
                  :stroke-dashoffset="segment.strokeDashOffset"
                  stroke-linecap="round"
                  class="transition-all duration-500 hover:stroke-opacity-80 cursor-pointer"
                />
              </svg>
              <!-- 중앙 합계 수치 표시 -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold text-[#0F1F4B]">{{ totalCount }}</span>
                <span class="text-[10px] text-[#8A866F] uppercase tracking-wider">총 명소</span>
              </div>
            </div>

            <!-- 카테고리 범례 리스트 -->
            <div class="flex-1 w-full space-y-3.5">
              <div 
                v-for="item in donutSegments" 
                :key="item.id"
                class="flex items-center justify-between border-b border-[#F9F8F6] pb-2"
              >
                <div class="flex items-center gap-2.5">
                  <span class="h-3 w-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
                  <span class="text-sm font-medium text-[#4F5B72]">{{ item.name }}</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-[#0F1F4B]">{{ item.count }}개</span>
                  <span class="text-xs text-[#8A866F] ml-1.5">({{ item.percent }}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-[#FAF9F6] p-4 text-xs text-[#8A866F] leading-relaxed">
            분석 결과 현재 여행 정보 데이터베이스는 <strong class="text-[#0F1F4B]">관광지</strong> 및 <strong class="text-[#0BA09B]">문화시설</strong> 카테고리가 주류를 형성하고 있습니다.
          </div>
        </div>

        <!-- [2] 권역별(구 단위) 조회수 현황 (막대그래프) -->
        <div class="rounded-[24px] bg-white p-6 sm:p-8 border border-[#F5F0E6] shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-lg font-bold text-[#0F1F4B]">구별 조회수 현황</h3>
            <p class="text-xs text-[#8A866F] mt-0.5">상수(DISTRICTS)별 명소 콘텐츠 누적 검색 및 조회 수</p>
          </div>

          <!-- 가로형 막대 레이아웃 -->
          <div class="my-8 space-y-5">
            <div 
              v-for="item in mappedDistrictData" 
              :key="item.code"
              class="group"
            >
              <!-- 텍스트 헤더 라인 -->
              <div class="flex justify-between items-center text-sm mb-1.5">
                <span class="font-bold text-[#0F1F4B]">{{ item.name }}</span>
                <span class="font-semibold text-[#8A866F] group-hover:text-[#FF4D2D] transition-colors">
                  {{ formatViews(item.views) }}
                </span>
              </div>
              
              <!-- 진척도 스타일의 수치 가로 막대 그래프 -->
              <div class="h-5 w-full rounded-lg bg-[#FAF9F6] overflow-hidden border border-[#F5F0E6]">
                <div 
                  class="h-full rounded-lg transition-all duration-1000 ease-out origin-left"
                  :style="{ 
                    width: `${(item.views / maxViews) * 100}%`,
                    backgroundColor: item.code === '350' || item.code === '230' ? '#FF4D2D' : '#0F1F4B'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-[#FAF9F6] p-4 text-xs text-[#8A866F] leading-relaxed">
            여행 피드에서 조회수가 가장 높게 집중된 관심 지역은 <strong class="text-[#FF4D2D]">해운대구</strong>와 <strong class="text-[#FF4D2D]">부산진구</strong> 일대입니다.
          </div>
        </div>

      </div>

    </div>
  </div>
</template>