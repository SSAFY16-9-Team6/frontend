<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const updateValue = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="relative w-full">
    <div
      class="flex h-12 w-full items-center gap-3 rounded-[20px] border border-[#E6D8C4] bg-white px-5 transition-all duration-200 focus-within:border-[#0F1F4B] focus-within:ring-1 focus-within:ring-[#0F1F4B]"
    >
      <svg class="h-5 w-5 shrink-0 text-[#0F1F4B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>

      <input
        type="text"
        :value="props.modelValue"
        @input="updateValue(($event.currentTarget as HTMLInputElement).value)"
        :placeholder="props.placeholder || '검색어를 입력해주세요'"
        class="h-full w-full bg-transparent text-sm font-medium text-[#0F1F4B] outline-none placeholder:text-[#8A95A5] placeholder:font-normal"
      />

      <button
        v-if="props.modelValue"
        @click="updateValue('')"
        type="button"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F0E6] text-[#4F5B72] hover:bg-[#E6D8C4] hover:text-[#0F1F4B] transition-colors"
      >
        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>