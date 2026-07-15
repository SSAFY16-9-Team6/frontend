<script setup lang="ts">
import { ref } from 'vue'

const currentTab = ref('home')

const tabs = [
  { key: 'home', label: '홈' },
  { key: 'tourism', label: '관광정보' },
  { key: 'map', label: '지도' },
  { key: 'board', label: '게시판' },
  { key: 'stats', label: '통계' },
]

const emit = defineEmits<{
  (e: 'change-tab', tab: string): void
}>()

function selectTab(tab: string) {
  currentTab.value = tab
  emit('change-tab', tab)
}
</script>

<template>
  <nav class="flex items-center justify-between rounded-full border border-[#E6D8C4] bg-white px-6 py-3.5 shadow-sm">
    <!-- 로고 -->
    <div class="flex items-center gap-2 cursor-pointer" @click="selectTab('tourism')">
      <div class="w-8 h-8 rounded-full bg-[#0F1F4B] flex items-center justify-center text-white font-black text-sm">
        부
      </div>
      <span class="text-lg font-black tracking-tight text-[#0F1F4B]">부산로컬<span class="text-[#FF4D2D]">.</span></span>
    </div>

    <!-- 네비게이션 링크 -->
    <div class="hidden md:flex gap-2 text-sm font-semibold text-[#4F5B72]">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="rounded-full px-5 py-2 transition"
        :class="currentTab === tab.key ? 'bg-[#0F1F4B] text-white' : 'hover:bg-[#F4E7D3]/60 text-[#4F5B72]'"
        @click="selectTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>
  </nav>
</template>