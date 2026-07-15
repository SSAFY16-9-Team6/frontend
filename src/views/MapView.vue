<script setup lang="ts">
import { PLACES } from '../data/mockData'
import PlaceCard from '../components/PlaceCard.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-6">
    <h2 class="mb-4 text-2xl font-semibold text-[#0F1F4B]">지도 보기</h2>
    <div class="rounded-[24px] border border-[#E6D8C4] bg-white p-8 text-center text-[#4F5B72]">
      부산 지도 기반 탐색 화면입니다.
    </div>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <PlaceCard v-for="place in PLACES" :key="place.id" :place="place" />
    </div>
  </section>
</template>
