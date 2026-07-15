<script setup lang="ts">
import StarRating from './ui/StarRating.vue'
import Tag from './ui/Tag.vue'
import type { Place } from '../types'

defineProps<{
  place: Place
}>()
</script>

<template>
  <article class="rounded-[24px] border border-[#E6D8C4] bg-white p-5 shadow-sm">
    <div class="mb-4 h-32 rounded-[16px] bg-cover bg-center" :style="{ backgroundImage: `url(https://images.unsplash.com/${place.image}?auto=format&fit=crop&w=900&q=80)` }"></div>
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-lg font-semibold text-[#0F1F4B]">{{ place.name }}</h3>
      <Tag :label="place.region" />
    </div>
    <p class="mt-2 text-sm leading-6 text-[#4F5B72]">{{ place.description }}</p>
    <div class="mt-4 flex items-center justify-between">
      <StarRating :value="place.rating" />
      <span class="text-sm font-medium text-[#0BA09B]">{{ place.category }}</span>
    </div>
  </article>
</template>
