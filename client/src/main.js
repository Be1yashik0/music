// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import * as mdiIcons from '@mdi/js'
import * as components from '@icon-park/vue-next' // Импортируем все компоненты
import '@icon-park/vue-next/styles/index.css'

const app = createApp(App)
const pinia = createPinia()


app.use(vuetify, {
  theme: {
    defaultTheme: 'dark', // Изначально тёмная тема
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          background: '#FFFFFF',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#BB86FC',
          secondary: '#03DAC6',
          accent: '#CE93D8',
          error: '#CF6679',
          info: '#BB86FC',
          success: '#03DAC6',
          warning: '#FB8C00',
          background: '#121212',
        },
      },
    },
  },
})

app.use(pinia)
app.use(router)


const authStore = useAuthStore()
authStore.checkAuth()


for (const [name, component] of Object.entries(components)) {
    app.component(name, component)
  }
app.mount('#app')
