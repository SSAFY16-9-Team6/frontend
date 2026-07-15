<script setup lang="ts">
import { ref } from 'vue'

const messages = ref([
    {
        id: 1,
        role: 'assistant',
        text: '안녕하세요! 부산 여행 도우미예요 😊\n해운대, 광안리, 영도, 전포동, 맛집, 숙박, 축제 등 궁금한 것을 물어보세요!',
    },
])
const isOpen = ref(false)
const inputValue = ref('')
const isSending = ref(false)

const quickReplies = ref(['해운대 추천', '영도 핫플', '맛집 알려줘', '축제 일정'])

function toggleChatbot() {
    isOpen.value = !isOpen.value
}

async function sendMessage(text: string) {
    if (!text.trim() || isSending.value) return

    const userMessageText = text.trim()
    inputValue.value = ''

    messages.value.push({
        id: Date.now(),
        role: 'user',
        text: userMessageText,
    })

    isSending.value = true

    try {
        const response = await fetch('https://backend-xxf5.onrender.com/api/v1/chatbot/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({
                message: userMessageText,
            }),
        })

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
        }

        const resData = await response.json()

        if (resData && resData.success && resData.data && resData.data.reply) {
            messages.value.push({
                id: Date.now() + 1,
                role: 'assistant',
                text: resData.data.reply,
            })
        } else {
            throw new Error('Invalid response structure')
        }
    } catch (error) {
        console.error('챗봇 응답 수신 실패:', error)
        messages.value.push({
            id: Date.now() + 1,
            role: 'assistant',
            text: '죄송합니다. 서버가 응답하지 않습니다. 잠시 후 다시 이용해주세요.',
        })
    } finally {
        isSending.value = false
    }
}

function handleSend() {
    sendMessage(inputValue.value)
}

function handleQuickReply(reply: string) {
    sendMessage(reply)
}
</script>

<template>
    <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        <aside
            v-if="isOpen"
            class="flex h-[600px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[28px] border border-[#E6D8C4] bg-white shadow-2xl"
        >
            <!-- 헤더 영역 -->
            <div class="flex items-center justify-between bg-[#0F1F4B] px-5 py-4 text-white">
                <div class="flex items-center gap-3">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF4D2D]">
                        <span class="text-xl">🤖</span>
                    </div>
                    <div>
                        <h3 class="text-[16px] font-bold leading-tight">부산 여행 도우미</h3>
                        <p class="text-[11px] text-[#A3B1CC] mt-0.5">AI 챗봇 · 24시간 상담</p>
                    </div>
                </div>
                <button
                    type="button"
                    class="rounded-full p-1 text-[#A3B1CC] hover:bg-white/10 hover:text-white transition-colors"
                    @click="toggleChatbot"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>

            <!-- 메시지 영역 -->
            <div class="flex-1 overflow-y-auto bg-[#F9F8F6] p-5 space-y-4">
                <div
                    v-for="msg in messages"
                    :key="msg.id"
                    class="flex gap-2.5"
                    :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                    <!-- 챗봇 프로필 아이콘 -->
                    <div
                        v-if="msg.role !== 'user'"
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0F1F4B] text-sm"
                    >
                        <span>🤖</span>
                    </div>

                    <span
                        :class="[
                            msg.role === 'user'
                                ? 'bg-[#FF4D2D] text-white rounded-[18px] rounded-tr-sm'
                                : 'bg-[#EAE5DA] text-[#16233E] rounded-[18px] rounded-tl-sm',
                        ]"
                        class="inline-block max-w-[75%] px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-line"
                    >
                        {{ msg.text }}
                    </span>
                </div>

                <!-- 답변 로딩 애니메이션 -->
                <div v-if="isSending" class="flex gap-2.5 justify-start">
                    <div
                        class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0F1F4B] text-sm"
                    >
                        <span>🤖</span>
                    </div>
                    <span
                        class="inline-block bg-[#EAE5DA] text-[#16233E] rounded-[18px] rounded-tl-sm px-4 py-2.5 text-sm shadow-sm"
                    >
                        <span class="flex gap-1 items-center justify-center h-4">
                            <span
                                class="w-1.5 h-1.5 bg-[#5C6B85] rounded-full animate-bounce"
                                style="animation-delay: 0ms"
                            ></span>
                            <span
                                class="w-1.5 h-1.5 bg-[#5C6B85] rounded-full animate-bounce"
                                style="animation-delay: 150ms"
                            ></span>
                            <span
                                class="w-1.5 h-1.5 bg-[#5C6B85] rounded-full animate-bounce"
                                style="animation-delay: 300ms"
                            ></span>
                        </span>
                    </span>
                </div>
            </div>

            <!-- 푸터 영역 (추천 키워드 + 입력창) -->
            <div class="border-t border-[#E6D8C4] bg-white p-4">
                <!-- 추천 키워드 슬라이드 -->
                <div class="mb-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    <button
                        v-for="reply in quickReplies"
                        :key="reply"
                        type="button"
                        class="flex-shrink-0 rounded-full bg-[#FAF9F6] border border-[#EAE5DA] px-4 py-2 text-xs font-medium text-[#5C6B85] hover:bg-[#EAE5DA] hover:text-[#0F1F4B] transition-colors"
                        @click="handleQuickReply(reply)"
                    >
                        {{ reply }}
                    </button>
                </div>

                <!-- 텍스트 필드 -->
                <form @submit.prevent="handleSend" class="flex items-center gap-2">
                    <input
                        v-model="inputValue"
                        type="text"
                        placeholder="메시지를 입력하세요..."
                        class="flex-1 rounded-full bg-[#FAF9F6] border border-[#EAE5DA] px-4 py-3 text-sm text-[#16233E] placeholder-[#8A866F] focus:border-[#FF4D2D] focus:outline-none"
                    />
                    <button
                        type="submit"
                        :disabled="isSending || !inputValue.trim()"
                        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors"
                        :class="
                            inputValue.trim() && !isSending
                                ? 'bg-[#FF4D2D] text-white hover:bg-[#e03d1e]'
                                : 'bg-[#FFB5A6] text-white cursor-not-allowed'
                        "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="transform rotate-45 -translate-x-0.5 translate-y-0.5"
                        >
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                </form>
            </div>
        </aside>

        <!-- 토글 버튼 -->
        <button
            type="button"
            class="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#FF4D2D] text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#e03d1e]"
            @click="toggleChatbot"
        >
            <span class="flex items-center justify-center">
                <svg
                    v-if="!isOpen"
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path>
                </svg>
                <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </span>
        </button>
    </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
