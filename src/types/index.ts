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
  rating: number
  description: string
  image: string
}

export interface Post {
  id: string
  title: string
  content: string
  category: string
  author: string
  likes: number
  image: string
}

export interface ChatMsg {
  id: string
  role: 'user' | 'bot'
  text: string
}
