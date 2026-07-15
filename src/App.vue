<!-- src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import HomeView from './views/HomeView.vue'
import TourismView from './views/TourismView.vue'
import MapView from './views/MapView.vue' // 1. MapView 컴포넌트 임포트하기

const currentTab = ref('home')

function onChangeTab(tab: string) {
  currentTab.value = tab
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F1E5]">
    <!-- 네비게이션 바 -->
    <Navbar @change-tab="onChangeTab" />
    
    <!-- 탭 선택에 따른 조건부 렌더링 영역 -->
    <HomeView v-if="currentTab === 'home'" />
    <TourismView v-else-if="currentTab === 'tourism'" />
    
    <!-- 2. 'map' 탭이 선택되었을 때 지도 뷰 보여주기 -->
    <MapView v-else-if="currentTab === 'map'" />
    
    <!-- 그 외 준비 중인 페이지 처리 -->
    <div v-else class="px-6 py-10 text-center text-[#4F5B72]">
      {{ currentTab }} 페이지는 준비 중입니다.
    </div>
  </div>
</template>