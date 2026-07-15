<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number
  max?: number
}>()

const fullStars = computed(() => Array.from({ length: Math.round(props.value) }, (_, i) => i))
</script>

<template>
  <div class="flex items-center gap-1 text-[#FF4D2D]">
    <span v-for="star in fullStars" :key="star" class="text-lg">★</span>
    <span v-if="props.value % 1 !== 0" class="text-lg">☆</span>
  </div>
</template>
