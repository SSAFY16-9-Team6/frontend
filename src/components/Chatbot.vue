<script setup lang="ts">
import { ref } from 'vue'
import { CHATBOT_RESPONSES } from '../data/mockData'

const messages = ref(CHATBOT_RESPONSES)
</script>

<template>
  <aside class="rounded-[24px] border border-[#E6D8C4] bg-[#F9F1E5] p-5">
    <h3 class="mb-3 text-lg font-semibold text-[#0F1F4B]">챗봇</h3>
    <div class="space-y-2">
      <div v-for="msg in messages" :key="msg.id" :class="msg.role === 'user' ? 'text-right' : 'text-left'">
        <span :class="msg.role === 'user' ? 'bg-[#0BA09B] text-white' : 'bg-white text-[#16233E]'" class="inline-block rounded-full px-3 py-2 text-sm">{{ msg.text }}</span>
      </div>
    </div>
  </aside>
</template>
