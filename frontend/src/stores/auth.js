import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null, 
    token: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email,
          password,
        })
        this.user = {
          id: response.data.userId,
          username: response.data.username || 'User',
          email,
          avatar: response.data.avatar || 'https://via.placeholder.com/40',
        }
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        return true
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message)
        return false
      }
    },
    async register(email, password, username) {
        try {
          const response = await axios.post('http://localhost:5000/api/auth/register', {
            email,
            password,
            username,
          })
          this.user = {
            id: response.data.userId,
            username,
            email,
            avatar: 'https://via.placeholder.com/40',
          }
          this.token = response.data.token
          localStorage.setItem('token', this.token)
          return true
        } catch (error) {
          console.error('Registration failed:', error.response?.data || error.message)
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