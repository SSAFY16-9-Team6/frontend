<script setup lang="ts">
import type { Place } from '../types'

defineProps<{
  place: Place
}>()
</script>

<template>
  <article class="overflow-hidden rounded-[24px] border border-[#E6D8C4] bg-white shadow-[0_10px_30px_rgba(15,31,75,0.08)]">
    <div class="h-36 bg-cover bg-center" :style="{ backgroundImage: `url(https://images.unsplash.com/${place.image}?auto=format&fit=crop&w=900&q=80)` }"></div>
    <div class="p-4">
      <h3 class="text-lg font-semibold text-[#0F1F4B]">{{ place.name }}</h3>
      <p class="mt-2 text-sm leading-6 text-[#4F5B72]">{{ place.address }}</p>
    </div>
  </article>
</template>