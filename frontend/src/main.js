// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vuetify from './plugins/vuetify'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import * as mdiIcons from '@mdi/js'

const app = createApp(App)
const pinia = createPinia()

app.use(vuetify)
app.use(pinia)
app.use(router)


const authStore = useAuthStore()
authStore.checkAuth()

app.mount('#app')
