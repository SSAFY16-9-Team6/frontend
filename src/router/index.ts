// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'
import PostDetailView from '../views/BoardDetailView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/board',
    name: 'board',
    component: BoardView
  },
  {
    path: '/board/:id',
    name: 'post-detail',
    component: PostDetailView,
    props: true // URL 파라미터(:id)를 컴포넌트의 props로 바로 전달
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router