<template>
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card class="search-card">
            <v-card-title class="text-h5 text-center">Поиск по {{ searchQuery }}</v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6">Треки</h3>
                  <v-list v-if="tracks.length">
                    <v-list-item v-for="track in tracks" :key="track.track_id" @click="goToArtist(track.artist)">
                      <v-list-item-title>{{ track.title }} - {{ track.artist }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                  <p v-else class="text-center">Нет треков.</p>
                </v-col>
                <v-col cols="12" class="mt-4">
                  <h3 class="text-h6">Альбомы</h3>
                  <v-list v-if="albums.length">
                    <v-list-item v-for="album in albums" :key="album.album_id" @click="goToArtist(album.artist)">
                      <v-list-item-title>{{ album.title }} - {{ album.artist }}</v-list-item-title>
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
  </template>
  
  <script>
  import axios from 'axios'
  import { useRoute } from 'vue-router'
  
  export default {
    name: 'Search',
    data() {
      return {
        searchQuery: '',
        tracks: [],
        albums: [],
      }
    },
    async mounted() {
      this.searchQuery = this.$route.query.artist || ''
      await this.searchByArtist()
    },
    methods: {
      async searchByArtist() {
        try {
          const response = await axios.get(`http://localhost:5000/api/search?artist=${this.searchQuery}`)
          this.tracks = response.data.tracks || []
          this.albums = response.data.albums || []
        } catch (error) {
          this.$root.showSnackbar(`Ошибка поиска: ${error.response?.data?.error || error.message}`, 'error')
        }
      },
      goToArtist(artist) {
        if (artist) {
          this.$router.push({ path: '/search', query: { artist } })
        }
      },
    },
  }
  </script>
  
  <style scoped>
  .search-card {
    padding: 24px;
    border-radius: 12px !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .search-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  }
  
  .text-h6 {
    color: #424242;
    margin-bottom: 8px;
  }
  
  .v-list-item {
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .v-list-item:hover {
    background-color: rgba(25, 118, 210, 0.1);
  }
  </style>