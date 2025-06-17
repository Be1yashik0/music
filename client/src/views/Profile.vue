<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="profile-card">
          <v-card-title class="text-h5 text-center">Редактирование профиля</v-card-title>
          <v-card-text>
            <div class="text-center mb-4">
              <v-avatar size="100" class="profile-avatar">
                <v-img
                  :src="avatarPreview || authStore.user?.avatar || 'https://via.placeholder.com/100'"
                  alt="User Avatar"
                ></v-img>
              </v-avatar>
            </div>
            <v-form ref="form" @submit.prevent="updateProfile" v-model="valid">
              <v-text-field
                v-model="userData.username"
                label="Имя пользователя"
                required
                :rules="[v => !!v || 'Имя пользователя обязательно']"
                class="rounded-field"
              ></v-text-field>
              <v-text-field
                v-model="userData.email"
                label="Email"
                required
                :rules="[v => !!v || 'Email обязателен', v => /.+@.+\..+/.test(v) || 'Email некорректен']"
                class="rounded-field"
              ></v-text-field>
              <!-- <v-file-input
                v-model="userData.avatar"
                label="Фото профиля"
                accept="image/jpeg,image/png,image/jpg"
                prepend-icon="mdi-camera"
                @change="previewAvatar"
                :rules="[v => !v || v.size < 10 * 1024 * 1024 || 'Фото должно быть меньше 10 МБ']"
                class="rounded-field"
              ></v-file-input> -->
              <v-btn color="primary" type="submit" block :disabled="loading || !valid" class="rounded-btn">Сохранить</v-btn>
              <v-btn color="secondary" to="/" block class="mt-4 rounded-btn">На главную</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Profile',
  data() {
    return {
      loading: false,
      valid: false,
      avatarPreview: null,
      userData: {
        username: '',
        email: '',
        avatar: null,
      },
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  async mounted() {
    if (!this.authStore.user || !this.authStore.token) {
      this.$root.showSnackbar('Пожалуйста, войдите в аккаунт', 'error')
      this.$router.push('/login')
      return
    }
    try {
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${this.authStore.token}` },
      })
      this.userData = {
        username: response.data.username,
        email: response.data.email,
        avatar: null,
      }
      this.authStore.user.avatar = response.data.avatar
      this.avatarPreview = this.authStore.user.avatar
    } catch (error) {
      this.$root.showSnackbar(`Ошибка загрузки профиля: ${error.response?.data?.error || error.message}`, 'error')
    }
  },
  methods: {
    previewAvatar(file) {
      if (file) {
        this.avatarPreview = URL.createObjectURL(file)
      } else {
        this.avatarPreview = this.authStore.user?.avatar || null
      }
    },
    async updateProfile() {
      if (!this.$refs.form.validate()) return
      this.loading = true
      const formData = new FormData()
      formData.append('username', this.userData.username)
      formData.append('email', this.userData.email)
      if (this.userData.avatar) {
        console.log('Uploading avatar:', this.userData.avatar)
        formData.append('avatar', this.userData.avatar)
      }
      try {
        const response = await axios.put('http://localhost:5000/api/auth/profile', formData, {
          headers: {
            Authorization: `Bearer ${this.authStore.token}`,
            'Content-Type': 'multipart/form-data',
          },
        })
        this.authStore.user = {
          id: this.authStore.user.id,
          username: response.data.username,
          email: response.data.email,
          avatar: response.data.avatar,
        }
        this.avatarPreview = response.data.avatar
        this.$root.showSnackbar('Профиль успешно обновлён')
      } catch (error) {
        console.error('Profile update error:', error.response?.data || error.message)
        this.$root.showSnackbar(`Ошибка обновления профиля: ${error.response?.data?.error || error.message}`, 'error')
      }
      this.loading = false
    },
  },
}
</script>

<style scoped>
/* Основная карточка */
.profile-card {
  padding: 24px;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* background-color: #ffffff; */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

/* Заголовок */
.text-h5 {
  color: #424242;
  font-weight: 500;
}

/* Аватар */
.profile-avatar {
  border: 2px solid #1976D2;
  transition: border-color 0.3s ease;
}

.profile-avatar:hover {
  border-color: #1565C0;
}

/* Поля ввода */
.rounded-field {
  border-radius: 8px !important;
  margin-bottom: 16px;
}

.rounded-field input {
  color: #424242;
}

.rounded-field--outlined fieldset {
  border-color: #bdbdbd;
  transition: border-color 0.3s ease;
}

.rounded-field--outlined:hover fieldset {
  border-color: #1976D2;
}

.rounded-field--focused fieldset {
  border-color: #1976D2 !important;
  box-shadow: 0 0 0 1px #1976D2;
}

/* Кнопки */
.rounded-btn {
  border-radius: 12px !important;
  text-transform: none;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.rounded-btn:hover {
  transform: scale(1.02);
}

.rounded-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rounded-btn--primary {
  background-color: #1976D2;
  color: #ffffff !important;
}

.rounded-btn--primary:hover {
  background-color: #1565C0 !important;
}

.rounded-btn--secondary {
  background-color: #424242 !important;
  color: #ffffff !important;
}

.rounded-btn--secondary:hover {
  background-color: #212121 !important;
}

/* Адаптивность */
@media (max-width: 600px) {
  .profile-card {
    padding: 16px;
  }
  .profile-avatar {
    size: 80;
  }
  .rounded-btn {
    font-size: 14px;
  }
}
</style>