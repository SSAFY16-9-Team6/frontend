<!-- InfoCard.vue -->

<script setup lang="ts">
defineProps<{
  title: string
  description: string
  tag?: string
}>()
</script>

<template>
  <article class="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-6 shadow-sm backdrop-blur">
    <p class="mb-3 inline-flex rounded-full bg-[var(--color-sand-cream)] px-3 py-1 text-xs font-semibold text-[var(--color-mint)]">
      {{ tag || '공통 컴포넌트' }}
    </p>
    <h3 class="mb-2 text-xl font-semibold text-[var(--color-deep-navy)]">{{ title }}</h3>
    <p class="leading-7 text-[var(--color-text-secondary)]">{{ description }}</p>
  </article>
</template>