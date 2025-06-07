<template>
  <v-container fluid>
    <v-app-bar app color="primary" dark class="rounded-app-bar">
      <v-btn icon @click="drawer = !drawer" class="menu-toggle rounded-btn" fixed top left>
        <v-icon v-if="!drawer"><application-menu theme="outline" size="24" /></v-icon>
        <v-icon v-else><close theme="outline" size="24"/></v-icon>
      </v-btn>
      <v-toolbar-title class="title">T-shka</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon to="/" class="rounded-btn">
        <v-icon><home theme="outline" size="24" /></v-icon>
      </v-btn>
      <v-menu v-if="authStore.user" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="rounded-btn">
            <v-avatar size="32">
              <v-img
                :src="authStore.user.avatar || 'http://localhost:5000/uploads/avatars/default.jpg'"
                alt="User Avatar"
                @error="console.error('Avatar load error for user in menu:', authStore.user.email, 'URL:', authStore.user.avatar || 'http://localhost:5000/uploads/avatars/default.jpg')"
              ></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-card class="rounded-card">
          <v-card-text>
            <div class="text-center">
              <v-avatar size="64" class="mb-2">
                <v-img
                  :src="authStore.user.avatar || 'http://localhost:5000/uploads/avatars/default.jpg'"
                  alt="User Avatar"
                  @error="console.error('Avatar load error for user in menu card:', authStore.user.email, 'URL:', authStore.user.avatar || 'http://localhost:5000/uploads/avatars/default.jpg')"
                ></v-img>
              </v-avatar>
              <div>{{ authStore.user.username }}</div>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>Профиль</v-list-item-title>
            </v-list-item>
            <v-list-item @click="authStore.logout" class="logOutBtn">
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <v-btn v-else to="/login" color="white" text class="rounded-btn">Войти</v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" app temporary class="rounded-drawer">
      <v-list>
        <v-list-item to="/" exact>
          <v-list-item-icon>
            Главная
          </v-list-item-icon>
        </v-list-item>
        <v-list-item to="/favorites" v-if="authStore.user">
          <v-list-item-icon>
            Избранное
          </v-list-item-icon>
        </v-list-item>
        <v-list-item to="/upload" v-if="authStore.user">
          <v-list-item-icon>
            Загрузить музыку
          </v-list-item-icon>
        </v-list-item>
        <v-spacer></v-spacer>
        <v-list v-if="authStore.user && authStore.user.is_admin">
          <v-divider></v-divider>
          <v-list-item to="/admin">
            <v-list-item-title>Администрирование</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <h1 class="mb-4 rounded-title">Администрирование</h1>
        <v-tabs v-model="activeTab" background-color="primary" dark class="rounded-tabs">
          <v-tab value="tracks">Треки</v-tab>
          <v-tab value="albums">Альбомы</v-tab>
          <v-tab value="users">Пользователи</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <!-- Вкладка треков -->
          <v-window-item value="tracks">
            <v-row>
              <v-col v-for="track in tracks" :key="track.track_id" cols="12" sm="6" md="5" lg="2">
                <v-card class="track-card rounded-card">
                  <v-img
                    :src="`http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`"
                    height="150"
                    @error="console.error('Failed to load cover:', `http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`)"
                  ></v-img>
                  <v-card-title class="text-subtitle-1">{{ track.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ track.artist }}</v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="red" icon @click="deleteTrack(track.track_id)" class="rounded-btn buttn">
                      <delete theme="outline" size="24" />
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Вкладка альбомов -->
          <v-window-item value="albums">
            <v-row>
              <v-col v-for="album in albums" :key="album.album_id" cols="12" sm="6" md="4" lg="2">
                <v-card class="album-card rounded-card">
                  <v-img
                    :src="`http://localhost:5000${album.cover_url || '/uploads/covers/default.jpg'}`"
                    height="150"
                    @error="console.error('Failed to load album cover:', `http://localhost:5000${album.cover_url || '/uploads/covers/default.jpg'}`)"
                  ></v-img>
                  <v-card-title class="text-subtitle-1">{{ album.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ album.artist }}</v-card-subtitle>
                  <v-card-text class="text-caption">Количество треков: {{ album.track_count }}</v-card-text>
                  <v-card-actions>
                    <v-btn color="red" icon @click="deleteAlbum(album.album_id)" class="rounded-btn buttn">
                      <delete theme="outline" size="24" />
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Вкладка пользователей -->
          <v-window-item value="users">
            <v-row>
              <v-col v-for="user in users" :key="user.user_id" cols="12" sm="6" md="4" lg="2">
                <v-card class="user-card rounded-card">
                  <!-- <v-avatar size="150" class="ma-3">
                    <v-img
                      :src="`http://localhost:5000${user.avatar || '/uploads/avatars/default.jpg'}`"
                      alt="User Avatar"
                      @error="console.error('Avatar load error for user:', user.email, 'URL:', `http://localhost:5000${user.avatar || '/uploads/avatars/default.jpg'}`)"
                    ></v-img>
                  </v-avatar> -->
                  <v-card-title class="text-subtitle-1">{{ user.username }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ user.email }}</v-card-subtitle>
                  <v-card-actions>
                    <v-btn color="red" icon @click="deleteUser(user.user_id)" class="rounded-btn buttn" :disabled="user.is_admin">
                      <delete theme="outline" size="24" />
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
  </v-container>
</template>

<script>
import { useAuthStore } from '../stores/auth'
import axios from 'axios'

export default {
  name: 'Admin',
  data() {
    return {
      drawer: false,
      activeTab: 'tracks', 
      tracks: [],
      albums: [],
      users: [],
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  watch: {
    activeTab(newTab) {
      console.log('Tab changed to:', newTab) 
    },
  },
  async mounted() {
    console.log('Auth store user:', this.authStore.user)
    if (!this.authStore.user || !this.authStore.user.is_admin) {
      console.log('Access denied: is_admin =', this.authStore.user ? this.authStore.user.is_admin : 'no user')
      this.$root.showSnackbar('Доступ запрещён: только для администраторов', 'error')
      this.$router.push('/')
      return
    }
    await this.fetchTracks()
    await this.fetchAlbums()
    await this.fetchUsers()
  },
  methods: {
    async fetchTracks() {
      try {
        const response = await axios.get('http://localhost:5000/api/tracks', {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.tracks = response.data
        console.log('Fetched tracks:', this.tracks)
      } catch (error) {
        this.$root.showSnackbar(`Ошибка загрузки треков: ${error.response?.data?.error || error.message}`, 'error')
      }
    },
    async fetchAlbums() {
      try {
        const response = await axios.get('http://localhost:5000/api/albums', {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.albums = response.data
        console.log('Fetched albums:', this.albums)
      } catch (error) {
        this.$root.showSnackbar(`Ошибка загрузки альбомов: ${error.response?.data?.error || error.message}`, 'error')
      }
    },
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.users = response.data
        console.log('Fetched users:', this.users)
      } catch (error) {
        this.$root.showSnackbar(`Ошибка загрузки пользователей: ${error.response?.data?.error || error.message}`, 'error')
      }
    },
    async deleteTrack(trackId) {
      if (confirm('Вы уверены, что хотите удалить этот трек?')) {
        try {
          await axios.delete(`http://localhost:5000/api/tracks/${trackId}`, {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          })
          this.tracks = this.tracks.filter(track => track.track_id !== trackId)
          this.$root.showSnackbar('Трек успешно удалён')
        } catch (error) {
          this.$root.showSnackbar(`Ошибка удаления трека: ${error.response?.data?.error || error.message}`, 'error')
        }
      }
    },
    async deleteAlbum(albumId) {
      if (confirm('Вы уверены, что хотите удалить этот альбом? Все связанные треки также будут удалены.')) {
        try {
          await axios.delete(`http://localhost:5000/api/albums/${albumId}`, {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          })
          this.albums = this.albums.filter(album => album.album_id !== albumId)
          this.tracks = this.tracks.filter(track => track.album_id !== albumId)
          this.$root.showSnackbar('Альбом успешно удалён')
        } catch (error) {
          this.$root.showSnackbar(`Ошибка удаления альбома: ${error.response?.data?.error || error.message}`, 'error')
        }
      }
    },
    async deleteUser(userId) {
      if (confirm('Вы уверены, что хотите удалить этого пользователя? Все его треки и альбомы также будут удалены.')) {
        try {
          await axios.delete(`http://localhost:5000/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          })
          this.users = this.users.filter(user => user.user_id !== userId)
          this.tracks = this.tracks.filter(track => track.user_id !== userId)
          this.albums = this.albums.filter(album => album.user_id !== userId)
          this.$root.showSnackbar('Пользователь успешно удалён')
        } catch (error) {
          this.$root.showSnackbar(`Ошибка удаления пользователя: ${error.response?.data?.error || error.message}`, 'error')
        }
      }
    },
  },
}
</script>

<style scoped>
.logOutBtn {
  background-color: #c20a0ac0;
}
.menu-toggle {
  z-index: 1001;
}
.menu-icon {
  width: 24px;
  height: 24px;
}
.track-card, .album-card, .user-card {
  position: relative;
  transition: transform 0.2s;
}
.track-card:hover, .album-card:hover, .user-card:hover {
  transform: translateY(-5px);
}
.rounded-app-bar {
  padding: 0 !important;
  width: 100vw !important;
  left: 0 !important;
  right: 0 !important;
}
.rounded-btn {
  border-radius: 50px !important;
}
.buttn {
  width: 30px; 
  height: 30px;
  background-color: transparent;
  opacity: 0.7; 
  transition: opacity 0.2s;
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0);
}
.buttn:hover {
  background-color: #dbd9d994; 
  opacity: 1;
}
.rounded-text-field {
  border-radius: 12px !important;
}
.rounded-card {
  border-radius: 18px !important;
  overflow: hidden;
}
.rounded-tabs {
  border-radius: 12px !important;
}
.rounded-drawer {
  margin: 12px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  border-radius: 10px !important;
}
.rounded-title {
  border-radius: 12px;
  padding: 10px;
}
</style>