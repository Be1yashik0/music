import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Favorites from '../views/Favorites.vue'
import Search from '../views/Search.vue'
import Admin from '../views/Admin.vue'

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

  { 
    path: '/favorites', 
    name: 'Favorites', 
    component: Favorites 
  },
  
  { 
    path: '/search', 
    component: Search 
  },


   {
    path: '/admin',
    name: 'Admin',
    component: Admin,
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
