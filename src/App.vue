<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="min-h-screen bg-[#F9F1E5]">
    <!-- 네비게이션 바 -->
    <Navbar @change-tab="onChangeTab" />
    <RouterView />
  </div>
</template>