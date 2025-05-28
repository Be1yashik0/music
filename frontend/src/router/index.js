import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Playlists from '../views/Playlists.vue' // Добавляем импорт
import Search from '../views/Search.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
  },
  {
    path: '/upload',
    name: 'Upload',
    component: () => import('../views/Upload.vue'),
  },

  { path: '/playlists', component: Playlists }, 
  { path: '/search', component: Search },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
