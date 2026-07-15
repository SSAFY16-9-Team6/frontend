export interface ViewType {
  id: string
  label: string
  path: string
}

export interface CategoryInfo {
  id: string
  name: string
  color: string
}

export interface Place {
  id: string
  name: string
  category: string
  region: string
  address: string
  description: string
  image: string
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
