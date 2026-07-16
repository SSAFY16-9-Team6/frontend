<!-- src/components/ui/PostCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { CATEGORIES } from '../../data/constants'
import type { Post } from '../../types'

const emit = defineEmits<{
  (e: 'delete', postId: string | number): void
  (e: 'select', postId: string | number): void
}>()

const goDetail = () => {
  emit('select', props.post.postId)
}

const props = defineProps<{
  post: Post
}>()

const categoryInfo = computed(() => {
  return CATEGORIES.find((cat) => cat.id === props.post.categoryId)
})

const formattedDate = computed(() => {
  if (!props.post.createdAt) return '방금 전'
  try {
    const date = new Date(props.post.createdAt)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}.${mm}.${dd}`
  } catch (e) {
    return props.post.createdAt
  }
})
</script>

<template>
  <!-- @click="goDetail" 이 정상 작동합니다 -->
  <article 
    @click="goDetail"
    class="group relative cursor-pointer rounded-[20px] border border-[#E6D8C4] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
  >
    <div class="flex flex-col gap-4">
      <!-- 1. 상단 영역: 카테고리 태그 및 (호버 시 나타나는) 삭제 버튼 -->
      <div class="flex items-center justify-between">
        <span 
          v-if="categoryInfo"
          :class="[
            'rounded-xl px-3 py-1 text-xs font-semibold text-white transition-opacity group-hover:opacity-90',
            categoryInfo.color
          ]"
        >
          {{ categoryInfo.name }}
        </span>
        <span v-else class="rounded-md bg-gray-400 px-3 py-1 text-xs font-semibold text-white">
          기타
        </span>
      </div>

      <!-- 2. 제목 -->
      <h3 class="text-lg font-normal text-[#0F1F4B] transition-colors duration-200 group-hover:text-[#FF4D2D]">
        {{ post.title }}
      </h3>

      <!-- 3. 본문 내용 (최대 두 줄 유지) -->
      <p class="text-sm leading-6 text-[#4F5B72] line-clamp-2">
        {{ post.content }}
      </p>

      <!-- 4. 하단 영역: [작성자 - 생성일자] --------- [조회수 - 좋아요] 순 배치 -->
      <div class="mt-1 flex items-center justify-between border-t border-[#F5F0E6] pt-4 text-xs">
        
        <!-- 왼쪽: 작성자 정보 및 생성일자 (달력 아이콘) -->
        <div class="flex items-center gap-3">
          <!-- 작성자 -->
          <div class="flex items-center gap-1.5">
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#F5F0E6] text-[#0F1F4B]">
              <svg class="h-3.5 w-3.5 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="font-bold text-[#4F5B72]">{{ post.author || '익명' }}</span>
          </div>

          <!-- 세로 구분선 -->
          <span class="h-3 w-[1px] bg-[#E6D8C4]"></span>

          <!-- 생성일자 (달력 아이콘 + 포맷팅된 날짜) -->
          <div class="flex items-center gap-1 text-[#8A95A5]">
            <svg class="h-3.5 w-3.5 shrink-0 stroke-current text-[#8A95A5]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="font-medium">{{ formattedDate }}</span>
          </div>
        </div>

        <!-- 오른쪽: 반응형 메트릭스 (조회수 & 좋아요) -->
        <div class="flex items-center gap-4 text-[#8A95A5]">
          <!-- 조회수 (눈 아이콘) -->
          <span class="flex items-center gap-1">
            <svg class="h-4 w-4 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="font-semibold text-[#4F5B72]">{{ post.views || 0 }}</span>
          </span>

          <!-- 좋아요 (하트 아이콘) -->
          <span class="flex items-center gap-1 group/like">
            <svg class="h-4 w-4 shrink-0 stroke-current text-[#8A95A5] transition-colors duration-200 group-hover/like:text-[#FF4D2D]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="font-semibold text-[#4F5B72] transition-colors duration-200 group-hover/like:text-[#FF4D2D]">
              {{ post.likeCount ?? post.likeCount ?? 0 }}
            </span>
          </span>
        </div>
        
      </div>
    </div>
  </article>
</template>