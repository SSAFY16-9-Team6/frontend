import type { Place, Post, ChatMsg } from '../types'

export const PLACES: Place[] = [
  { id: '1', name: '해운대 마린시티 산책로', category: 'nature', region: '해운대', rating: 4.8, description: '바다 풍경과 야경이 아름다워요.', image: 'photo-1507525428034-b723cf961d3e' },
  { id: '2', name: '부산국제시장', category: 'food', region: '남포동', rating: 4.6, description: '전통 음식과 활기찬 분위기를 느낄 수 있어요.', image: 'photo-1542838132-92c53300491e' },
  { id: '3', name: '감천문화마을', category: 'culture', region: '사하구', rating: 4.7, description: '예쁜 골목과 예술 작품을 만날 수 있어요.', image: 'photo-1499856871958-5b9627545d1a' },
]

export const FEATURED_PLACES: Place[] = [PLACES[0], PLACES[2]]

export const EVENTS = [
  { id: 'e1', title: '해운대 밤바다 산책', date: '7/20' },
  { id: 'e2', title: '광안리 야시장', date: '7/25' },
]

export const INIT_POSTS: Post[] = [
  {
    postId: 1,
    title: '바다 보면서 힐링했어요',
    content: '해운대에서 맛있는 음식도 먹고 산책도 했습니다.',
    categoryId: '12', // 관광지 카테고리 (id: '12')
    author: '익명',
    createdAt: '2026-07-15T10:00:00Z',
    likeCount: 12,
    views: 45
  },
  {
    postId: 2,
    title: '감천문화마을 너무 예뻤어요',
    content: '사진 찍기 좋은 장소였어요. 알록달록한 집들이 아주 인상 깊었습니다.',
    categoryId: '14', // 문화시설 카테고리 (id: '14')
    author: '익명',
    createdAt: '2026-07-14T08:30:00Z',
    likeCount: 8,
    views: 32
  }
]

export const CHATBOT_RESPONSES: ChatMsg[] = [
  { id: 'c1', role: 'bot', text: '부산 여행지 추천해드릴게요.' },
  { id: 'c2', role: 'user', text: '해운대 쪽으로 가고 싶어요.' },
  { id: 'c3', role: 'bot', text: '해운대 마린시티 산책로와 야경이 잘 어울려요.' },
]
