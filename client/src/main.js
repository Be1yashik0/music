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

app.use(vuetify)
app.use(pinia)
app.use(router)


const authStore = useAuthStore()
authStore.checkAuth()


for (const [name, component] of Object.entries(components)) {
    app.component(name, component)
  }
app.mount('#app')
