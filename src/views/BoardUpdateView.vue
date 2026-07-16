<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CATEGORIES } from '../data/constants'
import type { Post } from '../types/index'

const router = useRouter()
const route = useRoute()

const postId = String(route.params.id || '')

const isLoading = ref<boolean>(true)
const originalPost = ref<Post | null>(null)

// 입력 필드 상태
const title = ref<string>('')
const categoryId = ref<string>('')
const content = ref<string>('')

// 커스텀 드롭다운 열림/닫힘 상태
const isCategoryOpen = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)

// 에러 메시지 상태
const errors = ref({
  title: '',
  category: '',
  content: ''
})

const fetchPostForEdit = async () => {
  try {
    const response = await fetch(`https://backend-xxf5.onrender.com/api/v1/posts/${postId}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`게시글 조회 실패 (${response.status})`)
    }

    const result = await response.json()
    if (!result?.success || !result?.data) {
      throw new Error('게시글 응답 형식이 올바르지 않습니다.')
    }

    const data = result.data
    originalPost.value = {
      postId: data.postId,
      title: data.title,
      content: data.content,
      categoryId: String(data.categoryId),
      author: data.author || '익명',
      createdAt: data.createdAt,
      likeCount: data.likeCount ?? 0,
      views: data.viewCount ?? 0,
    }
    title.value = originalPost.value.title
    categoryId.value = originalPost.value.categoryId
    content.value = originalPost.value.content
  } catch (error) {
    console.error(error)
    alert('존재하지 않는 게시글입니다.')
    goBack()
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await fetchPostForEdit()
  window.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleOutsideClick)
})


// 드롭다운 외부 클릭 감지 로직
const handleOutsideClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('.category-select-container')) {
    isCategoryOpen.value = false
  }
}

// 카테고리 선택 처리
const selectCategory = (id: string) => {
  categoryId.value = id
  isCategoryOpen.value = false
}

// 취소 및 돌아가기 제어
const goBack = () => {
  if (window.history.state && window.history.state.back) {
    router.back()
  } else {
    router.push({ name: 'board-detail', params: { id: postId } })
  }
}

// 유효성 검사
const validateForm = () => {
  let isValid = true
  errors.value = { title: '', category: '', content: '' }

  if (!title.value.trim()) {
    errors.value.title = '제목을 입력해 주세요.'
    isValid = false
  }
  if (!categoryId.value) {
    errors.value.category = '카테고리를 선택해 주세요.'
    isValid = false
  }
  if (!content.value.trim()) {
    errors.value.content = '내용을 입력해 주세요.'
    isValid = false
  }

  return isValid
}

// 수정 완료 처리
const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    isSubmitting.value = true

    const payload = {
      categoryId: Number(categoryId.value),
      title: title.value.trim(),
      content: content.value.trim(),
    }

    const response = await fetch(
      `https://backend-xxf5.onrender.com/api/v1/posts/${postId}`,
      {
        method: 'PUT',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    )

    const result = await response.json().catch(() => null)

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || `수정 실패 (${response.status})`)
    }

    router.push({ name: 'board' })
  } catch (error) {
    console.error('게시글 수정 실패:', error)
    alert(
      error instanceof Error
        ? error.message
        : '수정 처리에 실패했습니다. 다시 시도해 주세요.',
    )
  } finally {
    isSubmitting.value = false
    sessionStorage.removeItem('canEdit')
  }
}

// ID값으로 표시할 라벨(텍스트) 찾기 도우미 함수
const getCategoryName = (id: string) => {
  return CATEGORIES.find(c => c.id === id)?.name || '카테고리를 선택하세요'
}
</script>

<template>
  <!-- 로딩 중 화면 표시 -->
  <div v-if="isLoading" class="py-20 text-center text-[#4F5B72]">
    <p class="text-lg">수정할 데이터를 불러오는 중입니다...</p>
  </div>

  <!-- 실제 수정 폼 영역 -->
  <main v-else class="mx-auto max-w-3xl px-4 py-10">
    
    <div class="mb-4">
      <button 
        type="button"
        @click="goBack"
        class="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#8A866F] hover:text-[#0F1F4B] transition-colors"
      >
        <svg class="h-4 w-4 transform transition-transform group-hover:-translate-x-1 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5m7-7l-7 7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        취소하고 돌아가기
      </button>
    </div>

    <!-- 타이틀 바 (상향 배치된 취소 링크 아래에 단독 위치) -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-[#0F1F4B]">게시글 수정</h2>
    </div>

    <!-- 수정 폼 카드 -->
    <div class="rounded-[24px] bg-white p-6 sm:p-10 shadow-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <!-- 제목 입력 영역 -->
        <div>
          <label class="mb-2 block text-sm font-bold text-[#4F5B72]">제목</label>
          <input
            v-model="title"
            type="text"
            placeholder="제목을 입력해 주세요"
            class="w-full rounded-xl border border-[#E6D8C4] px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:border-[#0F1F4B] focus:outline-none focus:ring-1 focus:ring-[#0F1F4B]"
            :class="{ 'border-[#FF4D2D]': errors.title }"
          />
          <p v-if="errors.title" class="mt-2 text-xs font-semibold text-[#FF4D2D]">
            {{ errors.title }}
          </p>
        </div>

        <!-- 카테고리 커스텀 셀렉트 박스 -->
        <div class="category-select-container relative">
          <label class="mb-2 block text-sm font-bold text-[#4F5B72]">카테고리</label>
          <div class="relative">
            <button
              type="button"
              @click.stop="isCategoryOpen = !isCategoryOpen"
              class="flex w-full items-center justify-between rounded-xl border border-[#E6D8C4] bg-white px-4 py-3 text-left text-sm transition-all focus:border-[#0F1F4B] focus:outline-none focus:ring-1 focus:ring-[#0F1F4B]"
              :class="{ 
                'border-[#FF4D2D]': errors.category,
                'text-[#0F1F4B]': categoryId,
                'text-[#8A95A5]': !categoryId
              }"
            >
              <span>{{ getCategoryName(categoryId) }}</span>
              <svg 
                class="h-4 w-4 text-[#8A95A5] transition-transform duration-200"
                :class="{ 'rotate-180': isCategoryOpen }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- 커스텀 드롭다운 리스트 -->
            <transition name="fade">
              <ul 
                v-if="isCategoryOpen" 
                class="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-[#E6D8C4] bg-white py-1.5 shadow-lg focus:outline-none"
              >
                <li 
                  v-for="cat in CATEGORIES" 
                  :key="cat.id"
                  @click="selectCategory(cat.id)"
                  class="relative cursor-pointer select-none px-4 py-2.5 text-sm text-[#4F5B72] hover:bg-[#F5F0E6] hover:text-[#0F1F4B] transition-colors"
                  :class="{ 'bg-[#F5F0E6]/50 font-semibold text-[#0F1F4B]': categoryId === cat.id }"
                >
                  {{ cat.name }}
                </li>
              </ul>
            </transition>
          </div>
          <p v-if="errors.category" class="mt-2 text-xs font-semibold text-[#FF4D2D]">
            {{ errors.category }}
          </p>
        </div>

        <!-- 본문 입력 영역 -->
        <div>
          <label class="mb-2 block text-sm font-bold text-[#4F5B72]">내용</label>
          <textarea
            v-model="content"
            rows="12"
            placeholder="내용을 작성해 주세요"
            class="w-full rounded-xl border border-[#E6D8C4] px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:border-[#0F1F4B] focus:outline-none focus:ring-1 focus:ring-[#0F1F4B] resize-none leading-relaxed"
            :class="{ 'border-[#FF4D2D]': errors.content }"
          ></textarea>
          <p v-if="errors.content" class="mt-2 text-xs font-semibold text-[#FF4D2D]">
            {{ errors.content }}
          </p>
        </div>

        <!-- 하단 액션 버튼 영역 -->
        <div class="flex items-center justify-end gap-3 border-t border-[#F5F0E6] pt-6">
          <button
            type="button"
            @click="goBack"
            class="rounded-xl bg-[#E8E4DA] px-5 py-3 text-sm font-semibold text-[#4F5B72] hover:bg-[#D9D4C7] transition-all"
          >
            취소
          </button>
          
          <button
            type="submit"
            class="rounded-xl bg-[#FF4D2D] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e03d1e] transition-all shadow-sm"
          >
            수정완료
          </button>
        </div>

      </form>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>