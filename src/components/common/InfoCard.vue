<!-- InfoCard.vue -->

<script setup lang="ts">
import Tag from '../ui/Tag.vue'

defineProps<{
  title: string
  description: string
  tag?: string
}>()
</script>

<template>
  <article class="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-6 shadow-sm backdrop-blur">
    <div class="mb-3">
      <Tag :label="tag || '공통 컴포넌트'" />
    </div>
    <h3 class="mb-2 text-xl font-semibold text-[var(--color-deep-navy)]">{{ title }}</h3>
    <p class="leading-7 text-[var(--color-text-secondary)]">{{ description }}</p>
  </article>
</template>