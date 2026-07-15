<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CATEGORIES } from '../data/constants.ts'
import type { Post } from '../data/mockData.ts'
import SearchBar from '../components/ui/SearchBar.vue'
import PostCard from '../components/ui/PostCard.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const posts = ref<Post[]>([])
const searchQuery = ref<string>('')
const selectedCategoryId = ref<string>('all')
const isLoading = ref(false)
const errorMessage = ref('')

const selectCategory = (id: string) => {
    selectedCategoryId.value = id
}

const fetchPosts = async () => {
    isLoading.value = true
    errorMessage.value = ''

    try {
        const response = await fetch('https://backend-xxf5.onrender.com/api/v1/posts?page=1&size=20', {
            method: 'GET',
            headers: {
                accept: 'application/json',
            },
        })

        if (!response.ok) {
            throw new Error(`게시글 목록 조회 실패 (${response.status})`)
        }

        const result = await response.json()

        if (result?.success && Array.isArray(result?.data?.items)) {
            posts.value = result.data.items.map((item: any) => ({
                postId: item.postId,
                title: item.title,
                content: item.content,
                categoryId: String(item.categoryId),
                author: item.author || '익명',
                createdAt: item.createdAt,
                likeCount: item.likeCount ?? 0,
                views: item.viewCount ?? 0,
            }))
            return
        }

        throw new Error('게시글 목록 응답 형식이 올바르지 않습니다.')
    } catch (error) {
        console.error('게시글 목록 로드 실패:', error)
        errorMessage.value = error instanceof Error ? error.message : '게시글 목록을 불러오지 못했습니다.'
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchPosts()
})

const filteredPosts = computed(() => {
    return posts.value.filter((post) => {
        const matchesCategory = selectedCategoryId.value === 'all' || post.categoryId === selectedCategoryId.value

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

        <div v-if="isLoading" class="py-16 text-center text-[#4F5B72]">게시글을 불러오는 중입니다...</div>

        <div
            v-else-if="errorMessage"
            class="rounded-2xl border border-[#FF4D2D]/30 bg-[#FFF4F0] px-4 py-5 text-sm text-[#FF4D2D]"
        >
            {{ errorMessage }}
        </div>

        <div v-else class="space-y-4">
            <div v-if="filteredPosts.length === 0" class="py-16 text-center text-[#4F5B72]">
                <p class="text-lg font-medium">검색 결과나 일치하는 게시글이 없습니다.</p>
                <p class="mt-1 text-sm text-[#8A95A5]">다른 검색어를 입력하거나 카테고리를 변경해 보세요.</p>
            </div>

            <PostCard v-for="post in filteredPosts" :key="post.postId" :post="post" @select="handleSelect" />
        </div>
    </section>
</template>
