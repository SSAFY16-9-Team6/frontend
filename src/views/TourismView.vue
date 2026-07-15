<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PlaceCard from '../components/PlaceCard.vue'
import { DISTRICTS } from '../data/constants'
import type { Place } from '../types'

const districts = ['전체', ...DISTRICTS.map((district) => district.name)]
const selectedDistrict = ref('전체')
const places = ref<Place[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const categoryName = ref('관광지')
const totalCount = ref(0)

function mapPlace(item: any): Place {
  const region = DISTRICTS.find((district) => district.code === item.lDongSignguCd)?.name ?? '기타'

  return {
    id: item.contentId,
    name: item.title,
    category: item.categoryName ?? categoryName.value,
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
    const response = await fetch('https://backend-xxf5.onrender.com/api/v1/categories/12/places?page=1&size=20')
    if (!response.ok) {
      throw new Error('관광지 데이터를 불러오지 못했습니다.')
    }

    const result = await response.json()
    const items = result?.data?.items ?? []

    places.value = items.map(mapPlace)
    categoryName.value = result?.data?.categoryName ?? '관광지'
    totalCount.value = result?.data?.totalCount ?? items.length
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const filteredPlaces = computed(() => {
  if (selectedDistrict.value === '전체') return places.value
  return places.value.filter((place) => place.region === selectedDistrict.value)
})

function selectDistrict(district: string) {
  selectedDistrict.value = district
}

onMounted(() => {
  loadPlaces()
})
</script>

<template>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
    <!-- Breadcrumbs -->
    <div class="flex items-center gap-1.5 text-xs font-semibold text-[#8A94A6] px-1">
      <span class="cursor-pointer hover:text-[#0F1F4B]">홈</span>
      <svg class="w-3.5 h-3.5 text-[#C0C8D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-[#0F1F4B]">관광지</span>
    </div>

    <!-- Hero Banner -->
    <div class="relative rounded-[32px] overflow-hidden h-[240px] shadow-sm">
      <img 
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80" 
        alt="Haeundae Sea" 
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/65 via-black/45 to-transparent flex flex-col justify-end p-8 sm:p-10">
        <div class="w-12 h-12 rounded-[16px] bg-[#FF4D2D] flex items-center justify-center text-white mb-3 shadow-md">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{{ categoryName }}</h1>
        <p class="text-white/80 text-sm mt-1.5 font-medium">{{ totalCount }}곳 · 부산의 대표 관광지를 확인해보세요</p>
      </div>
    </div>

    <!-- District Filter Tags (constants.ts 의 DISTRICTS 와 연계) -->
    <div class="flex flex-wrap gap-2.5 py-1">
      <button
        v-for="district in districts"
        :key="district"
        type="button"
        class="px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200"
        :class="selectedDistrict === district 
          ? 'bg-[#FF4D2D] text-white shadow-md shadow-[#FF4D2D]/10 hover:bg-[#E03D1E]' 
          : 'bg-white text-[#4F5B72] hover:bg-[#F4E7D3]/40 border border-[#E6D8C4]/60'"
        @click="selectDistrict(district)"
      >
        {{ district }}
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-20 bg-white rounded-[32px] border border-[#E6D8C4] text-[#8A94A6]">
      <p class="font-medium">관광지 정보를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="errorMessage" class="text-center py-20 bg-white rounded-[32px] border border-[#E6D8C4] text-[#8A94A6]">
      <p class="font-medium">{{ errorMessage }}</p>
    </div>

    <!-- Places Grid -->
    <div v-else-if="filteredPlaces.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <PlaceCard v-for="place in filteredPlaces" :key="place.id" :place="place" />
    </div>

    <!-- No Items Fallback -->
    <div v-else class="text-center py-20 bg-white rounded-[32px] border border-[#E6D8C4] text-[#8A94A6]">
      <svg class="w-12 h-12 mx-auto text-[#C0C8D6] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="font-medium">선택하신 지역에 등록된 명소가 없습니다.</p>
    </div>
  </div>
</template>