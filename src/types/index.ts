export interface ViewType {
    id: string
    label: string
    path: string
}

// src/types/index.ts
export interface CategoryInfo {
    id: string
    name: string
    color: string
    total?: number
}

export interface Place {
    id: string
    name: string
    category: string
    categoryId?: string
    region: string
    address: string
    description: string
    image: string
    mapx: string
    mapy: string
}

export interface Post {
    postId: number
    title: string
    content: string
    categoryId: string
    author: string
    createdAt: string
    likeCount: number
    views: number
}

export interface ChatMsg {
    id: string
    role: 'user' | 'bot'
    text: string
}
