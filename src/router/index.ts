// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BoardView from '../views/BoardView.vue'
import BoardDetailView from '../views/BoardDetailView.vue'
import BoardUpdateView from '../views/BoardUpdateView.vue'
import BoardCreateView from '../views/BoardCreateView.vue'
import TourismView from '../views/TourismView.vue'
import MapView from '../views/MapView.vue'
import StatsView from '../views/StatsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/tourism',
    name: 'tourism',
    component: TourismView
  },
  {
    path: '/map',
    name: 'map',
    component: MapView
  },
  {
    path: '/board',
    name: 'board',
    component: BoardView
  },
  {
    path: '/board/:id',
    name: 'post-detail',
    component: BoardDetailView,
    props: true // URL 파라미터(:id)를 컴포넌트의 props로 바로 전달
  },
  {
    path: '/board/edit/:id',
    name: 'post-edit',
    component: BoardUpdateView,
    props: true
  },
  {
    path: '/board/create',
    name: 'board-create',
    component: BoardCreateView
  },
  {
    path: '/stats',
    name: 'stats',
    component: StatsView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router