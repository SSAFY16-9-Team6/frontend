<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { CATEGORIES } from '../data/constants.ts'

const router = useRouter()

const title = ref<string>('')
const selectedCategoryId = ref<string>('')
const content = ref<string>('')
const password = ref<string>('')

// 커스텀 드롭다운 제어 상태
const isOpen = ref<boolean>(false)
const dropdownRef = ref<HTMLElement | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')

// 선택된 카테고리의 텍스트 가져오기
const selectedCategoryName = computed(() => {
    const found = CATEGORIES.find((c) => c.id === selectedCategoryId.value)
    return found ? found.name : '카테고리를 선택해주세요'
})

// 유효성 검사 에러 메시지 상태
const errors = ref({
    title: '',
    category: '',
    content: '',
    password: '',
})

// 드롭다운 외부 클릭 시 닫기 처리
const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
        isOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

// 카테고리 선택 처리
const selectCategory = (id: string) => {
    selectedCategoryId.value = id
    errors.value.category = ''
    isOpen.value = false
}

// 취소 후 목록으로 이동
const handleCancel = () => {
    if (confirm('작성 중인 내용이 저장되지 않습니다. 정말 취소하시겠습니까?')) {
        router.push('/board')
    }
}

// 입력값 검증
const validateForm = (): boolean => {
    let isValid = true

    // 에러 초기화
    errors.value = {
        title: '',
        category: '',
        content: '',
        password: '',
    }

    if (!title.value.trim()) {
        errors.value.title = '제목을 입력해주세요.'
        isValid = false
    }
    if (!selectedCategoryId.value) {
        errors.value.category = '카테고리를 선택해주세요.'
        isValid = false
    }
    if (!content.value.trim()) {
        errors.value.content = '내용을 입력해주세요.'
        isValid = false
    }
    if (!password.value.trim()) {
        errors.value.password = '비밀번호를 입력해주세요.'
        isValid = false
    } else if (password.value.length < 4) {
        errors.value.password = '비밀번호는 최소 4자리 이상이어야 합니다.'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    submitError.value = ''
    if (!validateForm()) return
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
        const response = await fetch('https://backend-xxf5.onrender.com/api/v1/posts', {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                categoryId: Number(selectedCategoryId.value),
                title: title.value.trim(),
                content: content.value.trim(),
                password: password.value,
                author: '익명',
            }),
        })

        if (!response.ok) {
            let message = ''

            try {
                const errorPayload = await response.json()

                if (typeof errorPayload?.message === 'string') {
                    message = errorPayload.message
                } else if (typeof errorPayload?.detail === 'string') {
                    message = errorPayload.detail
                } else if (Array.isArray(errorPayload?.errors)) {
                    message = errorPayload.errors.join(', ')
                }
            } catch {
                message = ''
            }

            if (response.status === 422) {
                throw new Error(message || '등록에 실패했습니다. 입력값을 확인해주세요.')
            }

            throw new Error(message || `게시글 등록 실패 (${response.status})`)
        }

        const result = await response.json()

        if (result?.success) {
            alert('게시글이 성공적으로 등록되었습니다.')
            router.push('/board')
            return
        }

        throw new Error(result?.message || '게시글 등록에 실패했습니다.')
    } catch (error) {
        console.error('등록 실패:', error)
        submitError.value = error instanceof Error ? error.message : '게시글 등록 중 문제가 발생했습니다.'
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
    <main class="mx-auto max-w-3xl px-4 py-10">
        <!-- 1. 상단 타이틀 및 백 버튼 -->
        <div class="mb-8">
            <button
                @click="handleCancel"
                type="button"
                class="group mb-3 inline-flex items-center gap-2 text-sm font-medium text-[#8A866F] transition-colors hover:text-[#0F1F4B]"
            >
                <svg
                    class="h-4 w-4 transform transition-transform group-hover:-translate-x-1 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M19 12H5m7-7l-7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                게시판으로 가기
            </button>
            <h1 class="font-heading text-2xl sm:text-3xl text-[#0F1F4B]">새로운 여행 이야기 작성</h1>
            <p class="mt-1 text-sm text-[#4F5B72]">당신의 특별하고 소중한 여행 조각을 다른 여행자들과 공유해보세요.</p>
        </div>

        <!-- 2. 글쓰기 폼 카드 영역 (순서: 제목 ➔ 카테고리 ➔ 내용 ➔ 비밀번호) -->
        <form
            @submit.prevent="handleSubmit"
            class="rounded-[24px] bg-white p-6 sm:p-10 shadow-sm border border-[#F5F0E6] space-y-6"
        >
            <!-- [1] 제목 입력 필드 -->
            <div>
                <label for="title" class="block text-sm font-bold text-[#0F1F4B] mb-2"
                    >제목 <span class="text-[#FF4D2D]">*</span></label
                >
                <input
                    id="title"
                    v-model="title"
                    type="text"
                    placeholder="제목을 입력해주세요 (최대 50자)"
                    maxlength="50"
                    :class="[
                        'w-full rounded-xl border px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:outline-none focus:ring-1',
                        errors.title
                            ? 'border-[#FF4D2D] focus:border-[#FF4D2D] focus:ring-[#FF4D2D]'
                            : 'border-[#E6D8C4] focus:border-[#0F1F4B] focus:ring-[#0F1F4B]',
                    ]"
                />
                <p v-if="errors.title" class="mt-1.5 text-xs font-semibold text-[#FF4D2D]">{{ errors.title }}</p>
            </div>

            <!-- [2] 커스텀 디자인 드롭다운 (수정 페이지 스타일 반영) -->
            <div ref="dropdownRef" class="relative">
                <label class="block text-sm font-bold text-[#0F1F4B] mb-2"
                    >카테고리 선택 <span class="text-[#FF4D2D]">*</span></label
                >

                <!-- 드롭다운 버튼 버튼 -->
                <button
                    type="button"
                    @click="isOpen = !isOpen"
                    :class="[
                        'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-all focus:outline-none focus:ring-1',
                        errors.category
                            ? 'border-[#FF4D2D] focus:ring-[#FF4D2D]'
                            : 'border-[#E6D8C4] focus:ring-[#0F1F4B]',
                        selectedCategoryId ? 'text-[#0F1F4B]' : 'text-[#8A95A5]',
                    ]"
                >
                    <span>{{ selectedCategoryName }}</span>
                    <!-- 화살표 아이콘 (드롭다운 열림 여부에 따른 애니메이션 효과) -->
                    <svg
                        class="h-5 w-5 text-[#8a866f] transition-transform duration-200"
                        :class="{ 'rotate-180': isOpen }"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <!-- 커스텀 드롭다운 리스트 옵션 레이어 -->
                <div
                    v-if="isOpen"
                    class="absolute z-10 mt-1.5 w-full rounded-xl border border-[#E6D8C4] bg-white py-1 shadow-lg max-h-60 overflow-y-auto"
                >
                    <button
                        type="button"
                        v-for="category in CATEGORIES"
                        :key="category.id"
                        @click="selectCategory(category.id)"
                        class="flex w-full items-center px-4 py-2.5 text-left text-sm text-[#0F1F4B] transition-colors hover:bg-[#F9F8F6] hover:text-[#FF4D2D]"
                    >
                        <span :class="{ 'font-semibold text-[#FF4D2D]': selectedCategoryId === category.id }">
                            {{ category.name }}
                        </span>
                    </button>
                </div>
                <p v-if="errors.category" class="mt-1.5 text-xs font-semibold text-[#FF4D2D]">{{ errors.category }}</p>
            </div>

            <!-- [3] 본문 내용 입력 필드 -->
            <div>
                <label for="content" class="block text-sm font-bold text-[#0F1F4B] mb-2"
                    >내용 <span class="text-[#FF4D2D]">*</span></label
                >
                <textarea
                    id="content"
                    v-model="content"
                    rows="10"
                    placeholder="여행 후기, 현지 팁, 맛집 추천 등 이야기를 자유롭게 나누어주세요."
                    :class="[
                        'w-full rounded-xl border px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:outline-none focus:ring-1 resize-none leading-relaxed',
                        errors.content
                            ? 'border-[#FF4D2D] focus:border-[#FF4D2D] focus:ring-[#FF4D2D]'
                            : 'border-[#E6D8C4] focus:border-[#0F1F4B] focus:ring-[#0F1F4B]',
                    ]"
                ></textarea>
                <p v-if="errors.content" class="mt-1.5 text-xs font-semibold text-[#FF4D2D]">{{ errors.content }}</p>
            </div>

            <!-- [4] 글 비밀번호 입력 필드 -->
            <div class="max-w-xs">
                <label for="password" class="block text-sm font-bold text-[#0F1F4B] mb-2"
                    >수정/삭제 비밀번호 <span class="text-[#FF4D2D]">*</span></label
                >
                <input
                    id="password"
                    v-model="password"
                    type="password"
                    placeholder="비밀번호 4자리 이상 입력"
                    maxlength="20"
                    :class="[
                        'w-full rounded-xl border px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:outline-none focus:ring-1',
                        errors.password
                            ? 'border-[#FF4D2D] focus:border-[#FF4D2D] focus:ring-[#FF4D2D]'
                            : 'border-[#E6D8C4] focus:border-[#0F1F4B] focus:ring-[#0F1F4B]',
                    ]"
                />
                <p v-if="errors.password" class="mt-1.5 text-xs font-semibold text-[#FF4D2D]">{{ errors.password }}</p>
            </div>

            <!-- 3. 하단 취소 및 등록 버튼 세션 -->
            <div class="flex flex-col gap-3 border-t border-[#F5F0E6] pt-6 sm:flex-row sm:items-center sm:justify-end">
                <p
                    v-if="submitError"
                    class="w-full rounded-xl border border-[#FF4D2D]/30 bg-[#FFF4F0] px-4 py-3 text-sm font-medium text-[#FF4D2D] sm:w-auto"
                >
                    {{ submitError }}
                </p>
                <div class="flex items-center justify-end gap-3">
                    <button
                        type="button"
                        @click="handleCancel"
                        :disabled="isSubmitting"
                        class="rounded-xl bg-[#E8E4DA] px-6 py-3 text-sm font-semibold text-[#4F5B72] transition-all hover:bg-[#D9D4C7] hover:text-[#0F1F4B] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        :disabled="isSubmitting"
                        class="rounded-xl bg-[#FF4D2D] px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#e03d1e] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {{ isSubmitting ? '등록 중...' : '게시글 등록' }}
                    </button>
                </div>
            </div>
        </form>
    </main>
    <p
        v-if="submitError"
        class="w-full rounded-xl border border-[#FF4D2D]/30 bg-[#FFF4F0] px-4 py-3 text-sm font-medium text-[#FF4D2D] sm:w-auto"
    >
        {{ submitError }}
    </p>
</template>
