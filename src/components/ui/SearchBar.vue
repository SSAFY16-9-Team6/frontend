<script setup lang="ts">

defineProps<{
  placeholder?: string
}>()

</script>

<template>
  <div class="relative w-full">
    <!-- 검색창 컨테이너: 둥근 모서리 및 베이지 테두리 적용 -->
    <div 
      class="flex h-12 w-full items-center gap-3 rounded-[20px] border border-[#E6D8C4] bg-white px-5 transition-all duration-200 focus-within:border-[#0F1F4B] focus-within:ring-1 focus-within:ring-[#0F1F4B]"
    >
      <!-- 돋보기 아이콘 (네이비 포인트를 주기 위해 #0F1F4B 색상 적용) -->
      <svg 
        class="h-5 w-5 shrink-0 text-[#0F1F4B]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          stroke-width="2" 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
        />
      </svg>

      <!-- 인풋 영역 -->
      <input
        type="text"
        :value="modelValue"
        @input="modelValue = ($event.target as HTMLInputElement).value"
        :placeholder="placeholder || '검색어를 입력해주세요'"
        class="h-full w-full bg-transparent text-sm font-medium text-[#0F1F4B] outline-none placeholder:text-[#8A95A5] placeholder:font-normal"
      />

      <!-- 글자 입력 시 활성화되는 지우기(X) 버튼 (선택 사항) -->
      <button 
        v-if="modelValue"
        @click="modelValue = ''"
        type="button"
        class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F0E6] text-[#4F5B72] hover:bg-[#E6D8C4] hover:text-[#0F1F4B] transition-colors"
      >
        <svg 
          class="h-3 w-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2.5" 
            d="M6 18L18 6M6 6l12 12" 
          />
        </svg>
      </button>
    </div>
  </div>
</template>