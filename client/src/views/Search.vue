<template>
  <v-container fluid>
    <v-app-bar app color="primary" dark class="rounded-app-bar">
      <v-btn icon @click="drawer = !drawer" class="menu-toggle rounded-btn" fixed top left>
        <v-icon v-if="!drawer"><application-menu theme="outline" size="24" /></v-icon>
        <v-icon v-else><close theme="outline" size="24" /></v-icon>
      </v-btn>

      <v-toolbar-title class="title">T-shka</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="searchQuery"
        label="Поиск..."
        solo
        dense
        flat
        prepend-inner-icon="mdi-magnify"
        class="mx-2 rounded-text-field"
        style="max-width: 300px;"
        hide-details
        @input="debouncedSearch"
      ></v-text-field>
      <v-list-item @click="toggleTheme" class="toggle-theme">
        <v-list-item-icon>
          <Moon v-if="$vuetify.theme.current.dark" :size="26" class="menu-icon" />
          <SunOne v-else :size="24" class="menu-icon" />
        </v-list-item-icon>
      </v-list-item>
      <v-menu v-if="authStore.user" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props" class="rounded-btn">
            <v-avatar size="32">
              <v-img :src="authStore.user.avatar" alt="User Avatar"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-card class="rounded-card">
          <v-card-text>
            <div class="text-center">
              <v-avatar size="64" class="mb-2">
                <v-img :src="authStore.user.avatar" alt="User Avatar"></v-img>
              </v-avatar>
              <div>{{ authStore.user.username }}</div>
            </div>
          </v-card-text>
          <v-divider></v-divider>
          <v-list>
            <v-list-item to="/profile" v-if="authStore.user">
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
        <v-list-item to="/admin" v-if="authStore.user && authStore.user.is_admin">
          <v-divider></v-divider>
          <v-list-item-title>Администрирование</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container fluid>
        <h2 class="mb-4 rounded-title">Результаты поиска: {{ searchQuery }}</h2>
        <v-row>
          <v-col cols="12" sm="10" md="8" class="mx-auto">
            <v-card class="search-card rounded-card">
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <h3 class="text-h6">Треки</h3>
                    <v-list v-if="tracks.length">
                      <v-list-item
                        v-for="track in tracks"
                        :key="track.track_id"
                        @click="playTrack(track)"
                      >
                        <v-list-item-title>{{ track.title }} - {{ track.artist }}</v-list-item-title>
                        <v-list-item-action>
                          <v-btn icon @click.stop="toggleFavorite(track)">
                            <like v-if="!isInFavorites(track)" theme="outline" size="24" />
                            <like v-else theme="two-tone" size="24" :fill="[,'#ff0002']" />
                          </v-btn>
                          <v-btn icon @click.stop="addToQueue(track)" class="ml-2">
                            <fold-up-one theme="outline" size="24" />
                          </v-btn>
                          <v-btn icon @click.stop="playNext(track)" class="ml-2">
                            <to-bottom-one theme="outline" size="24" />
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <p v-else class="text-center">Нет треков.</p>
                  </v-col>
                  <v-col cols="12" class="mt-4">
                    <h3 class="text-h6">Альбомы</h3>
                    <v-list v-if="albums.length">
                      <v-list-item
                        v-for="album in albums"
                        :key="album.album_id"
                        @click="playAlbum(album)"
                      >
                        <v-list-item-title>{{ album.title }} - {{ album.artist }}</v-list-item-title>
                        <v-list-item-action>
                          <v-btn icon @click.stop="toggleFavorite(album, true)">
                            <like v-if="!isInFavorites(album, true)" theme="outline" size="24" />
                            <like v-else theme="two-tone" size="24" :fill="[,'#ff0002']" />
                          </v-btn>
                          <v-btn icon @click.stop="addAlbumToQueue(album)" class="ml-2">
                            <fold-up-one theme="outline" size="24" />
                          </v-btn>
                          <v-btn icon @click.stop="playAlbumNext(album)" class="ml-2">
                            <to-bottom-one theme="outline" size="24" />
                          </v-btn>
                        </v-list-item-action>
                      </v-list-item>
                    </v-list>
                    <p v-else class="text-center">Нет альбомов.</p>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <Player
      v-if="currentTrack"
      :track="currentTrack"
      :isPlaying="isPlaying"
      :queue="queue"
      :currentQueueIndex="currentQueueIndex"
      @togglePlay="togglePlay"
      @playNext="playNextTrack"
      @playPrev="playPrevTrack"
      @trackEnded="onTrackEnd"
      @playTrackFromQueue="playTrackFromQueue"
      @removeFromQueue="removeFromQueue"
      @shuffleQueue="shuffleQueue"
      @updateQueue="queue = $event"
      @updateCurrentQueueIndex="updateCurrentQueueIndex"
      @restoreQueue="restoreQueue"
      class="rounded-player"
    />
  </v-container>
</template>

<script>
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { debounce } from 'lodash'
import { defineComponent } from 'vue'
import { setCache, getCache } from '../utils/cache'
import Player from '../components/Player.vue'
import { ApplicationMenu, Close, Moon, SunOne, Like, FoldUpOne, ToBottomOne } from '@icon-park/vue-next'

export default defineComponent({
  name: 'Search',
  components: { Player, ApplicationMenu, Close, Moon, SunOne, Like, FoldUpOne, ToBottomOne },
  data() {
    return {
      drawer: false,
      searchQuery: '',
      tracks: [],
      albums: [],
      playlists: [],
      trackDialog: false,
      albumDialog: false,
      createPlaylistDialog: false,
      addToPlaylistDialog: false,
      selectedTrack: null,
      selectedAlbum: null,
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentQueueIndex: -1,
      currentTime: 0,
      activeTab: 'tracks',
      newPlaylistTitle: '',
      favoriteTracks: [],
      favoriteAlbums: [],
    }
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    return { route, router, authStore }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  methods: {
    toggleTheme() {
      this.$vuetify.theme.global.name = this.$vuetify.theme.current.dark ? 'light' : 'dark'
    },
    debouncedSearch: debounce(function () {
      this.search()
    }, 300),
    async search() {
      if (!this.searchQuery || this.searchQuery.length < 2) {
        this.tracks = []
        this.albums = []
        return
      }
      try {
        const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(this.searchQuery)}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.tracks = response.data.tracks.map(track => ({
          ...track,
          audio_url: track.audio_url || `http://localhost:5000${track.audio_path || '/uploads/audio/default.mp3'}`,
        }))
        this.albums = response.data.albums
        this.updateRoute()
      } catch (error) {
        this.$root.showSnackbar(`Ошибка поиска: ${error.response?.data?.error || error.message}`, 'error')
      }
    },
    updateRoute() {
      if (this.route.query.q !== this.searchQuery) {
        this.router.push({ path: '/search', query: { q: this.searchQuery } })
      }
    },
    async fetchFavorites() {
      try {
        const response = await axios.get('http://localhost:5000/api/favorites', {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        })
        this.favoriteTracks = response.data.tracks
        this.favoriteAlbums = response.data.albums
      } catch (error) {
        // this.$root.showSnackbar(`Ошибка загрузки избранного: ${error.response?.data?.message || error.message}`, 'error')
      }
    },
    isInFavorites(item, isAlbum = false) {
      if (isAlbum) {
        return this.favoriteAlbums.some(a => a.album_id === item.album_id)
      }
      return this.favoriteTracks.some(t => t.track_id === item.track_id)
    },
    async toggleFavorite(item, isAlbum = false) {
      try {
        const endpoint = isAlbum ? `/api/favorites/album/${item.album_id}` : `/api/favorites/track/${item.track_id}`
        if (this.isInFavorites(item, isAlbum)) {
          await axios.delete(`http://localhost:5000${endpoint}`, {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          })
          this.$root.showSnackbar(`${isAlbum ? 'Альбом' : 'Трек'} "${item.title}" удалён из избранного`)
        } else {
          await axios.post(`http://localhost:5000${endpoint}`, {}, {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          })
          this.$root.showSnackbar(`${isAlbum ? 'Альбом' : 'Трек'} "${item.title}" добавлен в избранное`)
        }
        await this.fetchFavorites()
      } catch (error) {
        this.$root.showSnackbar(`Ошибка: ${error.response?.data?.message || error.message}`, 'error')
      }
    },
    playTrack(track) {
      if (!track.audio_url) {
        console.error('No audio URL for track:', track)
        this.$root.showSnackbar('Ошибка: трек недоступен для воспроизведения', 'error')
        return
      }
      this.queue = [track]
      this.currentQueueIndex = 0
      this.currentTrack = track
      this.isPlaying = false
      this.$nextTick(() => {
        this.isPlaying = true
      })
    },
    playAlbum(album) {
      if (!album.tracks || album.tracks.length === 0) {
        console.error('No tracks in album:', album)
        this.$root.showSnackbar('Ошибка: альбом пуст', 'error')
        return
      }
      this.queue = album.tracks
      this.currentQueueIndex = 0
      this.currentTrack = this.queue[this.currentQueueIndex]
      if (!this.currentTrack.audio_url) {
        console.error('No audio URL for track:', this.currentTrack)
        this.$root.showSnackbar('Ошибка: трек недоступен для воспроизведения', 'error')
        return
      }
      this.isPlaying = false
      this.$nextTick(() => {
        this.isPlaying = true
      })
    },
    addToQueue(track) {
      this.queue = [...this.queue, track]
      this.$root.showSnackbar(`Трек "${track.title}" добавлен в очередь`)
    },
    addAlbumToQueue(album) {
      this.queue = [...this.queue, ...album.tracks]
      this.$root.showSnackbar(`Альбом "${album.title}" добавлен в очередь`)
    },
    playNext(track) {
      this.queue = [
        ...this.queue.slice(0, this.currentQueueIndex + 1),
        track,
        ...this.queue.slice(this.currentQueueIndex + 1),
      ]
      this.$root.showSnackbar(`Трек "${track.title}" добавлен для воспроизведения следующим`)
    },
    playAlbumNext(album) {
      this.queue = [
        ...this.queue.slice(0, this.currentQueueIndex + 1),
        ...album.tracks,
        ...this.queue.slice(this.currentQueueIndex + 1),
      ]
      this.$root.showSnackbar(`Альбом "${album.title}" добавлен для воспроизведения следующим`)
    },
    shuffleQueue(currentIndex) {
      const currentTrack = this.queue[currentIndex]
      let shuffled = this.queue.filter((_, i) => i !== currentIndex)
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      this.queue = [currentTrack, ...shuffled]
      this.currentQueueIndex = 0
      this.currentTrack = this.queue[this.currentQueueIndex]
      this.isPlaying = true
    },
    playNextTrack() {
      if (this.currentQueueIndex < this.queue.length - 1) {
        this.currentQueueIndex++
      } else {
        this.currentQueueIndex = 0
      }
      this.currentTrack = this.queue[this.currentQueueIndex]
      this.isPlaying = true
    },
    playPrevTrack() {
      if (this.currentQueueIndex > 0) {
        this.currentQueueIndex--
      } else if (this.queue.length > 0) {
        this.currentQueueIndex = this.queue.length - 1
      }
      this.currentTrack = this.queue[this.currentQueueIndex]
      this.isPlaying = true
    },
    togglePlay() {
      this.isPlaying = !this.isPlaying
    },
    onTrackEnd() {
      if (this.currentQueueIndex < this.queue.length - 1) {
        this.currentQueueIndex++
        this.currentTrack = this.queue[this.currentQueueIndex]
        this.isPlaying = true
      } else {
        this.currentQueueIndex = 0
        this.currentTrack = this.queue[this.currentQueueIndex]
        this.isPlaying = true
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    playTrackFromQueue(index) {
      this.currentQueueIndex = index
      this.currentTrack = this.queue[index]
      this.isPlaying = true
    },
    removeFromQueue(index) {
      const newQueue = this.queue.filter((_, i) => i !== index)
      this.queue = newQueue
      setCache('queue', newQueue)
      if (this.queue.length === 0) {
        this.currentTrack = null
        this.currentQueueIndex = -1
        this.isPlaying = false
        setCache('currentTrack', null)
        setCache('currentQueueIndex', -1)
      }
    },
  },
  watch: {
    currentTrack(newVal) {
      if (newVal) {
        console.log('Caching currentTrack:', newVal)
        setCache('currentTrack', newVal)
      } else {
        console.log('Clearing currentTrack cache')
        setCache('currentTrack', null)
      }
    },
    queue(newVal) {
      console.log('Caching queue:', newVal)
      setCache('queue', newVal)
    },
    currentQueueIndex(newVal) {
      console.log('Caching currentQueueIndex:', newVal)
      setCache('currentQueueIndex', newVal)
    },
    currentTime(newVal) {
      console.log('Caching currentTime:', newVal)
      setCache('currentTime', newVal)
    },
  },
  async mounted() {
    this.searchQuery = this.route.query.q || ''
    if (this.searchQuery) {
      await this.search()
    }
    await this.fetchFavorites()

    const cachedTrack = getCache('currentTrack')
    const cachedQueue = getCache('queue')
    const cachedQueueIndex = getCache('currentQueueIndex')
    const cachedTime = getCache('currentTime')

    if (cachedTrack) {
      this.currentTrack = cachedTrack
    }
    if (cachedQueue) {
      this.queue = cachedQueue
    }
    if (cachedQueueIndex !== null) {
      this.currentQueueIndex = cachedQueueIndex
    }
    if (cachedTime !== null) {
      this.currentTime = cachedTime
    }
  },
})
</script>

<style scoped>
.album-controls {
  display: flex;
  justify-content: center;
  gap: 10px;
}
.track-item .action-buttons {
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  gap: 5px;
}
.track-item .action-buttons.visible {
  opacity: 1;
}
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
.toggle-theme {
  border-radius: 20px !important;
}
.search-card {
  position: relative;
  transition: transform 0.2s;
}
.search-card:hover {
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
.rounded-list {
  border-radius: 12px !important;
}
.rounded-drawer {
  margin: 12px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  border-radius: 12px !important;
}
.rounded-dialog {
  border-radius: 12px !important;
}
.rounded-player {
  border-radius: 12px !important;
}
.rounded-title {
  border-radius: 12px;
  padding: 10px;
}
.dialog-cover {
  border-radius: 8px !important;
  margin-top: 10px;
}
.track-item {
  padding: 8px 0;
}
.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}
.d-flex {
  display: flex;
}
.align-center {
  align-items: center;
}
.justify-space-between {
  justify-content: space-between;
}
.w-100 {
  width: 100%;
}
</style>