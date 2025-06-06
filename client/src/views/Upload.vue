<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-tabs v-model="activeTab" color="primary" centered>
            <v-tab value="single">Сингл</v-tab>
            <v-tab value="album">Альбом</v-tab>
          </v-tabs>
          <v-card-text>
            <v-window v-model="activeTab">
              <v-window-item value="single">
                <v-form @submit.prevent="uploadSingle" ref="singleForm">
                  <v-text-field
                    v-model="singleData.artist"
                    label="Исполнитель"
                    required
                    :rules="[v => !!v || 'Исполнитель обязателен']"
                  ></v-text-field>
                  <v-text-field
                    v-model="singleData.title"
                    label="Название трека"
                    required
                    :rules="[v => !!v || 'Название обязательно']"
                  ></v-text-field>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="singleData.release_date"
                        label="Дата выпуска"
                        readonly
                        v-bind="props"
                        required
                        :rules="[v => !!v || 'Дата обязательна']"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="singleDate"></v-date-picker>
                  </v-menu>
                  <v-select
                    v-model="singleData.genre"
                    label="Жанр"
                    :items="genres"
                    required
                    :rules="[v => !!v || 'Жанр обязателен']"
                  ></v-select>
                  <v-file-input
                    v-model="singleData.audio"
                    label="Аудиофайл"
                    accept="audio/*"
                    prepend-icon="mdi-music"
                    required
                    :rules="[v => !!v || 'Аудио обязательно']"
                  ></v-file-input>
                  <v-file-input
                    v-model="singleData.cover"
                    label="Обложка"
                    accept="image/*"
                    prepend-icon="mdi-image"
                  ></v-file-input>
                  <v-btn color="primary" type="submit" block :disabled="loading">Загрузить сингл</v-btn>
                </v-form>
              </v-window-item>
              <v-window-item value="album">
                <v-form @submit.prevent="uploadAlbum" ref="albumForm">
                  <v-text-field
                    v-model="albumData.artist"
                    label="Исполнитель"
                    required
                    :rules="[v => !!v || 'Исполнитель обязателен']"
                  ></v-text-field>
                  <v-text-field
                    v-model="albumData.title"
                    label="Название альбома"
                    required
                    :rules="[v => !!v || 'Название обязательно']"
                  ></v-text-field>
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-text-field
                        v-model="albumData.release_date"
                        label="Дата выпуска"
                        readonly
                        v-bind="props"
                        required
                        :rules="[v => !!v || 'Дата обязательна']"
                      ></v-text-field>
                    </template>
                    <v-date-picker v-model="albumDate"></v-date-picker>
                  </v-menu>
                  <v-select
                    v-model="albumData.genre"
                    label="Жанр"
                    :items="genres"
                    required
                    :rules="[v => !!v || 'Жанр обязателен']"
                  ></v-select>
                  <v-file-input
                    v-model="albumData.cover"
                    label="Обложка"
                    accept="image/*"
                    prepend-icon="mdi-image"
                  ></v-file-input>
                  <v-card v-for="(track, index) in albumData.tracks" :key="index" class="mb-2">
                    <v-card-text>
                      <v-text-field
                        v-model="track.title"
                        label="Название трека"
                        required
                        :rules="[v => !!v || 'Название обязательно']"
                      ></v-text-field>
                      <v-file-input
                        v-model="track.audio"
                        label="Аудиофайл"
                        accept="audio/*"
                        prepend-icon="mdi-music"
                        required
                        :rules="[v => !!v || 'Аудио обязательно']"
                      ></v-file-input>
                      <v-btn color="red" @click="removeTrack(index)">Удалить трек</v-btn>
                    </v-card-text>
                  </v-card>
                  <v-btn color="secondary" @click="addTrack" block class="mb-4">Добавить трек</v-btn>
                  <v-btn color="primary" type="submit" block :disabled="loading">Загрузить альбом</v-btn>
                </v-form>
              </v-window-item>
            </v-window>
            <v-btn color="secondary" to="/" block class="mt-4">На главную</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

export default {
  data() {
    return {
      activeTab: 'single',
      loading: false,
      genres: ['Поп', 'Рок', 'Хип-хоп', 'Электроника', 'Классика', 'Джаз'],
      singleData: {
        artist: '',
        title: '',
        release_date: '',
        genre: '',
        audio: null,
        cover: null,
      },
      singleDate: null,
      albumData: {
        artist: '',
        title: '',
        release_date: '',
        genre: '',
        cover: null,
        tracks: [{ title: '', audio: null }],
      },
      albumDate: null,
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  watch: {
    singleDate(newDate) {
      this.singleData.release_date = newDate ? new Date(newDate).toISOString().split('T')[0] : ''
    },
    albumDate(newDate) {
      this.albumData.release_date = newDate ? new Date(newDate).toISOString().split('T')[0] : ''
    },
  },
  mounted() {
    if (this.authStore.user) {
      this.singleData.artist = this.authStore.user.username
      this.albumData.artist = this.authStore.user.username
    }
  },
  methods: {
    addTrack() {
      this.albumData.tracks.push({ title: '', audio: null })
    },
    removeTrack(index) {
      this.albumData.tracks.splice(index, 1)
    },
    async uploadSingle() {
      if (!this.$refs.singleForm.validate()) return
      if (!this.authStore.token) {
        this.$root.showSnackbar('Пожалуйста, войдите в аккаунт', 'error')
        this.$router.push('/login')
        return
      }
      if (/[%&]/.test(this.singleData.title) || /[%&]/.test(this.singleData.artist) || /[%&]/.test(this.singleData.genre)) {
        this.$root.showSnackbar('Название, исполнитель и жанр не должны содержать % или &', 'error')
        this.loading = false
        return
      }
      this.loading = true
      const formData = new FormData()
      formData.append('title', this.singleData.title)
      formData.append('artist', this.singleData.artist)
      formData.append('release_date', this.singleData.release_date)
      formData.append('genre', this.singleData.genre)
      formData.append('audio', this.singleData.audio)
      if (this.singleData.cover) formData.append('cover', this.singleData.cover)
      try {
        const response = await axios.post('http://localhost:5000/api/tracks/single', formData, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        console.log('Upload response:', response.data)
        this.$refs.singleForm.reset()
        this.$root.showSnackbar('Сингл успешно загружен')
        this.$router.push('/')
      } catch (error) {
        console.error('Upload single error:', error.response?.data || error.message)
        this.$root.showSnackbar(`Ошибка загрузки сингла: ${error.response?.data?.error || error.message}`, 'error')
      }
      this.loading = false
    },
    async uploadAlbum() {
      if (!this.$refs.albumForm.validate()) return
      if (!this.authStore.token) {
        this.$root.showSnackbar('Пожалуйста, войдите в аккаунт', 'error')
        this.$router.push('/login')
        return
      }
      if (/[%&]/.test(this.albumData.title) || /[%&]/.test(this.albumData.artist) || /[%&]/.test(this.albumData.genre)) {
        this.$root.showSnackbar('Название, исполнитель и жанр не должны содержать % или &', 'error')
        this.loading = false
        return
      }
      this.loading = true
      const formData = new FormData()
      formData.append('title', this.albumData.title)
      formData.append('artist', this.albumData.artist)
      formData.append('release_date', this.albumData.release_date)
      formData.append('genre', this.albumData.genre)
      formData.append('tracks', JSON.stringify(this.albumData.tracks.map(t => ({ title: t.title }))))
      this.albumData.tracks.forEach((track, index) => {
        formData.append('audio', track.audio)
      })
      if (this.albumData.cover) formData.append('cover', this.albumData.cover)
      try {
        const response = await axios.post('http://localhost:5000/api/albums', formData, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        console.log('Upload response:', response.data)
        this.$refs.albumForm.reset()
        this.$root.showSnackbar('Альбом успешно загружен')
        this.$router.push('/')
      } catch (error) {
        console.error('Upload album error:', error.response?.data || error.message)
        this.$root.showSnackbar(`Ошибка загрузки альбома: ${error.response?.data?.error || error.message}`, 'error')
      }
      this.loading = false
    }
  },
}
</script>

<style scoped>
/* Основная карточка */
.v-card {
  padding: 16px;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* background-color: #ffffff; */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
}

/* Вкладки */
.v-tab {
  font-weight: 500;
  color: #424242;
  text-transform: none;
  border-radius: 8px;
  padding: 8px 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.v-tab--selected {
  /* color: #1976D2 !important; */
  background-color: rgba(25, 118, 210, 0.1);
}

.v-tabs {
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 16px;
}

/* Поля ввода и селекты */
.v-text-field,
.v-select,
.v-file-input {
  border-radius: 8px !important;
  margin-bottom: 16px;
}

.v-text-field input,
.v-select .v-select__selection,
.v-file-input input {
  color: #424242;
}

.v-text-field--outlined fieldset,
.v-select--outlined fieldset,
.v-file-input--outlined fieldset {
  border-color: #bdbdbd;
  transition: border-color 0.3s ease;
}

.v-text-field--outlined:hover fieldset,
.v-select--outlined:hover fieldset,
.v-file-input--outlined:hover fieldset {
  border-color: #1976D2;
}

.v-text-field--focused fieldset,
.v-select--focused fieldset,
.v-file-input--focused fieldset {
  border-color: #1976D2 !important;
  box-shadow: 0 0 0 1px #1976D2;
}

/* Кнопки */
.v-btn {
  border-radius: 12px !important;
  text-transform: none;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.v-btn:hover {
  transform: scale(1.02);
}

.v-btn--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.v-btn--primary {
  background-color: #1976D2 ;
  color: #ffffff !;
}

.v-btn--primary:hover {
  background-color: #1565C0 ;
}

.v-btn--secondary {
  background-color: #424242 ;
  color: #ffffff !important;
}

.v-btn--secondary:hover {
  background-color: #212121 ;
}

.v-btn--red {
  background-color: #D32F2F !important;
  color: #ffffff !important;
}

.v-btn--red:hover {
  background-color: #B71C1C !important;
}

/* Даты */
.v-date-picker {
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Треки альбома */
.v-card.mb-2 {
  border-radius: 8px !important;
  padding: 12px;
  /* background-color: #f5f5f5; */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card.mb-2:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Адаптивность */
@media (max-width: 600px) {
  .v-card {
    padding: 8px;
  }
  .v-tab {
    padding: 6px 12px;
  }
  .v-btn {
    font-size: 14px;
  }
}
</style>