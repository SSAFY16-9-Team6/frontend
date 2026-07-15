<script setup lang="ts">
import { regionStats, monthlyTrend, categoryDist } from '../data/statsData'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-6">
    <h2 class="mb-4 text-2xl font-semibold text-[#0F1F4B]">통계 대시보드</h2>
    <div class="grid gap-4 md:grid-cols-3">
      <div v-for="item in regionStats" :key="item.region" class="rounded-[20px] border border-[#E6D8C4] bg-white p-5">
        <div class="text-sm text-[#4F5B72]">{{ item.region }}</div>
        <div class="mt-2 text-2xl font-black text-[#0F1F4B]">{{ item.value }}</div>
      </div>
    </div>
    <div class="mt-4 rounded-[20px] border border-[#E6D8C4] bg-white p-5">
      <div class="text-lg font-semibold text-[#0F1F4B]">월별 트렌드</div>
      <div class="mt-3 flex items-end gap-3">
        <div v-for="item in monthlyTrend" :key="item.month" class="flex-1 rounded-t-[12px] bg-[#0BA09B] p-3 text-center text-sm text-white">{{ item.value }}</div>
      </div>
    </div>
    <div class="mt-4 rounded-[20px] border border-[#E6D8C4] bg-white p-5">
      <div class="text-lg font-semibold text-[#0F1F4B]">카테고리 분포</div>
      <ul class="mt-3 space-y-2 text-sm text-[#4F5B72]">
        <li v-for="item in categoryDist" :key="item.name">{{ item.name }}: {{ item.value }}</li>
      </ul>
    </div>
  </section>
</template>
