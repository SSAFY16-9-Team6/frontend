<script setup lang="ts">
import PlaceCard from '../components/PlaceCard.vue'
import Chatbot from '../components/Chatbot.vue'
import { FEATURED_PLACES, EVENTS } from '../data/mockData'
</script>

<template>
  <div class="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
    <section class="rounded-[32px] border border-[#E6D8C4] bg-[#F4E7D3] p-8">
      <h1 class="text-4xl font-semibold tracking-tight text-[#0F1F4B]">부산을 더 깊이 즐기세요</h1>
      <p class="mt-3 max-w-2xl text-base leading-7 text-[#4F5B72]">맛집, 문화, 자연까지 한눈에 볼 수 있는 여행 정보 플랫폼입니다.</p>
    </section>
    <section class="grid gap-4 lg:grid-cols-[2fr_1fr]">
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-[#0F1F4B]">추천 장소</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <PlaceCard v-for="place in FEATURED_PLACES" :key="place.id" :place="place" />
        </div>
      </div>
      <div class="space-y-4">
        <h2 class="text-2xl font-semibold text-[#0F1F4B]">이벤트</h2>
        <div class="space-y-3">
          <div v-for="event in EVENTS" :key="event.id" class="rounded-[20px] border border-[#E6D8C4] bg-white p-4">
            <div class="text-sm font-semibold text-[#FF4D2D]">{{ event.date }}</div>
            <div class="mt-1 text-base font-medium text-[#0F1F4B]">{{ event.title }}</div>
          </div>
        </div>
        <Chatbot />
      </div>
    </section>
  </div>
</template>