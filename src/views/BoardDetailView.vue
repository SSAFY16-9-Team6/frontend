<script setup lang="ts">
import { computed, ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { CATEGORIES } from '../data/constants'
import type { Post } from '../types/index'

const router = useRouter()
const route = useRoute()

const post = ref<Post | null>(null)
const isLoading = ref<boolean>(true)
const isLiked = ref<boolean>(false)
const isDeleting = ref<boolean>(false)
const isLiking = ref<boolean>(false)

const isPasswordModalOpen = ref<boolean>(false)
const modalMode = ref<'edit' | 'delete' | null>(null)
const inputPassword = ref<string>('')
const passwordInputRef = ref<HTMLInputElement | null>(null)
const passwordError = ref<string>('')
const errorMessage = ref<string>('')

const mapPostFromApi = (data: any): Post => ({
    postId: data.postId,
    categoryId: String(data.categoryId),
    title: data.title,
    content: data.content,
    author: data.author || '익명',
    createdAt: data.createdAt,
    likeCount: data.likeCount ?? 0,
    views: data.viewCount ?? 0,
})

const fetchPostDetail = async () => {
    isLoading.value = true
    errorMessage.value = ''
    post.value = null

    const postId = String(route.params.id || '')
    if (!postId) {
        errorMessage.value = '잘못된 게시글 경로입니다.'
        isLoading.value = false
        return
    }

    try {
        const response = await fetch(`https://backend-xxf5.onrender.com/api/v1/posts/${postId}`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`게시글 조회 실패 (${response.status})`)
        }

        const result = await response.json()

        if (result?.success && result?.data) {
            post.value = mapPostFromApi(result.data)
            return
        }

        throw new Error('게시글 응답 형식이 올바르지 않습니다.')
    } catch (error) {
        console.error('게시글 상세 조회 실패:', error)
        errorMessage.value = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchPostDetail()
})

watch(
    () => route.params.id,
    () => {
        fetchPostDetail()
    },
)

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

const handleLike = async () => {
    if (!post.value || isLiking.value) return

    try {
        isLiking.value = true

        const response = await fetch(`https://backend-xxf5.onrender.com/api/v1/posts/${post.value.postId}/likes`, {
            method: 'POST',
            headers: {
                accept: 'application/json',
            },
        })

        const result = await response.json().catch(() => null)

        if (response.ok && result?.success) {
            if (result?.data) {
                if (post.value) {
                    post.value.likeCount = result.data.likeCount
                }
            }
            isLiked.value = true
            return
        }

        console.error('좋아요 실패:', result)
    } catch (error) {
        console.error('좋아요 요청 실패:', error)
    } finally {
        isLiking.value = false
    }
}

const openEditModal = () => {
    modalMode.value = 'edit'
    openPasswordModal()
}

const openDeleteModal = () => {
    modalMode.value = 'delete'
    openPasswordModal()
}

const openPasswordModal = () => {
    isPasswordModalOpen.value = true
    inputPassword.value = ''
    passwordError.value = ''
    isDeleting.value = false

    nextTick(() => {
        passwordInputRef.value?.focus()
    })
}

const closePasswordModal = () => {
    isPasswordModalOpen.value = false
    modalMode.value = null
    inputPassword.value = ''
    passwordError.value = ''
    isDeleting.value = false
}

const handlePasswordSubmit = async () => {
    if (!post.value || !modalMode.value) return

    if (!inputPassword.value.trim()) {
        passwordError.value = '비밀번호를 입력해주세요.'
        return
    }

    try {
        isDeleting.value = true
        passwordError.value = ''

        const verifyResponse = await fetch(
            `https://backend-xxf5.onrender.com/api/v1/posts/${post.value.postId}/verify-password`,
            {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: inputPassword.value }),
            },
        )

        const verifyResult = await verifyResponse.json().catch(() => null)

        if (!verifyResponse.ok || !verifyResult?.success || !verifyResult.data?.verified) {
            passwordError.value = verifyResult?.message || '비밀번호가 일치하지 않습니다.'
            return
        }
        const deleteResponse = await fetch(
            `https://backend-xxf5.onrender.com/api/v1/posts/${post.value.postId}`,
            {
                method: 'DELETE',
                headers: {
                    accept: 'application/json',
                },
            },
        )

        const deleteResult = await deleteResponse.json().catch(() => null)

        if (!deleteResponse.ok || !deleteResult?.success || !deleteResult?.data?.ok) {
            throw new Error(deleteResult?.message || `삭제 실패 (${deleteResponse.status})`)
        }

        closePasswordModal()
        goBack()
    } catch (error) {
        console.error('게시글 삭제 실패:', error)
        passwordError.value =
            error instanceof Error
                ? error.message
                : '삭제 중 서버 오류가 발생했습니다.'
    } finally {
        isDeleting.value = false
    }
}
</script>

<template>
    <div v-if="isLoading" class="py-20 text-center text-[#4F5B72]">
        <p class="text-lg">게시글을 불러오는 중입니다...</p>
    </div>

    <div v-else-if="errorMessage" class="py-20 text-center">
        <p class="text-lg font-semibold text-[#4F5B72]">{{ errorMessage }}</p>
        <button @click="goBack" class="mt-4 text-[#0F1F4B] underline font-medium">게시판 목록으로 이동</button>
    </div>

    <div v-else-if="!post" class="py-20 text-center">
        <p class="text-lg font-semibold text-[#4F5B72]">존재하지 않거나 삭제된 게시글입니다.</p>
        <button @click="goBack" class="mt-4 text-[#0F1F4B] underline font-medium">게시판 목록으로 이동</button>
    </div>

    <main v-else class="relative mx-auto max-w-3xl px-4 py-10">
        <div class="mb-8 flex items-center justify-between">
            <button
                @click="goBack"
                class="group flex items-center gap-2 text-sm font-medium text-[#8A866F] transition-colors hover:text-[#0F1F4B]"
            >
                <svg
                    class="h-4 w-4 transform transition-transform group-hover:-translate-x-1 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M19 12H5m7-7l-7 7 7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                목록으로 돌아가기
            </button>
        </div>

        <article class="rounded-[24px] bg-white p-6 sm:p-10 shadow-sm">
            <div class="mb-4">
                <span
                    v-if="categoryInfo"
                    :class="['rounded-xl px-3 py-1 text-xs font-bold text-white', categoryInfo.color]"
                >
                    {{ categoryInfo.name }}
                </span>
                <span v-else class="rounded-md bg-gray-400 px-3 py-1.5 text-xs font-bold text-white"> 기타 </span>
            </div>

            <h1 class="font-heading text-2xl sm:text-3xl leading-snug text-[#0F1F4B] mb-6">
                {{ post.title }}
            </h1>

            <div
                class="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5F0E6] pb-6 text-xs text-[#8A95A5]"
            >
                <div class="flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-1.5">
                        <span class="font-bold text-[#4F5B72]">{{ post.author || '익명' }}</span>
                    </div>

                    <span class="h-3 w-[1px] bg-[#E6D8C4]"></span>

                    <div class="flex items-center gap-1">
                        <svg
                            class="h-3.5 w-3.5 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect
                                x="3"
                                y="4"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <line
                                x1="16"
                                y1="2"
                                x2="16"
                                y2="6"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <line
                                x1="8"
                                y1="2"
                                x2="8"
                                y2="6"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <line
                                x1="3"
                                y1="10"
                                x2="21"
                                y2="10"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span class="font-medium">{{ formattedDate }}</span>
                    </div>

                    <span class="h-3 w-[1px] bg-[#E6D8C4]"></span>

                    <div class="flex items-center gap-1">
                        <svg
                            class="h-3.5 w-3.5 shrink-0 stroke-current"
                            fill="none"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span class="font-medium text-[#4F5B72]">조회수 {{ post.views || 0 }}</span>
                    </div>
                </div>
            </div>

            <div class="font-body text-base leading-8 text-[#4F5B72] whitespace-pre-wrap py-10">
                {{ post.content }}
            </div>

            <div class="mt-6 flex items-center justify-between gap-4 border-t border-[#F5F0E6] pt-6">
                <button
                    @click="handleLike"
                    :disabled="isLiking"
                    :class="[
                        'inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 border-0 whitespace-nowrap shrink-0',
                        isLiked
                            ? 'bg-rose-50 text-[#FF4D2D]'
                            : 'bg-[#E8E4DA] text-[#4F5B72] hover:bg-[#D9D4C7] hover:text-[#0F1F4B]',
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

                <div class="flex items-center gap-2">
                    <button
                        @click="openEditModal"
                        class="inline-flex items-center gap-1.5 rounded-xl bg-[#E8E4DA] px-4 py-2.5 text-sm font-semibold text-[#4F5B72] hover:bg-[#D9D4C7] hover:text-[#0F1F4B] transition-all border-0 whitespace-nowrap shrink-0"
                    >
                        <svg
                            class="h-4 w-4 shrink-0 fill-none stroke-current"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                stroke-width="2.2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                        <span class="leading-none">수정</span>
                    </button>

                    <button
                        @click="openDeleteModal"
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
                    <div
                        class="w-full max-w-md transform rounded-3xl bg-white p-6 shadow-xl transition-all border border-[#F5F0E6]"
                    >
                        <div class="mb-4 flex items-center justify-between">
                            <h3 class="text-lg font-bold text-[#0F1F4B]">
                                {{ modalMode === 'edit' ? '수정 비밀번호 확인' : '삭제 비밀번호 확인' }}
                            </h3>
                            <button
                                @click="closePasswordModal"
                                class="rounded-lg p-1 text-[#8A95A5] hover:bg-[#F5F0E6] hover:text-[#0F1F4B]"
                            >
                                <svg
                                    class="h-5 w-5 stroke-current fill-none"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18 6L6 18M6 6l12 12"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div class="mb-6">
                            <p class="mb-3 text-sm text-[#4F5B72]">
                                게시글을 {{ modalMode === 'edit' ? '수정' : '삭제' }}하려면 작성 시 설정한 비밀번호를
                                입력해주세요.
                            </p>

                            <input
                                ref="passwordInputRef"
                                v-model="inputPassword"
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                class="w-full rounded-xl border border-[#E6D8C4] px-4 py-3 text-sm text-[#0F1F4B] placeholder-[#8A95A5] focus:border-[#0F1F4B] focus:outline-none focus:ring-1 focus:ring-[#0F1F4B]"
                                @keyup.enter="handlePasswordSubmit"
                            />

                            <p v-if="passwordError" class="mt-2 text-xs font-semibold text-[#FF4D2D]">
                                {{ passwordError }}
                            </p>
                        </div>

                        <div class="flex items-center justify-end gap-2">
                            <button
                                @click="closePasswordModal"
                                class="rounded-xl bg-[#E8E4DA] px-4 py-2.5 text-sm font-semibold text-[#4F5B72] hover:bg-[#D9D4C7] transition-all"
                            >
                                취소
                            </button>
                            <button
                                @click="handlePasswordSubmit"
                                :disabled="isDeleting"
                                class="rounded-xl bg-[#FF4D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-all shadow-sm disabled:opacity-60"
                            >
                                {{ isDeleting ? '처리 중...' : '확인' }}
                            </button>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
