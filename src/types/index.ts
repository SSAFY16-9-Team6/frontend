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
  mapx: string
  mapy: string
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
