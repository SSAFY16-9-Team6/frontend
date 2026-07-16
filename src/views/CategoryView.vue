<script setup lang="ts">
import PlaceCard from '../components/PlaceCard.vue'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-6">
    <h2 class="mb-4 text-2xl font-semibold text-[#0F1F4B]">카테고리별 둘러보기</h2>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <PlaceCard v-for="place in PLACES" :key="place.id" :place="place" />
    </div>
  </section>
</template>
