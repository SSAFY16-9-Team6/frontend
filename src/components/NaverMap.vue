<!-- src/components/NaverMap.vue -->
<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { CATEGORIES } from '../data/constants' // 1. 상수 데이터 임포트
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

// Tailwind 'bg-[color]' 유틸리티에서 실제 Hex(헥사) 코드 값을 추출하는 헬퍼 함수
function getMarkerHexColor(categoryName: string): string {
  const matched = CATEGORIES.find(cat => cat.name === categoryName)
  if (!matched) return '#0F1F4B' // 매칭 안 될 시 기본값 Deep Navy

  // matched.color 형태는 'bg-[#FF4D2D]' 혹은 'bg-[#0BA09B]' 구조입니다.
  // 문자열 파싱을 통해 헥사 컬러 코드(#FF4D2D 등)만 정확하게 추출합니다.
  const hexMatch = matched.color.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/)
  return hexMatch ? hexMatch[0] : '#0F1F4B'
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

    // 2. CATEGORIES 데이터에서 동적으로 색상 정보 해독하여 마커 컬러 적용
    const markerColor = getMarkerHexColor(place.category)

    const markerHtml = `
      <div style="position: relative; width: 32px; height: 32px; cursor: pointer;">
        <div style="
          position: absolute;
          width: 32px;
          height: 32px;
          background-color: ${markerColor};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: -2px 2px 4px rgba(0,0,0,0.3);
          border: 2px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          top: -16px;
          left: -16px;
        ">
          <div style="
            width: 10px;
            height: 10px;
            background-color: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      </div>
    `

    const marker = new naver.maps.Marker({
      position,
      map: mapInstance,
      icon: {
        content: markerHtml,
        anchor: new naver.maps.Point(0, 16) 
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

watch(() => props.places, () => {
  renderMarkers()
}, { deep: true })

watch(() => props.activeId, (newId) => {
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