<script>
import { useAuthStore } from '../stores/auth'

export default {
  name: 'Home',
  data() {
    return {
      drawer: false,
      searchQuery: '',
      activeSection: 'recommendations',
      recommendedTracks: [
        { id: 1, title: 'Song 1', artist: 'Artist 1', cover: 'https://via.placeholder.com/150', url: '' },
        { id: 2, title: 'Song 2', artist: 'Artist 2', cover: 'https://via.placeholder.com/150', url: '' },
        { id: 3, title: 'Song 3', artist: 'Artist 3', cover: 'https://via.placeholder.com/150', url: '' },
      ],
      popularAlbums: [
        { id: 1, title: 'Album 1', artist: 'Artist 1', cover: 'https://via.placeholder.com/150' },
        { id: 2, title: 'Album 2', artist: 'Artist 2', cover: 'https://via.placeholder.com/150' },
        { id: 3, title: 'Album 3', artist: 'Artist 3', cover: 'https://via.placeholder.com/150' },
      ],
    }
  },
  computed: {
    authStore() {
      return useAuthStore()
    },
  },
  methods: {
    search() {
      console.log('Search:', this.searchQuery)
    },
    playTrack(track) {
      console.log('Play track:', track.title)
    },
    viewAlbum(album) {
      console.log('View album:', album.title)
    },
  },
}
</script>

<template>
<v-app>
    <!-- Навигационная панель -->
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" class="d-md-none"></v-app-bar-nav-icon>
      <v-toolbar-title>hz</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field
        v-model="searchQuery"
        label="Поиск..."
        solo
        dense
        flat
        prepend-inner-icon="mdi-magnify"
        class="mx-2"
        style="max-width: 300px;"
        hide-details
        @input="search"
      ></v-text-field>
      <v-menu v-if="authStore.user" offset-y>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar size="32">
              <v-img :src="authStore.user.avatar" alt="User Avatar"></v-img>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
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
            <v-list-item @click="authStore.logout">
              <v-list-item-title>Выйти</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
      <v-btn v-else to="/login" color="white" text>Войти</v-btn>
    </v-app-bar>

    <!-- Боковая панель (складная на мобильных) -->
    <v-navigation-drawer v-model="drawer" temporary app class="d-md-none">
      <v-list>
        <v-list-item to="/">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Главная</v-list-item-title>
        </v-list-item>
        <v-list-item to="/playlists">
          <v-list-item-icon>
            <v-icon>mdi-playlist-music</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Мои плейлисты</v-list-item-title>
        </v-list-item>
        <!-- <v-list-item to="/search">
          <v-list-item-icon>
            <v-icon>mdi-magnify</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Поиск</v-list-item-title>
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer permanent app class="d-none d-md-block" width="250">
      <v-list>
        <v-list-item to="/">
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Главная</v-list-item-title>
        </v-list-item>
        <v-list-item to="/playlists">
          <v-list-item-icon>
            <v-icon>mdi-playlist-music</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Мои плейлисты</v-list-item-title>
        </v-list-item>
        <v-list-item to="/search">
          <v-list-item-icon>
            <v-icon>mdi-magnify</v-icon>
          </v-list-item-icon>
          <v-list-item-title>Поиск</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Основное содержимое -->
    <v-main>
      <v-container fluid>
        <!-- Кнопки переключения -->
        <v-row>
          <v-col>
            <v-btn-toggle v-model="activeSection" mandatory color="primary" divided>
              <v-btn value="recommendations">Рекомендации</v-btn>
              <v-btn value="popular">Популярное</v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- Секция контента -->
        <v-row v-if="activeSection === 'recommendations'" class="mt-4">
          <v-col>
            <h2 class="mb-4">Рекомендуем для вас</h2>
            <v-row>
              <v-col v-for="track in recommendedTracks" :key="track.id" cols="12" sm="6" md="4" xs="6">
                <v-card hover @click="playTrack(track)" flat>
                  <v-img :src="track.cover" aspect-ratio="1" class="mb-2"></v-img>
                  <v-card-title class="text-body-2">{{ track.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ track.artist }}</v-card-subtitle>
                  <v-card-actions>
                    <v-btn icon color="primary" small>
                      <v-icon small>mdi-play</v-icon>
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-row v-if="activeSection === 'popular'" class="mt-4">
          <v-col>
            <h2 class="mb-4">Популярное</h2>
            <v-row>
              <v-col v-for="album in popularAlbums" :key="album.id" cols="12" sm="6" md="4" xs="6">
                <v-card hover @click="viewAlbum(album)" flat>
                  <v-img :src="album.cover" aspect-ratio="1" class="mb-2"></v-img>
                  <v-card-title class="text-body-2">{{ album.title }}</v-card-title>
                  <v-card-subtitle class="text-caption">{{ album.artist }}</v-card-subtitle>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Увеличим отступы для читаемости */
.v-card-title {
  font-size: 0.9rem;
  line-height: 1.2;
}
.v-card-subtitle {
  font-size: 0.7rem;
}
</style>
