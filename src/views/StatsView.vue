<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES, DISTRICTS } from '../data/constants.ts'

const isMounted = ref(false)
const router = useRouter()

const categoryTotals = ref<Record<string, number>>({})
const statsError = ref('')
const isStatsLoading = ref(false)

const fetchCategoryStats = async () => {
    isStatsLoading.value = true
    statsError.value = ''

    try {
        const response = await fetch(
            'https://backend-xxf5.onrender.com/api/v1/stats/posts-by-category',
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            },
        )

        if (!response.ok) {
            throw new Error(`통계 조회 실패 (${response.status})`)
        }

        const result = await response.json()

        if (!result?.success || !Array.isArray(result.data)) {
            throw new Error('통계 응답 형식이 올바르지 않습니다.')
        }

        categoryTotals.value = result.data.reduce((acc: Record<string, number>, item: any) => {
            acc[String(item.categoryId)] = item.total ?? 0
            return acc
        }, {})
    } catch (error) {
        console.error('카테고리별 게시글 통계 로드 실패:', error)
        statsError.value =
            error instanceof Error
                ? error.message
                : '통계 데이터를 불러오지 못했습니다.'
    } finally {
        isStatsLoading.value = false
    }
}

onMounted(() => {
    isMounted.value = true
    fetchCategoryStats()
})

const mappedCategoryData = computed(() => {
    return CATEGORIES.map((category) => {
        let hexColor = '#0F1F4B'
        if (category.color) {
            const matchHex = category.color.match(/#([A-Fa-f0-9]{6})/)
            if (matchHex) hexColor = `#${matchHex[1]}`
        }

        return {
            id: category.id,
            name: category.name,
            count: categoryTotals.value[category.id] ?? 0,
            color: hexColor,
        }
    })
})

const totalCount = computed(() => {
    return mappedCategoryData.value.reduce((acc, cur) => acc + cur.count, 0)
})

const donutSegments = computed(() => {
    let accumulatedPercent = 0
    const circumference = 2 * Math.PI * 40

    return mappedCategoryData.value.map((item) => {
        const total = Math.max(totalCount.value, 1)
        const percent = (item.count / total) * 100

        const gap = 1.5
        const strokeLength = Math.max((percent / 100) * circumference - gap, 0)
        const strokeOffset = (accumulatedPercent / 100) * circumference

        accumulatedPercent += percent

        return {
            ...item,
            percent: parseFloat(percent.toFixed(1)),
            strokeDashArray: `${strokeLength} ${circumference - strokeLength}`,
            strokeDashOffset: -strokeOffset,
        }
    })
})

const topThreeCategories = computed(() => {
    return [...mappedCategoryData.value].sort((a, b) => b.count - a.count).slice(0, 2)
})

const maxCategoryCount = computed(() => {
    const counts = mappedCategoryData.value.map((c) => c.count)
    return Math.max(...counts, 1)
})

const yAxisValues = computed(() => {
    const top = maxCategoryCount.value
    return [top, Math.ceil(top / 2), 0]
})
</script>

<template>
    <section class="mx-auto max-w-7xl px-6 py-8">
        <div class="mx-auto max-w-5xl">
            <div class="mb-10">
                <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">데이터</span>
                <h1 class="font-heading text-2xl sm:text-3xl font-bold text-[#0F1F4B] mt-1">
                    부산 여행 통계 대시보드
                </h1>
            </div>

            <div v-if="isStatsLoading" class="rounded-[24px] bg-white p-10 border border-[#F5F0E6] text-center text-[#4F5B72]">
                통계 데이터를 불러오는 중입니다...
            </div>

            <div v-else-if="statsError" class="rounded-[24px] bg-white p-10 border border-[#F5F0E6] text-center text-[#FF4D2D]">
                {{ statsError }}
            </div>

            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="rounded-[24px] bg-white p-8 border border-[#F5F0E6] shadow-sm flex flex-col justify-between gap-6">
                    <div>
                        <h3 class="text-lg font-bold text-[#0F1F4B]">카테고리별 명소 분포</h3>
                        <div class="my-6 flex flex-col sm:flex-row items-center justify-center gap-8">
                            <div class="relative w-44 h-44 flex-shrink-0">
                                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        stroke="#FAF9F6"
                                        stroke-width="12"
                                    />
                                    <circle
                                        v-for="(segment, index) in donutSegments"
                                        :key="'donut-' + index"
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="transparent"
                                        :stroke="segment.color"
                                        stroke-width="12"
                                        :stroke-dasharray="segment.strokeDashArray"
                                        :stroke-dashoffset="segment.strokeDashOffset"
                                        stroke-linecap="butt"
                                        class="donut-segment transition-all duration-1000 ease-out"
                                        :class="{ 'animate-load': isMounted }"
                                    />
                                </svg>
                                <div class="absolute inset-0 flex flex-col items-center justify-center">
                                    <span class="text-2xl font-bold text-[#0F1F4B]">{{ totalCount }}</span>
                                    <span class="text-[10px] text-[#8A866F] uppercase tracking-wider">총 게시글</span>
                                </div>
                            </div>

                            <div class="flex-1 w-full space-y-3.5">
                                <div
                                    v-for="item in donutSegments"
                                    :key="item.id"
                                    class="flex items-center justify-between border-b border-[#F9F8F6] pb-2"
                                >
                                    <div class="flex items-center gap-2.5">
                                        <span
                                            class="h-3 w-3 rounded-full"
                                            :style="{ backgroundColor: item.color }"
                                        ></span>
                                        <span class="text-sm font-medium text-[#4F5B72]">{{ item.name }}</span>
                                    </div>
                                    <span class="text-xs text-[#8A866F] font-bold">{{ item.percent }}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        v-if="topThreeCategories.length >= 2"
                        class="rounded-xl bg-[#FAF9F6] p-4 text-xs text-[#8A866F] leading-relaxed"
                    >
                        분석 결과 현재 여행 정보 데이터베이스는
                        <strong :style="{ color: topThreeCategories[0].color }">{{ topThreeCategories[0].name }}</strong>,
                        <strong :style="{ color: topThreeCategories[1].color }">
                            {{ topThreeCategories[1].name }}
                        </strong>
                        카테고리가 주류를 형성하고 있습니다.
                    </div>
                </div>

                <div class="rounded-[24px] bg-white p-8 border border-[#F5F0E6] shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-bold text-[#0F1F4B]">카테고리별 게시글 현황</h3>
                        <p class="text-xs text-[#8A866F] mt-0.5">CATEGORIES별 게시글 수</p>
                    </div>

                    <div class="my-8 flex gap-4">
                        <div class="flex flex-col justify-between text-xs text-[#8A866F]">
                            <span>{{ yAxisValues[0] }}</span>
                            <span>{{ yAxisValues[1] }}</span>
                            <span>{{ yAxisValues[2] }}</span>
                        </div>
                        <div class="flex-1 flex items-end justify-around h-64 border-b border-[#F5F0E6] pb-2 px-2 gap-2">
                            <div
                                v-for="item in mappedCategoryData"
                                :key="item.id"
                                class="flex flex-col items-center flex-1 h-full group"
                            >
                                <span
                                    class="text-xs font-bold text-[#0F1F4B] mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                >
                                    {{ item.count }}개
                                </span>
                                <div class="w-full max-w-[32px] h-full bg-[#FAF9F6] rounded-t-lg overflow-hidden border border-[#F5F0E6] flex items-end">
                                    <div
                                        class="w-full rounded-t-md transition-all duration-1000 ease-out origin-bottom"
                                        :style="{
                                            height: isMounted ? `${(item.count / maxCategoryCount) * 100}%` : '0%',
                                            backgroundColor: item.color,
                                        }"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-around px-2 gap-2 text-center">
                        <div
                            v-for="item in mappedCategoryData"
                            :key="item.id"
                            class="flex-1 flex flex-col items-center gap-1 min-w-0"
                        >
                            <span class="h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: item.color }"></span>
                            <span class="text-[11px] font-bold text-[#4F5B72] truncate w-full">{{ item.name }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.donut-segment {
    transition: stroke-dasharray 1s ease-out;
}
.animate-load {
    animation: dash-draw 1.5s ease-out forwards;
}

@keyframes dash-draw {
    from {
        stroke-dasharray: 0 251.32;
    }
}
</style>