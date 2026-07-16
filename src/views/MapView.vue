<!-- src/views/MapView.vue -->
<script setup lang="ts">
import { computed, onMounted, ref, nextTick } from 'vue'
import { CATEGORIES, DISTRICTS, DISTRICTS_WEATHER_GRIDS } from '../data/constants'
import type { Place } from '../types'
import NaverMap from '../components/NaverMap.vue'

const selectedCategoryId = ref('all')
const selectedDistrict = ref('all')
const activePlaceId = ref<string | null>(null)
const allPlaces = ref<Place[]>([])
const isLoading = ref(false)
const errorMessage = ref('')

// === 날씨 관련 상태 변수 ===
interface HourlyForecast {
  time: string       // 예보 시각 (예: "14:00")
  temp: string       // 기온 (예: "25°C")
  statusText: string // 날씨 상태 텍스트
  statusCode: string // 날씨 상태 코드
}

interface WeatherInfo {
  district: string
  temp: string // 현재 기온
  statusText: string // 현재 날씨 상태 텍스트
  statusCode: string // 현재 날씨 상태 코드
  hourly: HourlyForecast[] // 향후 6시간 예보 데이터
}

const weatherList = ref<WeatherInfo[]>([])
const isWeatherLoading = ref(false)

// 현재 선택된 지역구의 날씨 정보를 가져오기 위한 computed
const activeDistrictWeather = computed(() => {
  if (selectedDistrict.value === 'all') return null
  return weatherList.value.find(w => w.district === selectedDistrict.value) || null
})

// 스크롤 이동을 위해 리스트의 각 아이템 요소를 참조할 객체
const placeElements = ref<Record<string, HTMLElement | null>>({})

const selectedCategoryName = computed(() => {
  if (selectedCategoryId.value === 'all') return '전체'
  return CATEGORIES.find((cat) => cat.id === selectedCategoryId.value)?.name ?? '전체'
})

const filteredPlaces = computed(() => {
  let result = allPlaces.value

  if (selectedCategoryId.value !== 'all') {
    result = result.filter((place) => place.categoryId === selectedCategoryId.value)
  }

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

function getCategorySvgPath(categoryName: string): string {
  const matched = CATEGORIES.find((cat) => cat.name === categoryName)
  const categoryId = matched ? matched.id : '12'

  if (categoryId === '12') {
    return 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
  } else if (categoryId === '14') {
    return 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
  } else if (categoryId === '15') {
    return 'M9 18V5l12-2v13 M9 10l12-2 M9 21a3 3 0 1 1-6-0 3 3 0 0 1 6 0z M21 19a3 3 0 1 1-6-0 3 3 0 0 1 6 0z'
  } else if (categoryId === '25') {
    return 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z'
  } else if (categoryId === '28') {
    return 'M5.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 15h3.5L18 10H12 M12 15L9 9H5'
  } else if (categoryId === '32') {
    return 'M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18 M6 6h2 M6 10h2 M6 14h2 M16 6h2 M16 10h2 M16 14h2 M11 6h2 M11 10h2 M11 14h2 M11 18h2'
  } else if (categoryId === '38') {
    return 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'
  } else {
    return 'M18 8V2M14 8V2M22 8V2c0 2.4-1.2 4-4 4v16M3 2v7c0 3.3 2.7 6 6 6v7M9 15v7'
  }
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
  const categoryName = CATEGORIES.find((cat) => cat.name === categoryId)?.name ?? '기타'
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

function selectWeatherDistrict(districtName: string) {
  if (selectedDistrict.value === districtName) {
    selectedDistrict.value = 'all'
  } else {
    selectedDistrict.value = districtName
  }
  activePlaceId.value = null
}

// 왼쪽 날씨 패널 탭 클릭 및 하단 필터 연동이 자연스럽게 맞물리도록 가드 구성
function selectDistrictFilter(districtName: string) {
  selectedDistrict.value = districtName
  activePlaceId.value = null
}

function selectCategoryFilter(categoryId: string) {
  selectedCategoryId.value = categoryId
  activePlaceId.value = null
}

async function handlePlaceSelect(placeId: string) {
  activePlaceId.value = placeId

  await nextTick()
  const element = placeElements.value[placeId]
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
}

function closeDetailCard() {
  activePlaceId.value = null
}

function getBaseDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  
  const checkTime = new Date(now.getTime() - 45 * 60 * 1000)
  const hours = String(checkTime.getHours()).padStart(2, '0')
  const minutes = '30'

  return {
    baseDate: `${year}${month}${date}`,
    baseTime: `${hours}${minutes}`
  }
}

function parseWeatherStatus(skyCode: number, ptyCode: number) {
  if (ptyCode > 0) {
    if (ptyCode === 1 || ptyCode === 4 || ptyCode === 5) {
      return { text: '비', code: 'rainy' }
    } else if (ptyCode === 2 || ptyCode === 6) {
      return { text: '진눈깨비', code: 'sleet' }
    } else if (ptyCode === 3 || ptyCode === 7) {
      return { text: '눈', code: 'snowy' }
    }
  }
  
  if (skyCode === 1) return { text: '맑음', code: 'sunny' }
  if (skyCode === 3) return { text: '구름많음', code: 'cloudy-sun' }
  if (skyCode === 4) return { text: '흐림', code: 'cloudy' }
  
  return { text: '정보없음', code: 'unknown' }
}

async function loadAllDistrictWeather() {
  isWeatherLoading.value = true
  
  const apiKey = import.meta.env.VITE_WEATHER_API_KEY
  const apiBaseUrl = import.meta.env.VITE_WEATHER_API_BASE_URL || 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0'
  
  if (!apiKey) {
    console.warn('.env 파일에 VITE_WEATHER_API_KEY가 등록되어 있지 않습니다.')
    isWeatherLoading.value = false
    return
  }

  const { baseDate, baseTime } = getBaseDateTime()
  const districtsToFetch = DISTRICTS.map(d => d.name)

  try {
    const weatherPromises = districtsToFetch.map(async (districtName) => {
      try {
        const coord = DISTRICTS_WEATHER_GRIDS?.[districtName]
        if (!coord) return null

        const url = `${apiBaseUrl}/getUltraSrtFcst?serviceKey=${apiKey}&numOfRows=60&pageNo=1&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${coord.nx}&ny=${coord.ny}`
        
        const response = await fetch(url)
        if (!response.ok) return null
        
        const json = await response.json()
        const items = json?.response?.body?.items?.item || []

        const forecastMap: Record<string, { T1H?: string; SKY?: string; PTY?: string }> = {}
        
        items.forEach((item: any) => {
          const fTime = item.fcstTime
          if (!forecastMap[fTime]) {
            forecastMap[fTime] = {}
          }
          if (item.category === 'T1H') forecastMap[fTime].T1H = item.fcstValue
          if (item.category === 'SKY') forecastMap[fTime].SKY = item.fcstValue
          if (item.category === 'PTY') forecastMap[fTime].PTY = item.fcstValue
        })

        const sortedTimes = Object.keys(forecastMap).sort()
        
        const hourlyForecasts: HourlyForecast[] = sortedTimes.map(fTime => {
          const data = forecastMap[fTime]
          const skyVal = parseInt(data.SKY || '1')
          const ptyVal = parseInt(data.PTY || '0')
          const { text, code } = parseWeatherStatus(skyVal, ptyVal)
          
          const formattedTime = `${fTime.slice(0, 2)}:${fTime.slice(2)}`

          return {
            time: formattedTime,
            temp: `${data.T1H || '-'}°C`,
            statusText: text,
            statusCode: code
          }
        })

        const currentForecast = hourlyForecasts[0] || { temp: '-', statusText: '정보없음', statusCode: 'unknown' }

        return {
          district: districtName,
          temp: currentForecast.temp,
          statusText: currentForecast.statusText,
          statusCode: currentForecast.statusCode,
          hourly: hourlyForecasts
        }
      } catch (singleErr) {
        console.error(`${districtName} 날씨 로드 실패:`, singleErr)
        return null
      }
    })

    const results = await Promise.all(weatherPromises)
    weatherList.value = results.filter((r): r is WeatherInfo => r !== null)
  } catch (err) {
    console.error('날씨 정보를 가져오는 중 에러 발생:', err)
  } finally {
    isWeatherLoading.value = false
  }
}

onMounted(() => {
  loadPlaces()
  loadAllDistrictWeather()
})
</script>

<template>
  <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
    <!-- 타이틀 및 로더 -->
    <div class="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
      <div>
        <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">지도</span>
        <h1 class="text-3xl font-black text-[#0F1F4B] mt-1">부산 관광 지도</h1>
      </div>
      
      <!-- 날씨 로딩 상태바 -->
      <div v-if="isWeatherLoading" class="text-xs text-[#8A94A6] flex items-center gap-1">
        <svg class="animate-spin h-4 w-4 text-[#FF4D2D]" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        실시간 날씨 로드 중...
      </div>
    </div>

    <!-- 부산 실시간 날씨 상황판 영역 -->
    <div v-if="weatherList.length > 0" class="mb-8 w-full">
      <!-- 타이틀 구역 -->
      <div 
        class="text-sm font-black text-[#0F1F4B] mb-3 flex items-center gap-1.5 px-1 select-none cursor-pointer"
        @click="selectedDistrict = 'all'"
      >
        <svg class="w-4 h-4 text-[#FF4D2D] stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
        <span v-if="selectedDistrict === 'all'">부산 실시간 날씨</span>
        <span v-else class="text-base text-[#FF4D2D] hover:underline underline-offset-4">{{ selectedDistrict }} 날씨</span>
      </div>
      
      <div>
        <!-- 상태 1: 아무 구도 선택하지 않았을 때 (전체 10개 구 나열, 카드 높이를 h-28로 높임) -->
        <div v-if="selectedDistrict === 'all'" class="grid grid-cols-5 sm:grid-cols-10 gap-2 w-full">
          <div 
            v-for="weather in weatherList" 
            :key="weather.district"
            @click="selectWeatherDistrict(weather.district)"
            class="flex flex-col items-center justify-between py-3 px-1 rounded-2xl border text-center transition select-none h-28 cursor-pointer bg-white border-[#E6D8C4]/60 text-[#0F1F4B] hover:border-[#FF4D2D]/50 hover:bg-[#F9F1E5]/10"
          >
            <span class="text-[11px] font-extrabold truncate w-full px-1">{{ weather.district }}</span>
            <div class="w-8 h-8 flex items-center justify-center my-1.5 shrink-0">
              <svg v-if="weather.statusCode === 'sunny'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              <svg v-else-if="weather.statusCode === 'cloudy-sun'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 2v2M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41M2 12h2M20 12h2" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 18.5a3 3 0 00-3-3h-1a4.5 4.5 0 00-9 0h-.5a3.5 3.5 0 000 7h13.5a3 3 0 000-6z" />
              </svg>
              <svg v-else-if="weather.statusCode === 'cloudy'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
              </svg>
              <svg v-else-if="weather.statusCode === 'rainy'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
                <path stroke-linecap="round" d="M9 20l-1 2M12 20l-1 2M15 20l-1 2" />
              </svg>
              <svg v-else-if="weather.statusCode === 'snowy'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
                <path stroke-linecap="round" d="M8 21h.01M12 21h.01M16 21h.01" />
              </svg>
              <svg v-else-if="weather.statusCode === 'sleet'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
                <path stroke-linecap="round" d="M8 21l-1 1M12 21h.01M16 21l-1 1" />
              </svg>
              <svg v-else class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path stroke-linecap="round" d="M12 16h.01M12 8a2 2 0 012 2c0 2-3 3-3 3" />
              </svg>
            </div>
            <span class="text-[11px] font-bold text-[#4F5B72]">{{ weather.temp }}</span>
          </div>
        </div>

        <!-- 상태 2: 특정 구를 클릭했을 때 (앞의 현재 카드를 제외하고 시간대별 예보 카드 6개만 정렬, 카드 높이를 h-28로 높임) -->
        <div v-else-if="activeDistrictWeather" class="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
          <div 
            v-for="fcst in activeDistrictWeather.hourly" 
            :key="fcst.time"
            class="flex flex-col items-center justify-between py-3 px-1 rounded-2xl border text-center select-none h-28 bg-white border-[#E6D8C4]/60 text-[#0F1F4B]"
          >
            <span class="text-xs text-[#8A94A6] font-bold">{{ fcst.time }}</span>
            <div class="w-8 h-8 text-[#4F5B72] my-1 shrink-0">
              <svg v-if="fcst.statusCode === 'sunny'" class="w-full h-full stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path stroke-linecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2" />
              </svg>
              <svg v-else-if="fcst.statusCode === 'cloudy-sun'" class="w-full h-full stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10a4 4 0 00-4 4h8a4 4 0 00-4-4z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 18.5a3 3 0 00-3-3h-1a4.5 4.5 0 00-9 0h-.5a3.5 3.5 0 000 7h13.5a3 3 0 000-6z" />
              </svg>
              <svg v-else-if="fcst.statusCode === 'cloudy'" class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
              </svg>
              <svg v-else-if="fcst.statusCode === 'rainy'" class="w-full h-full stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
                <path stroke-linecap="round" d="M9 20l-1 2M12 20l-1 2M15 20l-1 2" />
              </svg>
              <svg v-else-if="fcst.statusCode === 'snowy'" class="w-full h-full stroke-current stroke-[2] fill-none" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 15a4 4 0 014-4h.5a5 5 0 019.5 0h.5a4 4 0 014 4v1a4 4 0 01-4 4H7a4 4 0 01-4-4v-1z" />
                <path stroke-linecap="round" d="M8 21h.01M12 21h.01M16 21h.01" />
              </svg>
              <svg v-else class="w-full h-full stroke-current stroke-[2.2] fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path stroke-linecap="round" d="M12 16h.01M12 8a2 2 0 012 2c0 2-3 3-3 3" />
              </svg>
            </div>
            <span class="text-[11px] font-bold text-[#0F1F4B]">{{ fcst.temp }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 컨트롤 영역 -->
    <div class="flex flex-col gap-5 mb-8 bg-white p-6 rounded-[24px] border border-[#E6D8C4] shadow-sm">
      
      <!-- 지역구별 필터 -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-bold text-[#4F5B72] mr-3 shrink-0">지역구별</span>
        
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

      <div class="border-t border-[#F4E7D3]/60"></div>

      <!-- 카테고리별 필터 -->
      <div class="flex flex-wrap gap-2 items-center">
        <span class="text-xs font-bold text-[#4F5B72] mr-3 shrink-0">카테고리별</span>
        
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
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
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
            v-else
            v-for="place in filteredPlaces"
            :key="place.id"
            :ref="(el) => { if (el) placeElements[place.id] = el as HTMLElement }"
            @click="handlePlaceSelect(place.id)"
            :class="[
              'p-4 rounded-2xl border transition cursor-pointer flex gap-4 items-center',
              activePlaceId === place.id 
                ? 'border-[#FF4D2D] bg-[#FF4D2D]/5 shadow-sm' 
                : 'border-[#E6D8C4]/60 hover:border-[#0F1F4B]/50 bg-white'
            ]"
          >
            <!-- 리스트 항목 아이콘 -->
            <div 
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm border border-white/20',
                getCategoryColorClass(place.category)
              ]"
            >
              <svg 
                class="w-5 h-5 fill-none stroke-current stroke-[2.3]" 
                viewBox="0 0 24 24"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path :d="getCategorySvgPath(place.category)" />
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
        <button 
          @click="closeDetailCard" 
          class="absolute top-4 right-4 text-[#8A94A6] hover:text-[#0F1F4B] transition p-1"
          aria-label="닫기"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="w-28 h-28 rounded-2xl overflow-hidden shrink-0 bg-[#F9F1E5] border border-[#E6D8C4]/40">
          <img 
            :src="getImageUrl(activePlace.image)"
            :alt="activePlace.name"
            class="w-full h-full object-cover"
          />
        </div>

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

          <div class="mt-2.5 pl-5.5">
            <a 
              :href="`https://map.naver.com/v5/search/${encodeURIComponent(activePlace.name)}`" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-xs font-bold text-[#FF4D2D] hover:text-[#E03D1E] transition-colors underline underline-offset-4"
            >
              <span>네이버 지도에서 위치 보기</span>
              <svg class="h-3 w-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
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