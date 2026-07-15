<!-- src/components/NaverMap.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { CATEGORIES } from '../data/constants'
import type { Place } from '../types'

const props = defineProps<{
  places: Place[]
  activeId: string | null
}>()

const emit = defineEmits<{
  (e: 'marker-click', id: string): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
let mapInstance: any = null
let markers: { id: string; marker: any }[] = []
const isLoaded = ref(false)

// 카테고리 이름에 맞는 고유 색상 추출 헬퍼 함수
function getMarkerHexColor(categoryName: string): string {
  const matched = CATEGORIES.find(cat => cat.name === categoryName)
  if (!matched) return '#0F1F4B'

  const hexMatch = matched.color.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)
  return hexMatch ? hexMatch[0] : '#0F1F4B'
}

// 각 카테고리 이름에 맞는 미니멀 SVG 패스 추출 헬퍼 함수
function getCategorySvgPath(categoryName: string): string {
  const matched = CATEGORIES.find(cat => cat.name === categoryName)
  const categoryId = matched ? matched.id : '12'

  // 가시성이 우수한 미니멀 단색 SVG 패스 정보 (viewBox 0 0 24 24 기준)
  if (categoryId === '12') { // 관광지 (카메라)
    return 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'
  } else if (categoryId === '14') { // 문화시설 (책)
    return 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z'
  } else if (categoryId === '15') { // 축제공연행사 (음표)
    return 'M9 18V5l12-2v13 M9 10l12-2 M9 21a3 3 0 1 1-6-0 3 3 0 0 1 6 0z M21 19a3 3 0 1 1-6-0 3 3 0 0 1 6 0z'
  } else if (categoryId === '25') { // 여행코스 (나침반)
    return 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z'
  } else if (categoryId === '28') { // 레포츠 (자전거)
    return 'M5.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M18.5 17.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2z M12 15h3.5L18 10H12 M12 15L9 9H5'
  } else if (categoryId === '32') { // 숙박 (빌딩)
    return 'M4 22V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v18 M6 6h2 M6 10h2 M6 14h2 M16 6h2 M16 10h2 M16 14h2 M11 6h2 M11 10h2 M11 14h2 M11 18h2'
  } else if (categoryId === '38') { // 쇼핑 (쇼핑백)
    return 'M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0'
  } else { // 음식점 등 기타 카테고리 (수저/포크)
    return 'M18 8V2M14 8V2M22 8V2c0 2.4-1.2 4-4 4v16M3 2v7c0 3.3 2.7 6 6 6v7M9 15v7'
  }
}

onMounted(async () => {
  if (
    typeof window !== 'undefined' && 
    (window as any).naver && 
    (window as any).naver.maps && 
    (window as any).naver.maps.Map
  ) {
    isLoaded.value = true
    initMap()
    return
  }

  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID
  if (!clientId) {
    console.error('.env 파일에 VITE_NAVER_MAP_CLIENT_ID가 설정되어 있는지 확인해 주세요.')
    return
  }

  try {
    await loadNaverScript(clientId)
    waitForNaverReady()
  } catch (error) {
    console.error('네이버 지도 API 스크립트 로드 중 에러 발생:', error)
  }
})

function loadNaverScript(clientId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existingScript = document.getElementById('naver-map-script')
    if (existingScript) {
      resolve()
      return
    }

    const callbackName = 'initNaverMapCallback_' + Date.now();
    (window as any)[callbackName] = () => {
      resolve()
      try {
        delete (window as any)[callbackName]
      } catch (e) {}
    }

    const script = document.createElement('script')
    script.id = 'naver-map-script'
    script.type = 'text/javascript'
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&callback=${callbackName}`
    script.async = true
    script.defer = true
    
    script.onerror = (err) => {
      reject(err)
    }

    document.head.appendChild(script)
  })
}

function waitForNaverReady() {
  const checkInterval = setInterval(() => {
    const naver = (window as any).naver
    if (naver && naver.maps && naver.maps.Map && naver.maps.LatLng) {
      clearInterval(checkInterval)
      isLoaded.value = true
      initMap()
    }
  }, 50)

  setTimeout(() => {
    clearInterval(checkInterval)
  }, 5000)
}

onBeforeUnmount(() => {
  clearMarkers()
})

function initMap() {
  if (!mapContainer.value) return

  try {
    const naver = (window as any).naver

    const mapOptions = {
      center: new naver.maps.LatLng(35.1587, 129.1604),
      zoom: 11,
      zoomControl: true,
      zoomControlOptions: {
        position: naver.maps.Position.TOP_RIGHT
      }
    }

    mapInstance = new naver.maps.Map(mapContainer.value, mapOptions)

    setTimeout(() => {
      if (mapInstance && mapContainer.value) {
        naver.maps.Event.trigger(mapInstance, 'resize')
        renderMarkers()
      }
    }, 150)

  } catch (error) {
    console.error('네이버 지도 초기화 실패:', error)
  }
}

function clearMarkers() {
  if (!(window as any).naver) return
  markers.forEach(({ marker }) => {
    (window as any).naver.maps.Event.clearInstanceListeners(marker)
    marker.setMap(null)
  })
  markers = []
}

// 마커 HTML 생성을 전담하는 헬퍼 함수
function createMarkerHtml(place: Place, isActive: boolean): string {
  const markerColor = getMarkerHexColor(place.category)
  const svgPath = getCategorySvgPath(place.category)
  
  // 크기를 키우고 테두리에 그림자 효과를 입혀 시인성 및 가시성을 높임
  const markerSize = isActive ? 42 : 34
  const borderThickness = isActive ? 3 : 2
  const borderColor = isActive ? '#FF4D2D' : '#FFFFFF'
  const svgSize = isActive ? 20 : 16

  return `
    <div style="
      width: ${markerSize}px;
      height: ${markerSize}px;
      background-color: ${markerColor};
      border: ${borderThickness}px solid ${borderColor};
      border-radius: 50%;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
    ">
      <svg 
        style="width: ${svgSize}px; height: ${svgSize}px; fill: none; stroke: #ffffff; stroke-width: 2.3; stroke-linecap: round; stroke-linejoin: round;" 
        viewBox="0 0 24 24"
      >
        <path d="${svgPath}" />
      </svg>
    </div>
  `
}

function renderMarkers() {
  const naver = (window as any).naver
  if (!mapInstance || !naver) return
  
  clearMarkers()

  if (props.places.length === 0) return

  const bounds = new naver.maps.LatLngBounds()

  props.places.forEach(place => {
    const lng = parseFloat(place.mapx)
    const lat = parseFloat(place.mapy)

    if (isNaN(lat) || isNaN(lng)) return

    const position = new naver.maps.LatLng(lat, lng)
    bounds.extend(position)

    const isActive = props.activeId === place.id
    const markerHtml = createMarkerHtml(place, isActive)

    const marker = new naver.maps.Marker({
      position,
      map: mapInstance,
      icon: {
        content: markerHtml,
        anchor: new naver.maps.Point(0, 0) // 중앙 배치
      },
      title: place.name
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      emit('marker-click', place.id)
    })

    markers.push({ id: place.id, marker })
  })

  if (markers.length > 0) {
    mapInstance.fitBounds(bounds, {
      top: 60,
      right: 60,
      bottom: 60,
      left: 60
    })
  }
}

// 핀들의 실시간 활성화 상태 변화 대응 
function updateMarkerStyles() {
  const naver = (window as any).naver
  if (!mapInstance || !naver) return

  markers.forEach(({ id, marker }) => {
    const place = props.places.find(p => p.id === id)
    if (!place) return

    const isActive = props.activeId === id
    const markerHtml = createMarkerHtml(place, isActive)

    marker.setIcon({
      content: markerHtml,
      anchor: new naver.maps.Point(0, 0)
    })
  })
}

watch(() => props.places, () => {
  renderMarkers()
}, { deep: true })

watch(() => props.activeId, (newId) => {
  updateMarkerStyles()

  if (!newId || !mapInstance || !(window as any).naver) return
  const target = markers.find(m => m.id === newId)
  if (target) {
    const targetPosition = target.marker.getPosition()
    mapInstance.panTo(targetPosition, { duration: 300 })
  }
})
</script>

<template>
  <div class="w-full h-full min-h-[500px] relative">
    <div ref="mapContainer" class="w-full h-full absolute inset-0" style="background-color: #F9F1E5;"></div>

    <div 
      v-if="!isLoaded" 
      class="absolute inset-0 bg-[#F9F1E5] z-10 flex flex-col items-center justify-center gap-3"
    >
      <svg class="animate-spin h-7 w-7 text-[#FF4D2D]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-[#4F5B72] text-sm font-bold">네이버 지도를 로드하는 중...</span>
    </div>
  </div>
</template>