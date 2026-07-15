<!-- src/App.vue -->
<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

const router = useRouter()

// 네비게이션 탭 클릭 이벤트를 수신하여 해당하는 라우터 주소로 페이지를 이동시킵니다.
function onChangeTab(tabKey: string) {
  if (tabKey === 'home') {
    router.push('/')
  } else if (tabKey === 'tourism') {
    router.push('/tourism')
  } else if (tabKey === 'map') {
    router.push('/map')
  } else if (tabKey === 'board') {
    router.push('/board')
  } else {
    // 통계 등 준비중인 탭의 경우
    console.log(`${tabKey} 페이지는 준비 중입니다.`)
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#F9F1E5]">
    <!-- 네비게이션 바가 내뿜는 change-tab 이벤트를 받아 라우팅 처리 -->
    <Navbar @change-tab="onChangeTab" />
    <RouterView />
    <Footer />
  </div>
</template>