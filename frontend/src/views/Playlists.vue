<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card class="playlists-card">
            <v-card-title class="text-h5 text-center">Мои плейлисты</v-card-title>
            <v-tabs v-model="activeTab" color="primary" centered>
              <v-tab value="favoriteAlbums">Любимые альбомы</v-tab>
              <v-tab value="favoriteTracks">Любимые треки</v-tab>
              <v-tab value="myPlaylists">Мои плейлисты</v-tab>
            </v-tabs>
            <v-card-text>
              <v-window v-model="activeTab">
                <v-window-item value="favoriteAlbums">
                  <v-list v-if="favoriteAlbums.length">
                    <v-list-item v-for="album in favoriteAlbums" :key="album.album_id">
                      <v-list-item-title>{{ album.title }} - {{ album.artist }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-center">Нет любимых альбомов.</p>
                </v-window-item>
                <v-window-item value="favoriteTracks">
                  <v-list v-if="favoriteTracks.length">
                    <v-list-item v-for="track in favoriteTracks" :key="track.track_id">
                      <v-list-item-title>{{ track.title }} - {{ track.artist }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-center">Нет любимых треков.</p>
                </v-window-item>
                <v-window-item value="myPlaylists">
                  <v-list v-if="myPlaylists.length">
                    <v-list-item v-for="playlist in myPlaylists" :key="playlist.id">
                      <v-list-item-title>{{ playlist.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-center">Нет созданных плейлистов.</p>
                </v-window-item>
              </v-window>
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
    name: 'Playlists',
    data() {
      return {
        activeTab: 'favoriteAlbums',
        favoriteAlbums: [],
        favoriteTracks: [],
        myPlaylists: [],
      }
    },
    computed: {
      authStore() {
        return useAuthStore()
      },
    },
    async mounted() {
      if (!this.authStore.token) {
        this.$root.showSnackbar('Пожалуйста, войдите в аккаунт', 'error')
        this.$router.push('/login')
        return
      }
      await this.fetchPlaylists()
    },
    methods: {
      async fetchPlaylists() {
        try {
          const [albumsResponse, tracksResponse, playlistsResponse] = await Promise.all([
            axios.get('http://localhost:5000/api/favorite/albums', {
              headers: { Authorization: `Bearer ${this.authStore.token}` },
            }),
            axios.get('http://localhost:5000/api/favorite/tracks', {
              headers: { Authorization: `Bearer ${this.authStore.token}` },
            }),
            axios.get('http://localhost:5000/api/playlists', {
              headers: { Authorization: `Bearer ${this.authStore.token}` },
            }),
          ])
          this.favoriteAlbums = albumsResponse.data
          this.favoriteTracks = tracksResponse.data
          this.myPlaylists = playlistsResponse.data
        } catch (error) {
          this.$root.showSnackbar(`Ошибка загрузки плейлистов: ${error.response?.data?.error || error.message}`, 'error')
        }
      },
    },
  }
  </script>
  
  <style scoped>
  .playlists-card {
    padding: 24px;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .playlists-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  }
  
  .v-tab {
    font-weight: 500;
    color: #424242;
    text-transform: none;
    border-radius: 8px;
    padding: 8px 16px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }
  
  .v-tab--selected {
    color: #1976D2 !important;
    background-color: rgba(25, 118, 210, 0.1);
  }
  
  .v-tabs {
    border-bottom: 1px solid #e0e0e0;
    margin-bottom: 16px;
  }
  
  .text-center {
    color: #757575;
  }
  </style>