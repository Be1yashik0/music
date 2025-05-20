<script>
import axios from 'axios'

export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false,
    }
  },
  methods: {
    async login() {
      this.loading = true
      try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          email: this.email,
          password: this.password,
        })
        console.log('Login successful:', response.data)
        this.$router.push('/')
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message)
        alert('Ошибка входа: ' + (error.response?.data?.message || 'Попробуйте снова'))
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<template>
 <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title class="text-h5">Вход</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                required
                :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Неверный формат email']"
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Пароль"
                type="password"
                required
                :rules="[v => !!v || 'Пароль обязателен', v => v.length >= 6 || 'Минимум 6 символов']"
              ></v-text-field>
              <v-btn color="primary" type="submit" block :disabled="loading">Войти</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
