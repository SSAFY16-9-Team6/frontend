<!-- AppButton.vue -->

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ tone?: 'navy' | 'coral' | 'mint' | 'sand' }>(),
  { tone: 'navy' }
)

const toneClasses: Record<string, string> = {
  navy: 'bg-[var(--color-deep-navy)] text-white border-[var(--color-deep-navy)]',
  coral: 'bg-[var(--color-coral)] text-white border-[var(--color-coral)]',
  mint: 'bg-[var(--color-mint)] text-white border-[var(--color-mint)]',
  sand: 'bg-[var(--color-sand-cream-strong)] text-[var(--color-deep-navy)] border-[var(--color-border)]',
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition hover:translate-y-[-1px] hover:shadow-md',
      toneClasses[props.tone],
    ]"
  >
    <slot />
  </button>
</template>