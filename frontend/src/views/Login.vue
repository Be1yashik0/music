<script>
import { useAuthStore } from '../stores/auth'

export default {
  data() {
    return {
      activeTab: 'login',
      loading: false,
      loginData: {
        email: '',
        password: '',
      },
      registerData: {
        username: '',
        email: '',
        password: '',
      },
    }
  },
  methods: {
    async login() {
      if (!this.$refs.loginForm.validate()) return
      this.loading = true
      const authStore = useAuthStore()
      const success = await authStore.login(this.loginData.email, this.loginData.password)
      if (success) {
        this.$router.push('/')
      } else {
        alert('Ошибка входа: неверный email или пароль')
      }
      this.loading = false
    },
    async register() {
      if (!this.$refs.registerForm.validate()) return
      this.loading = true
      const authStore = useAuthStore()
      const success = await authStore.register(this.registerData.email, this.registerData.password, this.registerData.username)
      if (success) {
        this.$router.push('/')
      } else {
        alert('Ошибка регистрации: возможно, email уже занят')
      }
      this.loading = false
    },
  },
}
</script>

<template>
 <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-tabs v-model="activeTab" color="primary" centered>
            <v-tab value="login">Вход</v-tab>
            <v-tab value="register">Регистрация</v-tab>
          </v-tabs>

          <v-card-text>
            <!-- Форма входа -->
            <v-window v-model="activeTab">
              <v-window-item value="login">
                <v-form @submit.prevent="login" ref="loginForm">
                  <v-text-field
                    v-model="loginData.email"
                    label="Email"
                    type="email"
                    required
                    :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Неверный формат email']"
                  ></v-text-field>
                  <v-text-field
                    v-model="loginData.password"
                    label="Пароль"
                    type="password"
                    required
                    :rules="[v => !!v || 'Пароль обязателен', v => v.length >= 6 || 'Минимум 6 символов']"
                  ></v-text-field>
                  <v-btn color="primary" type="submit" block :disabled="loading">Войти</v-btn>
                </v-form>
              </v-window-item>

              <!-- Форма регистрации -->
              <v-window-item value="register">
                <v-form @submit.prevent="register" ref="registerForm">
                  <v-text-field
                    v-model="registerData.username"
                    label="Имя пользователя"
                    required
                    :rules="[v => !!v || 'Имя обязательно', v => v.length >= 3 || 'Минимум 3 символа']"
                  ></v-text-field>
                  <v-text-field
                    v-model="registerData.email"
                    label="Email"
                    type="email"
                    required
                    :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Неверный формат email']"
                  ></v-text-field>
                  <v-text-field
                    v-model="registerData.password"
                    label="Пароль"
                    type="password"
                    required
                    :rules="[v => !!v || 'Пароль обязателен', v => v.length >= 6 || 'Минимум 6 символов']"
                  ></v-text-field>
                  <v-btn color="primary" type="submit" block :disabled="loading">Зарегистрироваться</v-btn>
                </v-form>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
