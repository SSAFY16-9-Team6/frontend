<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import HomeView from './views/HomeView.vue'
import TourismView from './views/TourismView.vue'

const currentTab = ref('home')

function onChangeTab(tab: string) {
  currentTab.value = tab
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F1E5]">
    <Navbar @change-tab="onChangeTab" />
    <HomeView v-if="currentTab === 'home'" />
    <TourismView v-else-if="currentTab === 'tourism'" />
    <div v-else class="px-6 py-10 text-center text-[#4F5B72]">
      {{ currentTab }} 페이지는 준비 중입니다.
    </div>
  </div>
</template>