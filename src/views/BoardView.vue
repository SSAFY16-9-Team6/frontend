<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { CATEGORIES } from '../data/constants.ts'
import type { Post } from '../data/mockData.ts'
import SearchBar from '../components/ui/SearchBar.vue'
import PostCard from '../components/ui/PostCard.vue'

const router = useRouter()

// ==========================================
// 📌 1. 상태 정의 (API 데이터 연동 구조)
// ==========================================
const posts = ref<Post[]>([])
const isLoading = ref<boolean>(false)
const isError = ref<boolean>(false)

// 페이징 및 필터링 상태
const currentPage = ref<number>(1)
const pageSize = ref<number>(20)
const totalElements = ref<number>(0)

const searchQuery = ref<string>('')
const selectedCategoryId = ref<string>('all')

// ==========================================
// 📌 2. fetch API 비동기 데이터 통신
// ==========================================
const fetchPosts = async () => {
  isLoading.value = true
  isError.value = false
  
  try {
    // 💡 URL 및 Query Parameter 조립
    const baseUrl = 'https://backend-xxf5.onrender.com/api/v1/categories/posts'
    const urlParams = new URLSearchParams()
    
    urlParams.append('page', String(currentPage.value))
    urlParams.append('size', String(pageSize.value))

    // 카테고리 필터링이 활성화된 경우
    if (selectedCategoryId.value !== 'all') {
      urlParams.append('categoryId', selectedCategoryId.value)
    }

    // 검색어가 존재할 경우
    const cleanQuery = searchQuery.value.trim()
    if (cleanQuery) {
      urlParams.append('keyword', cleanQuery)
    }

    // 최종 요청 주소 완성
    const requestUrl = `${baseUrl}?${urlParams.toString()}`

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    })

    // 💡 fetch는 4xx, 5xx 에러도 response.ok = false로 처리되므로 수동 예외 가딩이 필수입니다.
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`)
    }

    const data = await response.json()

    // 백엔드 데이터 구조에 맞춰 파싱 및 반응형 바인딩
    if (Array.isArray(data)) {
      posts.value = data
    } else if (data && Array.isArray(data.content)) {
      posts.value = data.content
      totalElements.value = data.totalElements || 0
    } else {
      posts.value = []
    }
  } catch (error) {
    console.error('게시글 목록을 불러오는데 실패했습니다:', error)
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

// ==========================================
// 📌 3. 실시간 감시 및 디바운스 처리 (Watchers)
// ==========================================

// 카테고리가 바뀌면 1페이지로 리셋하고 즉시 fetch 재호출
watch(selectedCategoryId, () => {
  currentPage.value = 1
  fetchPosts()
})

// 검색 필터 디바운스 (사용자가 연속해서 타이핑 시 API 난사 제어)
let debounceTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    currentPage.value = 1
    fetchPosts()
  }, 300)
})

// 컴포넌트 마운트 시 첫 진입 호출
onMounted(() => {
  fetchPosts()
})

// ==========================================
// 📌 4. 이벤트 핸들러 및 라우팅
// ==========================================
const selectCategory = (id: string) => {
  selectedCategoryId.value = id
}

const handleSelect = (postId: string | number) => {
  router.push({ name: 'post-detail', params: { id: String(postId) } })
}

const goCreatePage = () => {
  router.push('/board/create')
}
</script>

<template>
  <section class="mx-auto max-w-7xl px-6 py-8">
    <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">커뮤니티</span>
    
    <!-- 타이틀 영역 -->
    <div class="mb-6 flex items-center justify-between">
      <h2 class="font-heading text-2xl text-[#0F1F4B] m-0">여행 이야기 게시판</h2>
      
      <!-- ✍️ 글쓰기 버튼 -->
      <button 
        @click="goCreatePage"
        class="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e03d1e] transition-all shadow-sm"
      >
        <svg class="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14M5 12h14" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>글쓰기</span>
      </button>
    </div>

    <!-- 검색 바 -->
    <div class="mb-6">
      <SearchBar v-model="searchQuery" placeholder="제목이나 내용으로 검색해보세요" />
    </div>

    <!-- 카테고리 탭 바 -->
    <div class="mb-8 flex flex-wrap gap-2 border-b border-[#E6D8C4] pb-4">
      <button
        @click="selectCategory('all')"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
          selectedCategoryId === 'all'
            ? 'bg-[#0F1F4B] text-white'
            : 'bg-[#e8e4da] text-[#8a866f] hover:text-[#0F1F4B]'
        ]"
      >
        전체
      </button>

      <button
        v-for="category in CATEGORIES"
        :key="category.id"
        @click="selectCategory(category.id)"
        :class="[
          'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
          selectedCategoryId === category.id
            ? 'bg-[#0F1F4B] text-white'
            : 'bg-[#e8e4da] text-[#8a866f] hover:text-[#0F1F4B]'
        ]"
      >
        {{ category.name }}
      </button>
    </div>

    <!-- 게시글 카드 목록 리스트 & 상태별 분기 -->
    <div class="space-y-4">
      <!-- 로딩 상태 스켈레톤 UI -->
      <div v-if="isLoading" class="py-16 text-center text-[#4F5B72]">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF4D2D] border-t-transparent mb-4"></div>
        <p class="text-sm font-medium">여행 이야기를 불러오고 있습니다...</p>
      </div>

      

      <!-- 에러 발생 시 처리 -->
      <div v-else-if="isError" class="py-16 text-center text-[#FF4D2D]">
        <p class="text-lg font-medium">데이터 로드 실패</p>
        <p class="mt-1 text-sm text-[#8A95A5]">서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.</p>
        <button 
          @click="fetchPosts" 
          class="mt-4 px-4 py-2 bg-[#0F1F4B] text-white rounded-xl text-xs font-bold"
        >
          다시 불러오기
        </button>
      </div>

      <!-- 데이터가 없는 경우 -->
      <div v-else-if="posts.length === 0" class="py-16 text-center text-[#4F5B72]">
        <p class="text-lg font-medium">등록된 여행 게시글이 없습니다.</p>
        <p class="mt-1 text-sm text-[#8A95A5]">선택한 카테고리나 검색어에 맞는 첫 이야기의 주인공이 되어보세요!</p>
      </div>

      <!-- 공통 카드 컴포넌트 목록 렌더링 -->
      <PostCard
        v-else
        v-for="post in posts"
        :key="post.postId"
        :post="post"
        @select="handleSelect"
      />
    </div>
  </section>
</template>