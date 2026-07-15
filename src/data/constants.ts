import type { CategoryInfo } from '../types'

export const CATEGORIES: CategoryInfo[] = [
  { id: '12', name: '관광지', color: 'bg-[#FF4D2D]' },
  { id: '14', name: '문화시설', color: 'bg-[#0BA09B]' },
  { id: '15', name: '축제공연행사', color: 'bg-[#0F1F4B]' },
  { id: '25', name: '여행코스', color: 'bg-[#0BA09B]' },
  { id: '28', name: '레포츠', color: 'bg-[#FF4D2D]' },
  { id: '32', name: '숙박', color: 'bg-[#0F1F4B]' },
  { id: '38', name: '쇼핑', color: 'bg-[#0BA09B]' },
]

export const DISTRICTS = [
  { code: '110', name: '중구' },
  { code: '140', name: '서구' },
  { code: '170', name: '동구' },
  { code: '200', name: '영도구' },
  { code: '230', name: '부산진구' },
  { code: '260', name: '동래구' },
  { code: '290', name: '남구' },
  { code: '320', name: '북구' },
  { code: '350', name: '해운대구' },
  { code: '380', name: '사하구' },
]


export const img = (name: string) => `https://images.unsplash.com/${name}?auto=format&fit=crop&w=900&q=80`

export const catById = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
