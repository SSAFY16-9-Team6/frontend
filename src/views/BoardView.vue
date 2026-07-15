<script setup lang="ts">
import { INIT_POSTS } from '../data/mockData'
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-6">
    <h2 class="mb-4 text-2xl font-semibold text-[#0F1F4B]">커뮤니티 게시판</h2>
    <div class="space-y-3">
      <article v-for="post in INIT_POSTS" :key="post.id" class="rounded-[20px] border border-[#E6D8C4] bg-white p-5">
        <h3 class="text-lg font-semibold text-[#0F1F4B]">{{ post.title }}</h3>
        <p class="mt-2 text-sm leading-6 text-[#4F5B72]">{{ post.content }}</p>
      </article>
    </div>
  </section>
</template>
