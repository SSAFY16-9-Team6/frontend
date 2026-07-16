<!-- src/components/Navbar.vue -->
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isOpen = ref(false)

const currentTab = computed(() => {
    if (route.path === '/') return 'home'
    if (route.path.startsWith('/tourism')) return 'tourism'
    if (route.path.startsWith('/map')) return 'map'
    if (route.path.startsWith('/board')) return 'board'
    if (route.path.startsWith('/stats')) return 'stats'
    return 'home'
})

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
    emit('change-tab', tab)
    isOpen.value = false
}

function toggleMenu() {
    isOpen.value = !isOpen.value
}
</script>

<template>
    <nav class="sticky top-0 z-50 bg-white px-6 py-3.5 shadow-sm">
        <div class="relative flex items-center justify-between">
            <!-- 로고 -->
            <div class="flex items-center gap-2 cursor-pointer" @click="selectTab('tourism')">
                <div
                    class="w-8 h-8 rounded-full bg-[#0F1F4B] flex items-center justify-center text-white font-black text-sm"
                >
                    부
                </div>
                <span class="text-lg font-black tracking-tight text-[#0F1F4B]">
                    부산로컬<span class="text-[#FF4D2D]">.</span>
                </span>
            </div>

            <!-- 모바일 햄버거 버튼 -->
            <button
                type="button"
                class="inline-flex items-center justify-center rounded-md p-2 text-[#4F5B72] hover:bg-[#F4E7D3]/60 md:hidden"
                @click="toggleMenu"
            >
                <span class="sr-only">메뉴 열기</span>
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            <!-- 데스크탑 네비게이션 -->
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

            <!-- floating 모바일 메뉴 -->
            <div
                v-if="isOpen"
                class="absolute right-0 top-full mt-2 w-[min(240px,calc(100vw-2rem))] rounded-2xl border border-[#E6D8C4] bg-white p-3 shadow-xl md:hidden"
            >
                <button
                    v-for="tab in tabs"
                    :key="tab.key"
                    type="button"
                    class="block w-full rounded-xl px-4 py-2 text-left text-sm font-semibold text-[#4F5B72] hover:bg-[#F4E7D3]/60"
                    @click="selectTab(tab.key)"
                >
                    {{ tab.label }}
                </button>
            </div>
        </div>
    </nav>
</template>