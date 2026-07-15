<!-- src/views/MapView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CATEGORIES, DISTRICTS } from '../data/constants'
import type { Place } from '../types'
import NaverMap from '../components/NaverMap.vue'

const selectedCategoryId = ref('all')
const selectedDistrict = ref('all') // 1. 구별 필터를 위한 반응형 변수 추가 (기본값: 전체)
const activePlaceId = ref<string | null>(null)
const allPlaces = ref<Place[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return '전체'
  return CATEGORIES.find((cat) => cat.id === selectedCategoryId.value)?.name ?? '전체'
})

// 2. 카테고리 필터와 구별 필터를 모두 거쳐 최종 필터링된 결과 도출
const filteredPlaces = computed(() => {
  let result = allPlaces.value

  // 카테고리 필터 적용
  if (selectedCategoryId.value !== 'all') {
    result = result.filter((place) => place.categoryId === selectedCategoryId.value)
  }

  // 구별 필터 적용
  if (selectedDistrict.value !== 'all') {
    result = result.filter((place) => place.region === selectedDistrict.value)
  }

  return result
})

const activePlace = computed(() => {
  return allPlaces.value.find((place) => place.id === activePlaceId.value) || null
})

function getCategoryColorClass(categoryName: string): string {
  const matched = CATEGORIES.find((cat) => cat.name === categoryName)
  return matched ? matched.color : 'bg-[#0F1F4B]'
}

function getImageUrl(image: string | undefined): string {
  if (!image) {
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=300&q=80'
  }

  return /^https?:\/\//.test(image)
    ? image
    : `https://images.unsplash.com/${image}?auto=format&fit=crop&w=300&q=80`
}

function mapPlace(item: any, categoryId: string): Place {
  const categoryName = CATEGORIES.find((cat) => cat.id === categoryId)?.name ?? '기타'
  const region = DISTRICTS.find((district) => district.code === item.lDongSignguCd)?.name ?? '기타'

  return {
    id: item.contentId,
    name: item.title,
    category: categoryName,
    categoryId,
    region,
    address: item.address,
    description: item.title,
    image: item.thumbnail || '',
    mapx: item.mapX,
    mapy: item.mapY
  }
}

async function loadPlaces() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const categoryResults = await Promise.all(
      CATEGORIES.map(async (category) => {
        const allItems: any[] = []
        let page = 1
        let hasMore = true

        while (hasMore) {
          const response = await fetch(`https://backend-xxf5.onrender.com/api/v1/categories/${category.id}/places?page=${page}&size=100`)
          if (!response.ok) {
            throw new Error(`${category.name} 데이터를 불러오지 못했습니다.`)
          }

          const result = await response.json()
          const items = result?.data?.items ?? []
          allItems.push(...items)

          const totalCount = result?.data?.totalCount ?? 0
          const currentCount = allItems.length
          hasMore = currentCount < totalCount && items.length > 0
          page += 1
        }

        return allItems.map((item: any) => mapPlace(item, category.id))
      })
    )

    allPlaces.value = categoryResults.flat()
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 필터 교체 시 활성화된 카드의 위치 유효성을 고려하여 닫아줌
function selectDistrictFilter(districtName: string) {
  selectedDistrict.value = districtName
  activePlaceId.value = null
}

function selectCategoryFilter(categoryId: string) {
  selectedCategoryId.value = categoryId
  activePlaceId.value = null
}

function handlePlaceSelect(placeId: string) {
  activePlaceId.value = placeId
}

function closeDetailCard() {
  activePlaceId.value = null
}

onMounted(() => {
  loadPlaces()
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- 타이틀 -->
    <div class="mb-8">
      <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">지도</span>
      <h1 class="text-3xl font-black text-[#0F1F4B] mt-1">부산 관광 지도</h1>
    </div>

    <!-- 필터 컨트롤 영역 (구별 필터를 카테고리 위쪽에 구성) -->
    <div class="flex flex-col gap-5 mb-8 bg-white p-6 rounded-[24px] border border-[#E6D8C4] shadow-sm">
      
      <!-- [A] 지역구별 필터 (카테고리 위쪽) -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-bold text-[#4F5B72] mr-3 shrink-0">지역구별</span>
        
        <!-- 전체 필터 버튼 -->
        <button
          type="button"
          @click="selectDistrictFilter('all')"
          :class="[
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition border',
            selectedDistrict === 'all'
              ? 'bg-[#FF4D2D] text-white border-[#FF4D2D]'
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          전체
        </button>

        <button
          v-for="district in DISTRICTS"
          :key="district.code"
          type="button"
          @click="selectDistrictFilter(district.name)"
          :class="[
            'px-3.5 py-1.5 rounded-full text-xs font-semibold transition border',
            selectedDistrict === district.name
              ? 'bg-[#FF4D2D] text-white border-[#FF4D2D]'
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          {{ district.name }}
        </button>
      </div>

      <!-- 구분선 -->
      <div class="border-t border-[#F4E7D3]/60"></div>

      <!-- [B] 카테고리별 필터 -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-bold text-[#4F5B72] mr-3 shrink-0">카테고리별</span>
        
        <!-- 전체 필터 버튼 -->
        <button
          type="button"
          @click="selectCategoryFilter('all')"
          :class="[
            'px-4 py-2 rounded-full text-xs font-semibold transition border',
            selectedCategoryId === 'all'
              ? 'bg-[#0F1F4B] text-white border-[#0F1F4B]'
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          전체
        </button>

        <button
          v-for="cat in CATEGORIES"
          :key="cat.id"
          type="button"
          @click="selectCategoryFilter(cat.id)"
          :class="[
            'px-4 py-2 rounded-full text-xs font-semibold transition border',
            selectedCategoryId === cat.id
              ? [cat.color, 'text-white border-transparent']
              : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'
          ]"
        >
          {{ cat.name }}
        </button>
      </div>

    </div>

    <!-- 메인 지도/목록 뷰 -->
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
          <div v-if="isLoading" class="h-full flex items-center justify-center text-sm text-[#8A94A6]">
            장소 정보를 불러오는 중입니다...
          </div>
          <div v-else-if="errorMessage" class="h-full flex items-center justify-center text-sm text-[#8A94A6]">
            {{ errorMessage }}
          </div>
          <div v-else-if="filteredPlaces.length === 0" class="h-full flex items-center justify-center text-sm text-[#8A94A6] text-center px-4">
            해당 지역구 및 카테고리에 맞는 장소가 없습니다.
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
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-[#F4E7D3] text-[#4F5B72] shrink-0">
                  {{ place.region }}
                </span>
                <h3 class="font-bold text-[#0F1F4B] truncate">{{ place.name }}</h3>
              </div>
              <p class="text-xs text-[#8A94A6] mt-1 truncate">{{ place.address }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 선택 장소 상세 정보 카드 -->
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
            :src="getImageUrl(activePlace.image)"
            :alt="activePlace.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- 2. 장소 정보 콘텐츠 -->
        <div class="flex-1 min-w-0 pr-6">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 text-xs font-bold bg-[#FF4D2D] text-white rounded-md">
              {{ activePlace.region }}
            </span>
            <span class="text-xs font-semibold text-[#8A94A6]">{{ activePlace.category }}</span>
          </div>
          <h2 class="text-2xl font-black text-[#0F1F4B] truncate mt-1.5">{{ activePlace.name }}</h2>
          
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