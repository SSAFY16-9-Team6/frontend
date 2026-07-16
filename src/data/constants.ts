import type { CategoryInfo } from '../types'

export const CATEGORIES: CategoryInfo[] = [
    { id: '12', name: '관광지', color: 'bg-[#FF4D2D]', total: 351 },
    { id: '14', name: '문화시설', color: 'bg-[#0BA09B]', total: 123 },
    { id: '15', name: '축제공연행사', color: 'bg-[#0F1F4B]', total: 72 },
    { id: '25', name: '여행코스', color: 'bg-[#F59E0B]', total: 22 },
    { id: '28', name: '레포츠', color: 'bg-[#8B5CF6]', total: 65 },
    { id: '32', name: '숙박', color: 'bg-[#3B82F6]', total: 140 },
    { id: '38', name: '쇼핑', color: 'bg-[#EC4899]', total: 986 },
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

export const DISTRICTS_WEATHER_GRIDS: Record<string, { nx: number; ny: number }> = {
  '중구': { nx: 97, ny: 74 },
  '서구': { nx: 97, ny: 74 },
  '동구': { nx: 98, ny: 75 },
  '영도구': { nx: 98, ny: 74 },
  '부산진구': { nx: 97, ny: 75 },
  '동래구': { nx: 98, ny: 76 },
  '남구': { nx: 98, ny: 75 },
  '북구': { nx: 96, ny: 76 },
  '해운대구': { nx: 99, ny: 75 },
  '사하구': { nx: 96, ny: 74 },
  '금정구': { nx: 98, ny: 77 },
  '강서구': { nx: 96, ny: 76 },
  '연제구': { nx: 98, ny: 76 },
  '수영구': { nx: 99, ny: 75 },
  '사상구': { nx: 96, ny: 75 },
  '기장군': { nx: 100, ny: 77 }
}

export const img = (name: string) => `https://images.unsplash.com/${name}?auto=format&fit=crop&w=900&q=80`

export const catById = (id: string) => CATEGORIES.find((c) => c.id === id)?.name ?? '기타'
