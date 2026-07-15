<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CATEGORIES } from '../data/constants'
import type { Post } from '../types/index'
import { INIT_POSTS } from '../data/mockData'

const router = useRouter()
const route = useRoute()

// ==========================================
// 📌 1. [동적 데이터 상태 선언]
// ==========================================
const post = ref<Post | null>(null)
const isLoading = ref<boolean>(true)

// 사용자가 이 글에 좋아요를 눌렀는지 여부 기록
const isLiked = ref<boolean>(false)

// 🔒 [비밀번호 모달 관련 상태]
const isPasswordModalOpen = ref<boolean>(false)
const inputPassword = ref<string>('')
const passwordInputRef = ref<HTMLInputElement | null>(null)
const passwordError = ref<string>('')

// ==========================================
// 📌 2. [데이터 호출 로직]
// ==========================================
onMounted(async () => {
  try {
    const postId = String(route.params.id || '')
    post.value = INIT_POSTS.find(p => String(p.postId) === postId) || null
  } catch (error) {
    console.error('데이터를 불러오는 중 오류가 발생했습니다:', error)
  } finally {
    isLoading.value = false
  }
})

// ==========================================
// 📌 3. [동적 데이터 연산 및 핸들러]
// ==========================================

const categoryInfo = computed(() => {
  if (!post.value) return null
  return CATEGORIES.find((cat) => cat.id === post.value?.categoryId)
})

const formattedDate = computed(() => {
  if (!post.value?.createdAt) return '방금 전'
  try {
    const date = new Date(post.value.createdAt)
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    return `${yyyy}.${mm}.${dd}`
  } catch (e) {
    return post.value.createdAt
  }
})

const goBack = () => {
  router.push({ name: 'board' }) 
}

const handleEdit = () => {
  if (!post.value) return
  router.push({ name: 'post-edit', params: { id: post.value.postId } })
}

// 📌 [좋아요 버튼 클릭 핸들러]
const handleLike = () => {
  if (!post.value || isLiked.value) return
  isLiked.value = true
  post.value.likeCount += 1
}

// ==========================================
// 📌 4. [🔒 삭제 비밀번호 모달 제어 로직]
// ==========================================

// 삭제 버튼 클릭 시 모달 열기
const openPasswordModal = () => {
  isPasswordModalOpen.value = true
  inputPassword.value = ''
  passwordError.value = ''
  
  // 모달이 열린 후 인풋창에 바로 포커스 주기
  nextTick(() => {
    passwordInputRef.value?.focus()
  })
}

// 모달 닫기
const closePasswordModal = () => {
  isPasswordModalOpen.value = false
  inputPassword.value = ''
  passwordError.value = ''
}

// 비밀번호 검증 및 실제 삭제 처리
const submitDelete = async () => {
  if (!post.value) return
  
  if (!inputPassword.value.trim()) {
    passwordError.value = '비밀번호를 입력해주세요.'
    return
  }

  /* 
    [참고] 실무에서는 백엔드 API를 호출하여 비밀번호를 검증합니다.
    여기서는 편의상 mockData에 있을 수 있는 비밀번호나 고정값을 비교하는 예시를 보여줍니다.
    예: post.value.password === inputPassword.value
  */
  const correctPassword = post.value.password || '1234' // 백엔드 연동 전까지 디폴트 비밀번호 '1234'로 검증 가정

  if (inputPassword.value === correctPassword) {
    try {
      // 삭제 성공 시 시나리오
      alert('게시글이 성공적으로 삭제되었습니다.')
      closePasswordModal()
      goBack()
    } catch (error) {
      passwordError.value = '삭제 중 서버 오류가 발생했습니다.'
    }
  } else {
    passwordError.value = '비밀번호가 일치하지 않습니다. 다시 입력해주세요.'
    passwordInputRef.value?.focus()
  }
}
</script>

<template>
  <!-- 로딩 중 화면 표시 -->
  <div v-if="isLoading" class="py-20 text-center text-[#4F5B72]">
    <p class="text-lg">게시글을 불러오는 중입니다...</p>
  </div>

  <!-- 게시글 데이터가 없는 예외 상태 처리 -->
  <div v-else-if="!post" class="py-20 text-center">
    <p class="text-lg font-semibold text-[#4F5B72]">존재하지 않거나 삭제된 게시글입니다.</p>
    <button @click="goBack" class="mt-4 text-[#0F1F4B] underline font-medium">
      게시판 목록으로 이동
    </button>
  </div>

  <!-- 실제 상세 페이지 뷰 영역 -->
  <main v-else class="relative mx-auto max-w-3xl px-4 py-10">
    <!-- 1. 상단 내비게이션 (뒤로가기만 배치) -->
    <div class="mb-8 flex items-center justify-between">
      <button 
        @click="goBack"
        class="group flex items-center gap-2 text-sm font-medium text-[#8A866F] transition-colors hover:text-[#0F1F4B]"
      >
        <svg class="h-4 w-4 transform transition-transform group-hover:-translate-x-1 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5m7-7l-7 7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        목록으로 돌아가기
      </button>
    </div>

    <!-- 2. 상세 정보 아티클 카드 -->
    <article class="rounded-[24px] bg-white p-6 sm:p-10 shadow-sm">
      
      <!-- 카테고리 태그 -->
      <div class="mb-4">
        <span 
          v-if="categoryInfo"
          :class="[
            'rounded-xl px-3 py-1 text-xs font-bold text-white',
            categoryInfo.color
          ]"
        >
          {{ categoryInfo.name }}
        </span>
        <span v-else class="rounded-md bg-gray-400 px-3 py-1.5 text-xs font-bold text-white">
          기타
        </span>
      </div>

      <!-- 게시글 대제목 -->
      <h1 class="font-heading text-2xl sm:text-3xl leading-snug text-[#0F1F4B] mb-6">
        {{ post.title }}
      </h1>

      <!-- 메타데이터 바 (작성자, 날짜, 조회수 순서로 배치) -->
      <div class="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F0E6] pb-6 text-xs text-[#8A95A5]">
        <div class="flex flex-wrap items-center gap-3">
          <!-- 작성자 -->
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-[#4F5B72]">{{ post.author || '익명' }}</span>
          </div>

          <span class="h-3 w-[1px] bg-[#E6D8C4]"></span>

          <!-- 작성 일자 -->
          <div class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="font-medium">{{ formattedDate }}</span>
          </div>

          <span class="h-3 w-[1px] bg-[#E6D8C4]"></span>

          <!-- 조회수 -->
          <div class="flex items-center gap-1">
            <svg class="h-3.5 w-3.5 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="font-medium text-[#4F5B72]">조회수 {{ post.views || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 3. 게시글 본문 영역 -->
      <div class="font-body text-base leading-8 text-[#4F5B72] whitespace-pre-wrap py-10">
        {{ post.content }}
      </div>

      <!-- 4. 하단 버튼 영역 (좋아요 좌측 배치 / 수정·삭제 우측 배치) -->
      <div class="mt-6 flex items-center justify-between gap-4 border-t border-[#F5F0E6] pt-6">
        
        <!-- 왼쪽: 좋아요 버튼 -->
        <button
          @click="handleLike"
          :disabled="isLiked"
          :class="[
            'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-0 whitespace-nowrap shrink-0',
            isLiked 
              ? 'bg-rose-50 text-[#FF4D2D]' 
              : 'bg-[#E8E4DA] text-[#4F5B72] hover:bg-[#D9D4C7] hover:text-[#0F1F4B]'
          ]"
        >
          <svg 
            class="h-4 w-4 shrink-0 transition-transform duration-200" 
            :class="isLiked ? 'fill-current text-[#FF4D2D] scale-110' : 'fill-none stroke-current'"
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span class="font-bold leading-none">{{ post.likeCount }}</span>
          <span class="leading-none">좋아요</span>
        </button>

        <!-- 오른쪽: 수정 및 삭제 버튼 묶음 -->
        <div class="flex items-center gap-2">
          <!-- 수정 버튼 -->
          <button 
            @click="handleEdit"
            class="inline-flex items-center gap-1.5 rounded-xl bg-[#E8E4DA] px-4 py-2.5 text-sm font-semibold text-[#4F5B72] hover:bg-[#D9D4C7] hover:text-[#0F1F4B] transition-all border-0 whitespace-nowrap shrink-0"
          >
            <svg class="h-4 w-4 shrink-0 fill-none stroke-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="leading-none">수정</span>
          </button>

          <!-- 삭제 버튼 (클릭 시 커스텀 비밀번호 모달 팝업 호출) -->
          <button 
            @click="openPasswordModal"
            class="inline-flex items-center rounded-xl bg-[#FFF0ED] px-4 py-2.5 text-sm font-semibold text-[#FF4D2D] hover:bg-[#FF4D2D] hover:text-white transition-all border-0 whitespace-nowrap shrink-0"
          >
            <span class="leading-none">삭제</span>
          </button>
        </div>

      </div>
    </article>

    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="isPasswordModalOpen" 
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          @click.self="closePasswordModal"
        >
          <!-- 모달 박스 컨테이너 -->
          <div class="w-full max-w-md transform rounded-3xl bg-white p-6 shadow-xl transition-all border border-[#F5F0E6]">
            
            <!-- 모달 헤더 -->
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-lg font-bold text-[#0F1F4B]">비밀번호 입력</h3>
              <button 
                @click="closePasswordModal" 
                class="rounded-lg p-1 text-[#8A95A5] hover:bg-[#F5F0E6] hover:text-[#0F1F4B]"
              >
                <svg class="h-5 w-5 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>

            <!-- 모달 본문 설명 및 인풋창 -->
            <div class="mb-6">
              <p class="mb-3 text-sm text-[#4F5B72]">
                게시글을 삭제하려면 작성 시 설정한 비밀번호를 입력해주세요.
              </p>
              
              <input 
                ref="passwordInputRef"
                v-model="inputPassword"
                type="password" 
                placeholder="비밀번호를 입력하세요" 
                class="w-full rounded-xl border border-[#E6D8C4] px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:border-[#0F1F4B] focus:outline-none focus:ring-1 focus:ring-[#0F1F4B]"
                @keyup.enter="submitDelete"
              />

              <!-- 검증 에러 메시지 노출 -->
              <p v-if="passwordError" class="mt-2 text-xs font-semibold text-[#FF4D2D]">
                {{ passwordError }}
              </p>
            </div>

            <!-- 모달 제어 하단 버튼 그룹 -->
            <div class="flex items-center justify-end gap-2">
              <button 
                @click="closePasswordModal"
                class="rounded-xl bg-[#E8E4DA] px-4 py-2.5 text-sm font-semibold text-[#4F5B72] hover:bg-[#D9D4C7] transition-all"
              >
                취소
              </button>
              <button 
                @click="submitDelete"
                class="rounded-xl bg-[#FF4D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all shadow-sm"
              >
                확인
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </main>
</template>

<style scoped>
/* 모달 등장/퇴장 페이드 애니메이션 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>