// src/data/mock.ts
import type { Place, Post, ChatMsg } from '../types'

export const PLACES: Place[] = [
  {
    id: '1',
    name: '해운대 해수욕장',
    region: '해운대구',
    category: '관광지',
    description: '부산 최고의 대표 해수욕장. 광활한 백사장과 우뚝 솟은 고층 빌딩숲이 완벽한 조화를 이루는 명실상부한 명소입니다.',
    address: '부산광역시 해운대구 우동',
    image: 'photo-1507525428034-b723cf961d3e',
    mapx: '129.160417',
    mapy: '35.158714'
  },
  {
    id: '2',
    name: '감천문화마을',
    region: '사하구',
    category: '관광지',
    description: '앞바다가 훤히 내려다보이는 산자락에 아기자기한 파스텔톤 집들이 모여 있어 한국의 산토리니로 불리는 예술 마을입니다.',
    address: '부산광역시 사하구 감내2로 203',
    image: 'photo-1542291026-7eec264c27ff',
    mapx: '129.009472',
    mapy: '35.097561'
  },
  {
    id: '3',
    name: '영도 흰여울문화마을',
    region: '영도구',
    category: '관광지',
    description: '가파른 절벽 위에 세워진 하얀 주택들과 그 옆으로 끝없이 펼쳐지는 에메랄드빛 남해 바다가 압도적인 감성을 선사합니다.',
    address: '부산광역시 영도구 영선동4가',
    image: 'photo-1547826039-bfc35e0f1ea8',
    mapx: '129.044141',
    mapy: '35.078652'
  },
  {
    id: '4',
    name: '송도 구름산책로 & 해수욕장',
    region: '서구',
    category: '관광지',
    description: '푸른 서구 바다 위를 시원하게 활공하는 송도 해상케이블카와 짜릿한 바다 위 공중 산책길을 즐길 수 있습니다.',
    address: '부산광역시 서구 송도해변로 100',
    image: 'photo-1501854140801-50d01698950b',
    mapx: '129.017596',
    mapy: '35.076214'
  },
  {
    id: '5',
    name: '초량 168계단 이바구길',
    region: '동구',
    category: '관광지',
    description: '동구 도심 속 높은 산복도로 경사지를 기막히게 오르내리는 모노레일과 근현대사의 숨결을 가득 품은 레트로 골목입니다.',
    address: '부산광역시 동구 초량동',
    image: 'photo-1506744038136-46273834b3fb',
    mapx: '129.035319',
    mapy: '35.114714'
  },
  {
    id: '6',
    name: '서면 전포 카페 거리',
    region: '부산진구',
    category: '문화시설',
    description: '기존 공구 골목의 낡은 분위기를 젊은 예술가들과 개성 만점 바리스타들이 뉴트로 핫플레이스로 재탄생시켰습니다.',
    address: '부산광역시 부산진구 전포대로',
    image: 'photo-1554118811-1e0d58224f24',
    mapx: '129.066441',
    mapy: '35.155891'
  },
  {
    id: '7',
    name: '오륙도 하늘전망대',
    region: '남구',
    category: '관광지',
    description: '남구 바다 절벽 끝자락에 설치된 유리 스카이워크를 거닐며 세찬 파도와 신비로운 오륙도의 자태를 가장 가까이서 감상할 수 있습니다.',
    address: '부산광역시 남구 용호동 936',
    image: 'photo-1533105079780-92b9be482077',
    mapx: '129.123847',
    mapy: '35.093496'
  },
  {
    id: '8',
    name: '자갈치 & 남포 수산시장',
    region: '중구',
    category: '쇼핑',
    description: '오이소, 보이소, 사이소! 활력이 흘러 넘치는 대한민국 대표 수산시장으로 싱싱한 제철 해산물의 먹방 재미가 쏠쏠합니다.',
    address: '부산광역시 중구 자갈치해안로 52',
    image: 'photo-1534482421-64566f976cfa',
    mapx: '129.030521',
    mapy: '35.096732'
  },
  {
    id: '9',
    name: '금정산자락 화명수목원',
    region: '북구',
    category: '관광지',
    description: '맑은 낙동강 줄기를 굽어보는 북구 금정산 맑은 기슭에 위치하여 푸른 온실 식물들과 한적한 피톤치드 힐링을 선사합니다.',
    address: '부산광역시 북구 화명동 산45',
    image: 'photo-1448375240586-882707db888b',
    mapx: '129.038142',
    mapy: '35.253301'
  }
]

export const FEATURED_PLACES: Place[] = [PLACES[0], PLACES[2]]

export const EVENTS = [
  { id: 'e1', title: '해운대 밤바다 산책', date: '7/20' },
  { id: 'e2', title: '광안리 야시장', date: '7/25' },
]

export const INIT_POSTS: Post[] = [
  {
    id: 'p1',
    title: '바다 보면서 힐링했어요',
    content: '해운대에서 맛있는 음식도 먹고 산책도 했습니다.',
    category: 'nature',
    author: '민지',
    likes: 12,
    image: 'photo-1500375592092-40eb2168fd21',
  },
  {
    id: 'p2',
    title: '감천문화마을 너무 예뻤어요',
    content: '사진 찍기 좋은 장소였어요.',
    category: 'culture',
    author: '준호',
    likes: 8,
    image: 'photo-1519046904884-53103b34b206',
  },
]

export const CHATBOT_RESPONSES: ChatMsg[] = [
  { id: 'c1', role: 'bot', text: '부산 여행지 추천해드릴게요.' },
  { id: 'c2', role: 'user', text: '해운대 쪽으로 가고 싶어요.' },
  { id: 'c3', role: 'bot', text: '해운대 마린시티 산책로와 야경이 잘 어울려요.' },
]