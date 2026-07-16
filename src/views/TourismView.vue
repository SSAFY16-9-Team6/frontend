<!-- src/views/TourismView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PlaceCard from '../components/PlaceCard.vue'
import Tag from '../components/ui/Tag.vue'
import { CATEGORIES, DISTRICTS } from '../data/constants'
import type { Place } from '../types'

const route = useRoute()

// 지역구 선택 상태 ('전체' 또는 각 지역구 이름)
const selectedDistrict = ref('전체')

// URL 쿼리에 category가 있으면 그것을 사용하고, 없으면 카테고리의 첫 번째 ID를 사용
const getInitialCategoryId = () => {
  const queryCat = route.query.category as string
  if (queryCat && CATEGORIES.some(cat => cat.id === queryCat)) {
    return queryCat
  }
  return CATEGORIES[0]?.id ?? '12'
}

const selectedCategoryId = ref(getInitialCategoryId())
const places = ref<Place[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// 선택된 카테고리 이름을 반응형으로 추적
const categoryName = computed(() => {
  return CATEGORIES.find((cat) => cat.id === selectedCategoryId.value)?.name ?? '관광지'
})

// 한 페이지당 보여줄 장소 개수 (클라이언트 사이드 페이지네이션용)
const pageSize = 20
const currentPage = ref(1)

// 각 카테고리 ID별 최적화된 고화질 이미지 매핑 객체
const categoryImages: Record<string, string> = {
  '12': 'https://images.unsplash.com/photo-1546874177-9e664107314e?auto=format&fit=crop&w=1600&q=80',
  '14': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=80',
  '15': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
  '25': 'https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=1600&q=80',
  '28': 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1600&q=80',
  '32': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  '38': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
  '39': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
}

// 선택된 카테고리에 맞는 이미지를 가져오는 computed
const currentBannerImage = computed(() => {
  return categoryImages[selectedCategoryId.value] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80'
})

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

// ★ 지도 코드(MapView.vue)의 데이터를 전부(hasMore가 끝날 때까지) 긁어오는 완전 탐색 알고리즘 이식
async function loadPlaces() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const allItems: any[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await fetch(
        `https://backend-xxf5.onrender.com/api/v1/categories/${selectedCategoryId.value}/places?page=${page}&size=100`
      )
      if (!response.ok) {
        throw new Error(`${categoryName.value} 데이터를 불러오지 못했습니다.`)
      }

      const result = await response.json()
      const items = result?.data?.items ?? []
      allItems.push(...items)

      const totalCount = result?.data?.totalCount ?? 0
      const currentCount = allItems.length
      
      // 더 불러올 데이터가 남았는지 지도 로직과 동일하게 점검
      hasMore = currentCount < totalCount && items.length > 0
      page += 1
    }

    places.value = allItems.map(mapPlace)
  } catch (error) {
    console.error(error)
    errorMessage.value = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

// 홈화면에서 다른 카테고리를 눌렀을 때를 대비해 라우터 파라미터 변화 감지
watch(
  () => route.query.category,
  (newCategory) => {
    const targetCategory = (newCategory as string) || (CATEGORIES[0]?.id ?? '12')
    if (selectedCategoryId.value !== targetCategory) {
      selectedCategoryId.value = targetCategory
      selectedDistrict.value = '전체'
      currentPage.value = 1
      loadPlaces()
    }
  }
)

// ★ 2차 필터링: 불러온 '전체 누적 데이터' 중 선택한 지역구에 해당하는 데이터만 실시간 필터링
const allFilteredPlaces = computed(() => {
  if (selectedDistrict.value === '전체') {
    return places.value
  }
  return places.value.filter((place) => place.region === selectedDistrict.value)
})

// ★ 상단 배너에 표시될 필터링된 총 개수
const totalCount = computed(() => {
  return allFilteredPlaces.value.length
})

// ★ 필터링된 결과물 개수에 따라 전체 페이지 수 유동적 계산
const totalPages = computed(() => {
  return Math.max(1, Math.ceil(allFilteredPlaces.value.length / pageSize))
})

// ★ 현재 페이지에 해당하는 20개의 항목만 리스트 슬라이싱하여 노출
const filteredPlaces = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return allFilteredPlaces.value.slice(start, end)
})

// 페이지네이션 가시범위 계산
const maxVisiblePages = 7
const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const size = Math.min(maxVisiblePages, total)

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

// 지역구를 선택했을 때 currentPage를 1페이지로 리셋
function selectDistrict(district: string) {
  selectedDistrict.value = district
  currentPage.value = 1
}

function changePage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
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
        :src="currentBannerImage" 
        :alt="categoryName" 
        class="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out"
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

    <!-- Category Filter Tags -->
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

    <!-- District Filter Tags -->
    <div class="flex flex-wrap gap-2.5 py-1">
      <!-- 전체 버튼 -->
      <button
        type="button"
        class="px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200"
        :class="selectedDistrict === '전체' 
          ? 'bg-[#FF4D2D] text-white shadow-md shadow-[#FF4D2D]/10 hover:bg-[#E03D1E]' 
          : 'bg-white text-[#4F5B72] hover:bg-[#F4E7D3]/40 border border-[#E6D8C4]/60'"
        @click="selectDistrict('전체')"
      >
        전체
      </button>
      <!-- 개별 지역구 버튼들 -->
      <button
        v-for="district in DISTRICTS"
        :key="district.code"
        type="button"
        class="px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200"
        :class="selectedDistrict === district.name 
          ? 'bg-[#FF4D2D] text-white shadow-md shadow-[#FF4D2D]/10 hover:bg-[#E03D1E]' 
          : 'bg-white text-[#4F5B72] hover:bg-[#F4E7D3]/40 border border-[#E6D8C4]/60'"
        @click="selectDistrict(district.name)"
      >
        {{ district.name }}
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

      <!-- Pagination -->
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