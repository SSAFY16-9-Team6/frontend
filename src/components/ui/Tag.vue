<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="inline-flex rounded-full bg-[#F4E7D3] px-3 py-1 text-xs font-semibold text-[#0F1F4B]">{{ label }}</span>
</template>
