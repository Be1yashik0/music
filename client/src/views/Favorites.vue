<template>
  <v-container fluid>
    <v-app-bar app color="primary" dark class="rounded-app-bar">
      <v-btn icon @click="drawer = !drawer" class="menu-toggle rounded-btn" fixed top left>
        <v-icon v-if="!drawer"><application-menu theme="outline" size="24" /></v-icon>
        <v-icon v-else><close theme="outline" size="24" /></v-icon>
      </v-btn>
      <v-toolbar-title class="title">Избранное</v-toolbar-title>
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
        
        <v-list-item to="/upload" v-if="authStore.user">
          <v-list-item-icon>
            Загрузить музыку
          </v-list-item-icon>
        </v-list-item>
        <v-list-item to="/favorites" v-if="authStore.user">
          <v-list-item-icon>
            Избранное
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
        <h1 class="mb-4 rounded-title">Избранное</h1>
        <v-tabs v-model="activeTab" background-color="primary" dark class="rounded-tabs">
          <v-tab value="tracks">Треки</v-tab>
          <v-tab value="albums">Альбомы</v-tab>
        </v-tabs>

        <v-window v-model="activeTab" class="mt-4">
          <!-- Вкладка треков -->
          <v-window-item value="tracks">
            <v-row>
              <v-col v-for="track in favoriteTracks" :key="track.track_id" cols="12" sm="6" md="5" lg="2">
                <v-card class="track-card rounded-card">
                  <v-img
                    :src="`http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`"
                    height="150"
                    @error="console.error('Failed to load cover:', `http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`)"
                  ></v-img>
                  <v-btn icon @click="removeFromFavorites(track, false) "   class="remove_buttn">
                      <dislike-two theme="two-tone" size="24" :fill="[,'#ff0002']"/>
                    </v-btn>
                  <v-card-title class="text-subtitle-1">{{ track.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ track.artist }}</v-card-subtitle>
                 
                  <v-card-actions>
                    <!-- <v-btn color="primary" text @click="playTrack(track)" class="rounded-btn">Воспроизвести</v-btn> -->
                    
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <!-- Вкладка альбомов -->
          <v-window-item value="albums" >
            <v-row>
              <v-col v-for="album in favoriteAlbums" :key="album.album_id" cols="12" sm="6" md="4" lg="2">
                <v-card class="album-card rounded-card">
                  <v-img
                    :src="`http://localhost:5000${album.cover_url || '/uploads/covers/default.jpg'}`"
                    height="150"
                    @error="console.error('Failed to load album cover:', `http://localhost:5000${album.cover_url || '/uploads/covers/default.jpg'}`)"
                  ></v-img>
                  <v-btn icon @click="removeFromFavorites(album, true) "   class="remove_buttn">
                    <dislike-two theme="two-tone" size="24" :fill="[,'#ff0002']"/>
                  </v-btn>
                  <v-card-title class="text-subtitle-1">{{ album.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ album.artist }}</v-card-subtitle>
                  <!-- <v-card-text class="text-caption">Количество треков: {{ album.track_count  }}</v-card-text> -->
                  <v-card-actions>
                    <!-- <v-btn color="primary" text @click="playAlbum(album)" class="rounded-btn">Воспроизвести</v-btn> -->
                    
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
  name: 'Favorites',
  data() {
    return {
      drawer: false,
      activeTab: 'tracks', 
      favoriteTracks: [],
      favoriteAlbums: [],
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  watch: {
    activeTab(newTab) {
      console.log('Tab changed to:', newTab) // Отладка переключения вкладок
    },
  },
  async mounted() {
    console.log('Auth store user:', this.authStore.user)
    if (!this.authStore.user) {
      console.log('Access denied: no user')
      this.$root.showSnackbar('Пожалуйста, войдите в аккаунт', 'error')
      this.$router.push('/login')
      return
    }
    await this.fetchFavorites()
  },
  methods: {
    async fetchFavorites() {
      try {
        const response = await axios.get('http://localhost:5000/api/favorites', {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.favoriteTracks = response.data.tracks
        this.favoriteAlbums = response.data.albums
        console.log('Fetched favorites:', { tracks: this.favoriteTracks, albums: this.favoriteAlbums })
      } catch (error) {
        this.$root.showSnackbar(`Ошибка загрузки избранного: ${error.response?.data?.message || error.message}`, 'error')
      }
    },
    playTrack(track) {
      this.$emit('playTrack', track)
    },
    playAlbum(album) {
      this.$emit('playAlbum', album)
    },
    async removeFromFavorites(item, isAlbum = false) {
      if (!confirm(`Удалить ${isAlbum ? 'альбом' : 'трек'} "${item.title}" из избранного?`)) return
      try {
        const endpoint = isAlbum ? `/api/favorites/album/${item.album_id}` : `/api/favorites/track/${item.track_id}`
        await axios.delete(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        if (isAlbum) {
          this.favoriteAlbums = this.favoriteAlbums.filter(a => a.album_id !== item.album_id)
        } else {
          this.favoriteTracks = this.favoriteTracks.filter(t => t.track_id !== item.track_id)
        }
        this.$root.showSnackbar(`${isAlbum ? 'Альбом' : 'Трек'} удалён из избранного`)
      } catch (error) {
        this.$root.showSnackbar(`Ошибка удаления: ${error.response?.data?.message || error.message}`, 'error')
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
.track-card, .album-card {
  position: relative;
  transition: transform 0.2s;
}
.track-card:hover, .album-card:hover {
  transform: translateY(-5px);
}
.rounded-app-bar {
  padding: 0 !important;
  width: 100vw !important;
  left: 0 !important;
  right: 0 !important;
}

.remove_buttn{
  /* background-color: #ffffff; */
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0);
}
.rounded-btn {
  border-radius: 50px !important;
}
.rounded-text-field {
  border-radius: 12px !important;
}
.rounded-card {
  border-radius: 18px !important;
  overflow: hidden;
  height: 280px;
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