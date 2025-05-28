<script>
import { useAuthStore } from '../stores/auth'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const route = useRoute()
    return { route }
  },
  mounted() {
    if (this.route.query.token) {
      const authStore = useAuthStore()
      authStore.user = {
        id: this.route.query.userId,
        username: this.route.query.username,
        email: this.route.query.email,
        avatar: this.route.query.avatar,
      }
      authStore.token = this.route.query.token
      localStorage.setItem('token', authStore.token)
      this.$router.push('/')
    }
  },
}
</script>

<template>
 <v-container class="login-container">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="login-card">
          <v-card-title class="text-h5 text-center">Вход</v-card-title>
          <v-card-text class="text-center">
            <v-btn 
            href="http://localhost:5000/auth/google"
            class="auth-btn google-btn" @click="loginWithGoogle">
              <img src="@/assets/icons/google-icon.svg" alt="Google" class="auth-icon" />
              Вход через Google
            </v-btn>
            <v-btn href="http://localhost:5000/auth/yandex" class="auth-btn yandex-btn" @click="loginWithYandex">
              <img src="@/assets/icons/Yandex_icon.svg" alt="Yandex" class="auth-icon" />
              Вход через Яндекс
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.full-height {
  height: 100vh;
}
.login-card {
  border-radius: 20px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  padding: 20px;
}
.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px !important;
  margin: 10px 0;
  padding: 10px 20px;
  font-size: 16px;
  text-transform: none;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  width: 100%;
}
.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.google-btn {
  background-color: #4285f4 !important;
  color: white !important;
}
.google-btn:hover {
  background-color: #3267d6 !important;
}
.yandex-btn {
  background-color: #000000 !important;
  color: #ffffff !important;
}
.yandex-btn:hover {
  background-color: #bd0b0b !important;
}
.auth-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}
</style>