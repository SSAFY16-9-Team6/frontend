<!-- src/views/MapView.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { PLACES } from '../data/mockData'
import { CATEGORIES } from '../data/constants' // constants.ts에서 카테고리 테마 색상 및 정의 가져오기
import type { Place } from '../types'
import NaverMap from '../components/NaverMap.vue'

const selectedCategoryName = ref('전체')
const activePlaceId = ref<string | null>(null)

// 카테고리별 필터링된 장소 데이터
const filteredPlaces = computed(() => {
  return PLACES.filter(place => {
    return selectedCategoryName.value === '전체' || place.category === selectedCategoryName.value
  })
})

// 현재 선택된 활성 장소 정보 객체
const activePlace = computed(() => {
  return PLACES.find(place => place.id === activePlaceId.value) || null
})

// 장소의 카테고리 이름을 바탕으로 constants.ts에 정의된 색상 클래스를 추출하는 헬퍼 함수
function getCategoryColorClass(categoryName: string): string {
  const matched = CATEGORIES.find(cat => cat.name === categoryName)
  return matched ? matched.color : 'bg-[#0F1F4B]' // 매칭 안 될 시 기본값 Deep Navy
}

// 핀 클릭 및 리스트 클릭 처리
function handlePlaceSelect(placeId: string) {
  activePlaceId.value = placeId
}

// 상세 정보 카드 닫기
function closeDetailCard() {
  activePlaceId.value = null
}
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- 타이틀 -->
    <div class="mb-8">
      <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">지도</span>
      <h1 class="text-3xl font-black text-[#0F1F4B] mt-1">부산 관광 지도</h1>
    </div>

    <!-- 카테고리별 필터 컨트롤 -->
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-bold text-[#4F5B72] mr-2">카테고리별</span>
        
        <!-- 전체 필터 버튼 -->
        <button
          type="button"
          @click="selectedCategoryName = '전체'"
          :class="[
            'px-4 py-2 rounded-full text-xs font-semibold transition border',
            selectedCategoryName === '전체'
              ? 'bg-[#0F1F4B] text-white border-[#0F1F4B]'
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          전체
        </button>

        <!-- 개별 카테고리 버튼들 (비활성화 상태 시 회색 글자색 text-[#4F5B72] 유지) -->
        <button
          v-for="cat in CATEGORIES"
          :key="cat.id"
          type="button"
          @click="selectedCategoryName = cat.name"
          :class="[
            'px-4 py-2 rounded-full text-xs font-semibold transition border',
            selectedCategoryName === cat.name
              ? [cat.color, 'text-white border-transparent']
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- 메인 지도/목록 뷰 (상단 레이아웃) -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
      <!-- 네이버 지도 영역 -->
      <div class="lg:col-span-2 relative rounded-[32px] overflow-hidden border border-[#E6D8C4] bg-white shadow-sm">
        <NaverMap 
          :places="filteredPlaces" 
          :active-id="activePlaceId"
          @marker-click="handlePlaceSelect" 
        />
      </div>

      <!-- 우측 리스트 영역 -->
      <div class="bg-white rounded-[32px] border border-[#E6D8C4] shadow-sm flex flex-col overflow-hidden">
        <div class="p-5 border-b border-[#F4E7D3] flex justify-between items-center bg-[#F9F1E5]/20">
          <span class="font-bold text-[#0F1F4B]">{{ filteredPlaces.length }}곳 표시됨</span>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="filteredPlaces.length === 0" class="h-full flex items-center justify-center text-sm text-[#8A94A6]">
            조건에 맞는 장소가 없습니다.
          </div>
          <div
            v-for="place in filteredPlaces"
            :key="place.id"
            @click="handlePlaceSelect(place.id)"
            :class="[
              'p-4 rounded-2xl border transition cursor-pointer flex gap-4 items-center',
              activePlaceId === place.id 
                ? 'border-[#FF4D2D] bg-[#FF4D2D]/5 shadow-sm' 
                : 'border-[#E6D8C4]/60 hover:border-[#0F1F4B]/50 bg-white'
            ]"
          >
            <!-- 카테고리에 상응하는 고유 배경색 동적 바인딩 -->
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm',
                getCategoryColorClass(place.category)
              ]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-[#0F1F4B] truncate">{{ place.name }}</h3>
              <p class="text-xs text-[#8A94A6] mt-0.5 truncate">{{ place.address }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 선택 장소 상세 정보 카드 (설명 및 팁 텍스트 전면 배제) -->
    <transition name="fade-slide">
      <div 
        v-if="activePlace" 
        class="mt-6 bg-white rounded-[24px] border border-[#E6D8C4] p-6 shadow-md relative flex gap-6 items-center"
      >
        <!-- 닫기 버튼 (X) -->
        <button 
          @click="closeDetailCard" 
          class="absolute top-4 right-4 text-[#8A94A6] hover:text-[#0F1F4B] transition p-1"
          aria-label="닫기"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 1. 이미지 영역 -->
        <div class="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-[#F9F1E5] border border-[#E6D8C4]/40">
          <img 
            :src="`https://images.unsplash.com/${activePlace.image}?auto=format&fit=crop&w=300&q=80`" 
            :alt="activePlace.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- 2. 장소 정보 콘텐츠 (이름, 주소만 정돈하여 노출) -->
        <div class="flex-1 min-w-0 pr-6">
          <h2 class="text-2xl font-black text-[#0F1F4B] truncate">{{ activePlace.name }}</h2>
          
          <div class="flex items-center gap-1.5 text-sm text-[#4F5B72] mt-2 font-semibold">
            <svg class="w-4 h-4 text-[#FF4D2D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ activePlace.address }}
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease-out;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>