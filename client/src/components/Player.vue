<template>
  <div class="player-container" :class="{ 'expanded-container': expanded }">
    <div v-if="expanded" class="overlay" @click="toggleExpanded"></div>
    <v-footer app :class="['rounded-player', { 'expanded-player': expanded }]" padless>
      <v-row v-if="!expanded" align="center" no-gutters class="w-100">
        <!-- Информация о треке и обложка (мини-режим) -->
        <v-col cols="12" sm="4" class="d-flex align-center pa-2" @click="toggleExpanded">
          <v-img
            :src="`http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`"
            height="80"
            class="rounded-card mr-3 cursor-pointer"
          ></v-img>
          <div >
            <div class="text-subtitle-2">{{ track.title }}</div>
            <div class="text-caption">{{ track.artist }}</div>
          </div>
        </v-col>

        <!-- Управление воспроизведением (мини-режим) -->
        <v-col cols="12" sm="4" class="text-center">
          <v-btn icon @click="$emit('playPrev')" class="rounded-btn player-reg">
            <go-start theme="outline" size="22" stroke-linejoin="bevel"/>
          </v-btn>
          <v-btn icon @click="$emit('togglePlay')" class="rounded-btn">
            <component :is="isPlaying ? 'pause' : 'play-one'" :size="35" />
          </v-btn>
          <v-btn icon @click="$emit('playNext')" class="rounded-btn">
            <go-end theme="outline" size="22" stroke-linejoin="bevel"/>
          </v-btn>
          <div class="mt-0.5">
            <v-slider
              v-model="currentTime"
              :max="duration"
              thumb-size="10"
              @update:modelValue="seek"
              class="progress-slider"
            ></v-slider>
          </div>
        </v-col>

        <!-- Управление громкостью и очередь (мини-режим) -->
        <v-col cols="12" sm="4" class="d-flex justify-end align-center pa-2">
          <div class="volume-control">
            <component
              :is="volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-small' : 'volume-notice'"
              theme="outline"
              size="24"
            />
            <v-slider
              v-model="volume"
              :max="1"
              :step="0.01"
              thumb-size="10"
              class="volume-slider"
              style="max-width: 120px;"
              @update:modelValue="updateVolume"
            ></v-slider>
          </div>
          <!-- <v-btn icon @click="toggleFavorite" class="rounded-btn ml-2">
            <like v-if="!isInFavorites" theme="outline" size="24" />
            <like v-else theme="two-tone" size="24" :fill="[,'#ff0002']" />
          </v-btn> -->
          
          <v-btn icon @click="toggleRepeat" class="rounded-btn">
            <play-once v-if="repeatMode === 'single'" theme="outline" size="24" fill='#BB86FC' />
            <play-once v-else  size="24"  />
          </v-btn>
      
          <v-btn icon @click="toggleShuffle" class="rounded-btn">
            <shuffle-one v-if="shuffle" theme="outline" size="24" fill='#BB86FC' />
            <shuffle-one v-else  size="24"  />
          </v-btn>
          
          

          <v-btn icon @click="showQueue = !showQueue" class="rounded-btn ml-2">
            <music-list theme="outline" size="30" />
          </v-btn>
        </v-col>
      </v-row>

     <!-- Расширенный плеер -->
      <v-row v-if="expanded" align="center" no-gutters class="w-100 expanded-row">
        <v-col cols="6" class="d-flex justify-center align-center pa-4">
          <v-img
            :src="`http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`"
            height="450"
            width="450"
            class="rounded-card"
          ></v-img>
        </v-col>
        <v-col cols="6" class="d-flex flex-column justify-space-between pa-4">
          <div class="track-info">
            <!-- Название трека и артист по центру -->
            <div class="text-center track-title-container">
              <div class="track-title">{{ track.title }}</div>
              <div class="track-artist">{{ track.artist }}</div>
            </div>
            <!-- Управление воспроизведением -->
            <v-row class="text-center mt-4">
              <v-col cols="12">
                <v-btn icon @click="$emit('playPrev')" class="rounded-btn player-reg">
                  <go-start theme="outline" size="30" stroke-linejoin="bevel"/>
                </v-btn>
                <v-btn icon @click="$emit('togglePlay')" class="rounded-btn">
                  <component :is="isPlaying ? 'pause' : 'play-one'" :size="40" />
                </v-btn>
                <v-btn icon @click="$emit('playNext')" class="rounded-btn">
                  <go-end theme="outline" size="30" stroke-linejoin="bevel"/>
                </v-btn>
              </v-col>
              <v-col cols="12" class="mt-2">
                <v-slider
                  v-model="currentTime"
                  :max="duration"
                  thumb-size="10"
                  @update:modelValue="seek"
                  class="progress-slider"
                ></v-slider>
              </v-col>
            </v-row>

            <!-- Управление громкостью и очередь -->
            <v-row class="mt-4">
              <v-col cols="12" class="d-flex justify-end align-center">
                <div class="volume-control">
                  <component
                    :is="volume === 0 ? 'volume-mute' : volume < 0.5 ? 'volume-small' : 'volume-notice'"
                    theme="outline"
                    size="24"
                  />
                  <v-slider
                    v-model="volume"
                    :max="1"
                    :step="0.01"
                    thumb-size="10"
                    class="volume-slider"
                    style="max-width: 150px;"
                    @update:modelValue="updateVolume"
                  ></v-slider>
                </div>
                <v-btn icon @click="toggleRepeat" class="rounded-btn ml-2">
                  <play-once :size="24" :fill="repeatMode === 'single' ? '#BB86FC' : '#FFFFFF'" />
                </v-btn>
                <v-btn icon @click="toggleShuffle" class="rounded-btn ml-2">
                  <shuffle-one :size="24" :fill="shuffle ? '#BB86FC' : '#FFFFFF'" />
                </v-btn>
                <v-btn icon @click="showQueue = !showQueue" class="rounded-btn ml-2">
                  <music-list theme="outline" size="30" />
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </v-col>
      </v-row>

      <!-- Очередь воспроизведения -->
      <v-card v-if="showQueue && queue.length > 0" class="queue-panel">
        <v-card-title class="queue-title">
          Очередь
          <v-spacer></v-spacer>
          <v-btn icon @click="showQueue = false" class="rounded-btn">
            <close theme="outline" size="24" />
          </v-btn>
        </v-card-title>
        <v-card-text class="queue-content">
          <v-list dense class="queue-box">
            <v-list-item
              v-for="(queuedTrack, index) in queue"
              :key="queuedTrack.track_id"
              :class="{ 'active-track': index === currentQueueIndex }"
              @click="playTrackFromQueue(index)"
            >
              <v-list-item-title class="queue-track-title">
                <div class="d-flex align-center">
                  <acoustic v-if="index === currentQueueIndex" theme="outline" size="24" fill="#BB86FC" class="mr-2"/>
                  <div>
                    <div class="text-subtitle-2">{{ queuedTrack.title }}</div>
                    <div class="text-caption">{{ queuedTrack.artist }}</div>
                  </div>
                </div>
                <v-btn icon @click.stop="removeFromQueue(index)" class="rounded-btn">
                  <Delete :size="14" />
                </v-btn>
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>

      <!-- Аудио элемент -->
      <audio
        ref="audioPlayer"
        :src="`http://localhost:5000${track.audio_url}`"
        @timeupdate="updateTime"
        @loadedmetadata="updateDuration"
        @ended="$emit('trackEnded')"
      ></audio>
    </v-footer>
  </div>
</template>

<script>
import { setCache, getCache } from '../utils/cache'
export default {
  name: 'Player',
  props: {
    track: {
      type: Object,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      required: true,
    },
    queue: {
      type: Array,
      required: true,
    },
    currentQueueIndex: {
      type: Number,
      required: true,
    },
    
    
  },
  data() {
    return {
      currentTime: 0,
      duration: 0,
      volume: 0.5,
      showQueue: false,
      expanded: false,
      repeatMode: 'queue',
      shuffle: false,
      originalQueue: []
    }
  },
  watch: {
    isPlaying(newVal) {
      if (newVal) {
        this.$refs.audioPlayer.play().catch(error => {
          console.error('Error playing track:', error)
        })
      } else {
        this.$refs.audioPlayer.pause()
      }
    },
    track() {
      this.currentTime = 0
      this.$nextTick(() => {
        this.$refs.audioPlayer.load()
        if (this.isPlaying) {
          this.$refs.audioPlayer.play().catch(error => {
            console.error('Error playing track:', error)
          })
        }
      })
    },
    queue(newQueue) {
      if (!this.shuffle) {
        this.originalQueue = [...newQueue]
      }
    },
    volume(newVal) {
      setCache('playerVolume', newVal) // Сохраняем громкость в кэш
    },
  },
  methods: {
    // isInFavorites(item, isAlbum = false) {
    //   if (isAlbum) {
    //     return this.favoriteAlbums.some(a => a.album_id === item.album_id)
    //   }
    //   return this.favoriteTracks.some(t => t.track_id === item.track_id)
    // },
    // async toggleFavorite(item, isAlbum = false) {
    //   try {
    //     const endpoint = isAlbum ? `/api/favorites/album/${item.album_id}` : `/api/favorites/track/${item.track_id}`
    //     if (this.isInFavorites(item, isAlbum)) {
    //       await axios.delete(`http://localhost:5000${endpoint}`, {
    //         headers: { Authorization: `Bearer ${this.authStore.token}` },
    //       })
    //       this.$root.showSnackbar(`${isAlbum ? 'Альбом' : 'Трек'} "${item.title}" удалён из избранного`)
    //     } else {
    //       await axios.post(`http://localhost:5000${endpoint}`, {}, {
    //         headers: { Authorization: `Bearer ${this.authStore.token}` },
    //       })
    //       this.$root.showSnackbar(`${isAlbum ? 'Альбом' : 'Трек'} "${item.title}" добавлен в избранное`)
    //     }
    //     await this.fetchFavorites()
    //   } catch (error) {
    //     this.$root.showSnackbar(`Ошибка: ${error.response?.data?.message || error.message}`, 'error')
    //   }
    // },
    toggleExpanded() {
      this.expanded = !this.expanded
    },
    updateTime() {
      this.currentTime = this.$refs.audioPlayer.currentTime
    },
    updateDuration() {
      this.duration = this.$refs.audioPlayer.duration
    },
    seek(value) {
      this.$refs.audioPlayer.currentTime = value
    },
    updateVolume(value) {
      this.$refs.audioPlayer.volume = value
    },
    formatTime(seconds) {
      if (isNaN(seconds)) return '0:00'
      const minutes = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
    },
    playTrackFromQueue(index) {
      this.$emit('playTrackFromQueue', index)
    },
    removeFromQueue(index) {
      if (index === this.currentQueueIndex) {
        this.$emit('removeFromQueue', index)
        if (this.queue.length > 1) {
          this.playNextTrack()
        } else {
          this.$emit('togglePlay', false)
          this.$emit('trackEnded')
        }
      } else if (index > this.currentQueueIndex) {
        this.$emit('removeFromQueue', index)
      } else {
        this.currentQueueIndex--
        this.$emit('removeFromQueue', index)
      }
    },
    playNextTrack() {
      this.$emit('playNext')
    },
    toggleShuffle() {
      if (this.shuffle && this.queue.length > 1) {
        this.$emit('restoreQueue', this.originalQueue) 
      }
      this.shuffle = !this.shuffle
      if (this.shuffle && this.queue.length > 1) {
        this.$emit('shuffleQueue', this.currentQueueIndex)
      }
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
      this.$emit('updateQueue', this.queue) 
    },
    handleTrackEnd() {
      if (this.shuffle && this.queue.length > 1) {
        const nextIndex = Math.floor(Math.random() * this.queue.length)
        this.currentQueueIndex = nextIndex
        this.currentTrack = this.queue[this.currentQueueIndex]
        this.$refs.audioPlayer.play()
      } else if (this.repeatMode === 'single') {
        this.$refs.audioPlayer.currentTime = 0
        this.$refs.audioPlayer.play() 
        if (this.currentQueueIndex < this.queue.length - 1) {
          this.currentQueueIndex++
          this.currentTrack = this.queue[this.currentQueueIndex]
          this.$refs.audioPlayer.play()
        } else {
          this.currentQueueIndex = 0
          this.currentTrack = this.queue[this.currentQueueIndex]
          this.$refs.audioPlayer.play()
        }
      }
      this.$emit('trackEnded')
    },
    toggleRepeat() {
      this.repeatMode = this.repeatMode === 'queue' ? 'single' : 'queue'
    },
    toggleExpanded() {
      this.expanded = !this.expanded
    },
  },
  mounted() {
    this.$refs.audioPlayer.volume = this.volume
    const cachedVolume = getCache('playerVolume')
    if (cachedVolume !== null) {
      this.volume = cachedVolume // Загружаем громкость из кэша
      this.$refs.audioPlayer.volume = this.volume
    } else {
      this.$refs.audioPlayer.volume = this.volume // Значение по умолчанию
    }
  
  },
}
</script>

<style scoped>
.player-container {
  position: relative;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.825); 
  
  z-index: 1000;
  display: none;
}

.expanded-container .overlay {
  display: block;
}

.rounded-player {
  border-radius: 12px !important;
  height: 100px;
  width: 100%;
  transition: height 0.3s ease, width 0.3s ease transform 0.3s ease;
}

.expanded-player {
  height: 60% !important;
  width: 80% !important;
  position: fixed;
  top: 25%;
  left: 10% !important;
  transform: translate(-50%, 0%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.expanded-row {
  height: 100%;
  flex: 1;
  width: 100%;
}

.volume-control {
  display: flex;
  align-items: center;
  position: relative;
}

.volume-slider {
  width: 0;
  opacity: 0;
  transition: width 0.3s ease, opacity 0.3s ease;
  margin-left: 8px;
  height: 24px;
  overflow: hidden;
}

.volume-control:hover .volume-slider {
  width: 150px;
  opacity: 1;
}

.progress-slider, .volume-slider {
  margin: 0 10px;
}

.queue-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  height: 400px;
  z-index: 1001;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.queue-title {
  padding: 8px 16px;
  font-weight: 500;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.queue-content {
  padding: 8px;
  height: 340px;
  overflow-y: auto;
}

.queue-track-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.queue-track-title .d-flex {
  flex: 1;
  overflow: hidden;
}

.queue-track-title div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.active-track {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.v-list-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.rounded-btn {
  border-radius: 50px !important;
  background-color: transparent !important;
  opacity: 0.8;
  transition: opacity 0.2s;
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.5);
}

.rounded-btn:hover {
  opacity: 1;
}

.queue-panel .rounded-btn {
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 0.9;
}

.queue-panel .rounded-btn:hover {
  opacity: 1;
  background-color: rgba(235, 17, 17, 0.991) !important;
}

.cursor-pointer {
  cursor: pointer;
}

.track-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.track-title-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.track-title {
  font-size: 3rem; 
  font-weight: 700;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}

.track-artist {
  font-size: 1.5rem; 
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80%;
}
</style>