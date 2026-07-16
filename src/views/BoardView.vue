<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { CATEGORIES } from '../data/constants.ts'
import SearchBar from '../components/ui/SearchBar.vue'
import PostCard from '../components/ui/PostCard.vue'
import { useRouter } from 'vue-router'
import type { Post } from '../types/index'

const router = useRouter()

const posts = ref<Post[]>([])
const searchQuery = ref<string>('')
const selectedCategoryId = ref<string>('all')
const isLoading = ref(false)
const errorMessage = ref('')
const currentPage = ref(1)
const pageSize = 20
const totalPages = ref(1)
const totalCount = ref(0)

const selectCategory = (id: string) => {
    selectedCategoryId.value = id
}

const mapPost = (item: any): Post => ({
    postId: item.postId,
    title: item.title,
    content: item.content,
    categoryId: String(item.categoryId),
    author: item.author || '익명',
    createdAt: item.createdAt,
    likeCount: item.likeCount ?? 0,
    views: item.viewCount ?? 0,
})

const updatePagination = (data: any) => {
    totalCount.value = data?.totalCount ?? 0
    totalPages.value = Math.max(1, Math.ceil(totalCount.value / pageSize))
}

const fetchPosts = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch(
            `https://backend-xxf5.onrender.com/api/v1/posts?page=${currentPage.value}&size=${pageSize}`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            },
        )

        if (!response.ok) {
            throw new Error(`게시글 목록 조회 실패 (${response.status})`)
        }

        const result = await response.json()

        if (result?.success && Array.isArray(result?.data?.items)) {
            posts.value = result.data.items.map(mapPost)
            updatePagination(result.data)
            return
        }

        throw new Error('게시글 목록 응답 형식이 올바르지 않습니다.')
    } catch (error) {
        console.error('게시글 목록 로드 실패:', error)
        posts.value = []
        totalPages.value = 1
        totalCount.value = 0
        errorMessage.value =
            error instanceof Error
                ? error.message
                : '게시글 목록을 불러오지 못했습니다.'
    } finally {
        isLoading.value = false
    }
}

const fetchSearchPosts = async (keyword: string) => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch(
            `https://backend-xxf5.onrender.com/api/v1/posts/search?keyword=${encodeURIComponent(
                keyword,
            )}&page=${currentPage.value}&size=${pageSize}`,
            {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                },
            },
        )

        if (!response.ok) {
            throw new Error(`검색 요청 실패 (${response.status})`)
        }

        const result = await response.json()

        if (result?.success && Array.isArray(result?.data?.items)) {
            posts.value = result.data.items.map(mapPost)
            updatePagination(result.data)
            return
        }

        posts.value = []
        totalPages.value = 1
        totalCount.value = 0
    } catch (error) {
        console.error('검색 실패:', error)
        posts.value = []
        totalPages.value = 1
        totalCount.value = 0
        errorMessage.value =
            error instanceof Error
                ? error.message
                : '검색 중 오류가 발생했습니다.'
    } finally {
        isLoading.value = false
    }
}

watch(
    searchQuery,
    (value) => {
        currentPage.value = 1
        const keyword = value.trim()
        if (keyword === '') {
            fetchPosts()
        } else {
            fetchSearchPosts(keyword)
        }
    },
)

const filteredPosts = computed(() => {
    return posts.value.filter((post) => {
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

function handleSelect(postId: string | number) {
    router.push({ name: 'post-detail', params: { id: String(postId) } })
}

const goCreatePage = () => {
    router.push('/board/create')
}

const changePage = (page: number) => {
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
    const keyword = searchQuery.value.trim()
    if (keyword === '') {
        fetchPosts()
    } else {
        fetchSearchPosts(keyword)
    }
}

onMounted(() => {
    fetchPosts()
})
</script>

<template>
    <section class="mx-auto max-w-7xl px-6 py-8">
        <span class="text-xs font-semibold text-[#FF4D2D] uppercase tracking-wider">커뮤니티</span>

        <div class="mb-6 flex items-center justify-between">
            <h2 class="font-heading text-2xl text-[#0F1F4B] m-0">여행 이야기 게시판</h2>

            <button
                @click="goCreatePage"
                class="inline-flex items-center gap-1.5 rounded-xl bg-[#FF4D2D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#e03d1e] transition-all shadow-sm"
            >
                <svg class="h-4 w-4 stroke-current fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <span>글쓰기</span>
            </button>
        </div>

        <div class="mb-6">
            <SearchBar v-model="searchQuery" placeholder="제목이나 내용으로 검색해보세요" />
        </div>

        <div class="mb-8 flex flex-wrap gap-2 border-b border-[#E6D8C4] pb-4">
            <button
                @click="selectCategory('all')"
                :class="[
                    'rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200',
                    selectedCategoryId === 'all'
                        ? 'bg-[#0F1F4B] text-white'
                        : 'bg-[#e8e4da] text-[#8a866f] hover:text-[#0F1F4B]',
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
                        : 'bg-[#e8e4da] text-[#8a866f] hover:text-[#0F1F4B]',
                ]"
            >
                {{ category.name }}
            </button>
        </div>

        <div v-if="isLoading" class="py-16 text-center text-[#4F5B72]">
            게시글을 불러오는 중입니다...
        </div>

        <div
            v-else-if="errorMessage"
            class="rounded-2xl border border-[#FF4D2D]/30 bg-[#FFF4F0] px-4 py-5 text-sm text-[#FF4D2D]"
        >
            {{ errorMessage }}
        </div>

        <div v-else class="space-y-4">
            <div v-if="filteredPosts.length === 0" class="py-16 text-center text-[#4F5B72]">
                <p class="text-lg font-medium">검색 결과나 일치하는 게시글이 없습니다.</p>
                <p class="mt-1 text-sm text-[#8A95A5]">
                    다른 검색어를 입력하거나 카테고리를 변경해 보세요.
                </p>
            </div>

            <PostCard
                v-for="post in filteredPosts"
                :key="post.postId"
                :post="post"
                @select="handleSelect"
            />
        </div>

        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
            <button
                type="button"
                class="rounded-full border border-[#E6D8C4] bg-white px-4 py-2 text-sm font-semibold text-[#4F5B72] disabled:opacity-50"
                :disabled="currentPage === 1"
                @click="changePage(currentPage - 1)"
            >
                이전
            </button>

            <span class="px-3 py-2 text-sm font-medium text-[#4F5B72]">
                {{ currentPage }} / {{ totalPages }}
            </span>

            <button
                type="button"
                class="rounded-full border border-[#E6D8C4] bg-white px-4 py-2 text-sm font-semibold text-[#4F5B72] disabled:opacity-50"
                :disabled="currentPage === totalPages"
                @click="changePage(currentPage + 1)"
            >
                다음
            </button>
        </div>
    </section>
</template>