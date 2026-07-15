<script setup lang="ts">
import { ref, computed } from 'vue'
import { INIT_POSTS, type Post } from '../data/mockData.ts'
import { CATEGORIES } from '../data/constants.ts'
import SearchBar from '../components/ui/SearchBar.vue'
import PostCard from '../components/ui/PostCard.vue'
import BoardDetailView from './BoardDetailView.vue'
import { useRouter } from 'vue-router'

// 1. 상태 정의
const posts = ref<Post[]>(INIT_POSTS) // 글 삭제 등의 변경 사항 반영을 위해 ref로 감싸기
const searchQuery = ref<string>('')
const selectedCategoryId = ref<string>('all')

const selectedPost = ref<Post | null>(null)

// 2. 카테고리 선택 핸들러
const selectCategory = (id: string) => {
  selectedCategoryId.value = id
}

// 3. 카드 클릭 시 상세글 지정 핸들러
const handlePostClick = (postId: string | number) => {
  const found = posts.value.find(p => p.postId === postId)
  if (found) {
    selectedPost.value = found
    // (선택사항) 조회수 1 증가 로직
    found.views = (found.views || 0) + 1
  }
}

// 4. 글 삭제 핸들러 (목록 카드의 삭제 버튼 또는 상세 보기의 삭제 버튼 클릭 시)
const handlePostDelete = (postId: string | number) => {
  if (confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
    posts.value = posts.value.filter(p => p.postId !== postId)
    // 만약 현재 상세 보기가 열려 있는 상태에서 삭제했다면 목록으로 강제 전환
    if (selectedPost.value?.postId === postId) {
      selectedPost.value = null
    }
  }
}

// 5. 검색 및 카테고리 필터링 연산
const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchesCategory = 
      selectedCategoryId.value === 'all' || 
      post.categoryId === selectedCategoryId.value

    const cleanQuery = searchQuery.value.trim().toLowerCase()
    const matchesSearch = 
      cleanQuery === '' ||
      post.title.toLowerCase().includes(cleanQuery) ||
      post.content.toLowerCase().includes(cleanQuery)

    return matchesCategory && matchesSearch
  })
})

const router = useRouter()
function handleSelect(postId) {
  router.push({ name: 'post-detail', params: { id: String(postId) } })
}
</script>

<template>
  <!-- 📌 CASE A: 상세보기가 활성화된 경우 (v-if) -->
  <PostDetail 
    v-if="selectedPost"
    :post="selectedPost"
    @back="selectedPost = null"
    @delete="handlePostDelete"
    @edit="(id) => console.log('수정 기능 연결:', id)"
  />

  <!-- 📌 CASE B: 기본 목록을 띄우는 경우 (v-else) -->
  <section v-else class="mx-auto max-w-7xl px-6 py-8">
    <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">커뮤니티</span>
    <h2 class="mb-6 font-heading text-2xl text-[#0F1F4B]">여행 이야기 게시판</h2>

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

    <!-- 게시글 카드 목록 리스트 -->
    <div class="space-y-4">
      <div v-if="filteredPosts.length === 0" class="py-16 text-center text-[#4F5B72]">
        <p class="text-lg font-medium">검색 결과나 일치하는 게시글이 없습니다.</p>
        <p class="mt-1 text-sm text-[#8A95A5]">다른 검색어를 입력하거나 카테고리를 변경해 보세요.</p>
      </div>

      <!-- 공통 카드 컴포넌트 -->
      <PostCard
        v-for="post in filteredPosts"
        :key="post.postId"
        :post="post"
        @select="handleSelect"
        @delete="handlePostDelete"
      />
    </div>
  </section>
</template>