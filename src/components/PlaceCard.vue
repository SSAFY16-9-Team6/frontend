<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Place } from '../types'

const props = defineProps<{
  place: Place
}>()

const imageSrc = computed(() => {
  const image = props.place.image
  if (!image) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'
  }

  return /^https?:\/\//.test(image)
    ? image
    : `https://images.unsplash.com/${image}?auto=format&fit=crop&w=900&q=80`
})

// 모달 열림/닫힘 상태 관리
const isModalOpen = ref(false)

function openModal() {
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}
</script>

<template>
  <!-- 1 & 4. 호버 효과가 없고, 클릭하면 모달을 여는 카드 (div) -->
  <div 
    @click="openModal"
    class="block overflow-hidden rounded-[24px] border border-[#E6D8C4] bg-white shadow-sm transition duration-300 cursor-pointer"
  >
    <!-- 이미지 영역 -->
    <div class="relative h-48 overflow-hidden bg-gray-100">
      <img 
        :src="imageSrc" 
        :alt="place.name"
        class="w-full h-full object-cover" 
      />
      <!-- 카테고리 배지 -->
      <span class="absolute top-4 left-4 bg-[#FF4D2D] text-white text-xs font-extrabold px-3 py-1.5 rounded-full tracking-wider shadow">
        {{ place.category }}
      </span>
    </div>

    <!-- 콘텐츠 본문 영역 -->
    <div class="p-5 flex flex-col gap-3">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-lg font-bold text-[#0F1F4B]">
          {{ place.name }}
        </h3>
        <div class="flex items-center gap-0.5 text-xs font-semibold text-[#8A94A6] shrink-0 mt-0.5">
          <!-- 맵 핀 아이콘 -->
          <svg class="w-3.5 h-3.5 text-[#8A94A6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ place.region }}
        </div>
      </div>
      
      <!-- 3. 장소 설명 대신 주소(address) 표시 -->
      <p class="text-sm leading-relaxed text-[#4F5B72]">
        {{ place.address }}
      </p>
    </div>
  </div>

  <!-- 상세 정보 모달 (Teleport를 사용해 body 바로 아래 렌더링) -->
  <Teleport to="body">
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-[#E6D8C4] bg-white shadow-2xl transition-all">
        
        <!-- 닫기 버튼 -->
        <button 
          @click="closeModal"
          class="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition-colors"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- 모달 이미지 -->
        <div class="relative h-64 w-full overflow-hidden bg-gray-100">
          <img 
            :src="imageSrc" 
            :alt="place.name"
            class="h-full w-full object-cover"
          />
        </div>

        <!-- 모달 콘텐츠 본문 -->
        <div class="p-6 space-y-4">
          <div>
            <span class="inline-block text-xs font-semibold text-[#8A94A6] mb-1">{{ place.region }}</span>
            <h2 class="text-2xl font-bold text-[#0F1F4B]">{{ place.name }}</h2>
          </div>

          <!-- 상세 주소 표시 -->
          <div class="rounded-2xl bg-[#F9F1E5]/50 p-4 border border-[#E6D8C4]/40">
            <div class="flex items-start gap-2.5">
              <svg class="w-5 h-5 text-[#FF4D2D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <span class="block text-xs font-semibold text-[#8A94A6]">주소</span>
                <span class="text-sm font-medium text-[#4F5B72]">{{ place.address }}</span>
              </div>
            </div>
          </div>

          <!-- 네이버 지도 하이퍼링크 바로가기 버튼 -->
          <div class="pt-2">
            <a 
              :href="`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D2D] py-3.5 text-center text-sm font-bold text-white shadow-md shadow-[#FF4D2D]/20 hover:bg-[#E03D1E] active:scale-98 transition-all"
            >
              <span>네이버 지도에서 위치 보기</span>
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>