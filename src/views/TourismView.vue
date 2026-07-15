<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import PlaceCard from '../components/PlaceCard.vue'
import Tag from '../components/ui/Tag.vue'
import { CATEGORIES, DISTRICTS } from '../data/constants'
import type { Place } from '../types'

const districts = ['전체', ...DISTRICTS.map((district) => district.name)]
const selectedDistrict = ref('전체')
const selectedCategoryId = ref(CATEGORIES[0]?.id ?? '12')
const places = ref<Place[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const categoryName = ref(CATEGORIES[0]?.name ?? '관광지')
const totalCount = ref(0)
const pageSize = 20
const currentPage = ref(1)
const totalPages = ref(1)

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
    const response = await fetch(
      `https://backend-xxf5.onrender.com/api/v1/categories/${selectedCategoryId.value}/places?page=${currentPage.value}&size=${pageSize}`
    )
    if (!response.ok) {
      throw new Error('관광지 데이터를 불러오지 못했습니다.')
    }

    const result = await response.json()
    const items = result?.data?.items ?? []
    const fallbackName = CATEGORIES.find((cat) => cat.id === selectedCategoryId.value)?.name ?? '관광지'

    places.value = items.map(mapPlace)
    categoryName.value = result?.data?.categoryName ?? fallbackName
    totalCount.value = result?.data?.totalCount ?? items.length
    totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize))
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

const maxVisiblePages = 7

const filteredPlaces = computed(() => {
  if (selectedDistrict.value === '전체') return places.value
  return places.value.filter((place) => place.region === selectedDistrict.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const size = Math.min(maxVisiblePages, total)

  // 선택 페이지를 가운데에 두고, 양 끝에서만 범위를 밀어 맞춤
  let start = current - Math.floor(size / 2)
  let end = start + size - 1

  if (start < 1) {
    start = 1
    end = size
  }

  if (end > total) {
    end = total
    start = total - size + 1
  }

  return Array.from({ length: end - start + 1 }, (_, index) => start + index)
})

function selectCategory(categoryId: string) {
  if (selectedCategoryId.value === categoryId) return
  selectedCategoryId.value = categoryId
  selectedDistrict.value = '전체'
  currentPage.value = 1
  loadPlaces()
}

function selectDistrict(district: string) {
  selectedDistrict.value = district
  currentPage.value = 1
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  loadPlaces()
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
      <span class="text-[#0F1F4B]">{{ categoryName }}</span>
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
        <p class="text-white/80 text-sm mt-1.5 font-medium">{{ totalCount }}곳 · 부산의 대표 {{ categoryName }} 정보를 확인해보세요</p>
      </div>
    </div>

    <!-- Category Filter Tags (constants.ts 의 CATEGORIES 와 연계) -->
    <div class="flex flex-wrap gap-2.5 py-1">
      <button
        v-for="category in CATEGORIES"
        :key="category.id"
        type="button"
        class="rounded-full border transition-all duration-200 shadow-sm"
        :class="
          selectedCategoryId === category.id
            ? 'border-[#0F1F4B] bg-[#0F1F4B] [&_span]:bg-transparent [&_span]:text-white'
            : 'border-[#E6D8C4] bg-white hover:border-[#0F1F4B]/50 [&_span]:bg-transparent'
        "
        @click="selectCategory(category.id)"
      >
        <Tag :label="category.name" />
      </button>
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
      <p class="font-medium">{{ categoryName }} 정보를 불러오는 중입니다...</p>
    </div>

    <div v-else-if="errorMessage" class="text-center py-20 bg-white rounded-[32px] border border-[#E6D8C4] text-[#8A94A6]">
      <p class="font-medium">{{ errorMessage }}</p>
    </div>

    <template v-else-if="filteredPlaces.length > 0">
      <!-- Places Grid -->
      <div class="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <PlaceCard v-for="place in filteredPlaces" :key="place.id" :place="place" />
      </div>

      <div v-if="totalPages > 1" class="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-2">
        <button
          type="button"
          class="px-3 py-2 text-sm font-semibold rounded-full border border-[#E6D8C4] bg-white text-[#4F5B72] disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="changePage(1)"
        >
          &lt;&lt;
        </button>
        <button
          type="button"
          class="px-3 py-2 text-sm font-semibold rounded-full border border-[#E6D8C4] bg-white text-[#4F5B72] disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          &lt;
        </button>

        <button
          v-for="page in visiblePages"
          :key="page"
          type="button"
          class="min-w-10 px-3 py-2 text-sm font-semibold rounded-full border transition-all"
          :class="currentPage === page
            ? 'bg-[#FF4D2D] text-white border-[#FF4D2D]'
            : 'bg-white text-[#4F5B72] border-[#E6D8C4] hover:bg-[#F4E7D3]/40'"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button
          type="button"
          class="px-3 py-2 text-sm font-semibold rounded-full border border-[#E6D8C4] bg-white text-[#4F5B72] disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
        >
          &gt;
        </button>
        <button
          type="button"
          class="px-3 py-2 text-sm font-semibold rounded-full border border-[#E6D8C4] bg-white text-[#4F5B72] disabled:opacity-50"
          :disabled="currentPage === totalPages"
          @click="changePage(totalPages)"
        >
          &gt;&gt;
        </button>
      </div>
    </template>

    <!-- No Items Fallback -->
    <div v-else class="text-center py-20 bg-white rounded-[32px] border border-[#E6D8C4] text-[#8A94A6]">
      <svg class="w-12 h-12 mx-auto text-[#C0C8D6] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="font-medium">선택하신 지역에 등록된 명소가 없습니다.</p>
    </div>
  </div>
</template>