<!-- PageHeader.vue -->

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  description: string
}>()
</script>

<template>
  <section class="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-sand-cream)]/80 p-8 shadow-sm">
    <p v-if="eyebrow" class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-coral)]">
      {{ eyebrow }}
    </p>
    <h2 class="mb-3 text-3xl font-black text-[var(--color-deep-navy)] sm:text-4xl">
      {{ title }}
    </h2>
    <p class="max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">
      {{ description }}
    </p>
  </section>
</template>