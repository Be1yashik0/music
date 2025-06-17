import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async verifyToken() {
      if (!this.token) {
        this.logout()
        return false
      }
      try {
        const response = await axios.get('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${this.token}` },
        })
        this.user = response.data.user
        return true
      } catch (error) {
        console.error('Token verification failed:', error.response?.data || error.message)
        this.logout()
        return false
      }
    },
    logout() {
      this.user = null
      this.token = null
      localStorage.removeItem('token')
    },
  
    checkAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        // Здесь можно добавить запрос к API для получения данных пользователя
        this.user = {
          id: 1,
          username: 'User',
          email: 'test@example.com',
          avatar: 'https://via.placeholder.com/40',
        }
      }
    },
  },
})