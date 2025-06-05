<template>
  <v-footer app color="primary" class="rounded-player" padless>
    <v-row align="center" no-gutters class="w-100">
      <!-- Информация о треке -->
      <v-col cols="12" sm="4" class="d-flex align-center pa-2" @click="toggleExpanded">
        <v-img
          :src="`http://localhost:5000${track.cover_url || '/uploads/covers/default.jpg'}`"
          height="80"
          
          class="rounded-card mr-3 cursor-pointer"
          :class="{ 'expanded-cover': isExpanded }"
        ></v-img>
        <div class="text-white" v-if="!isExpanded">
          <div class="text-subtitle-2">{{ track.title }}</div>
          <div class="text-caption">{{ track.artist }}</div>
        </div>
        <div v-if="isExpanded" class="expanded-info">
          <div class="text-subtitle-1">{{ track.title }}</div>
          <div class="text-caption">{{ track.artist }}</div>
          <div class="text-caption">Жанр: {{ track.genre || 'Не указан' }}</div>
          <div class="text-caption">Дата выпуска: {{ formatDate(track.release_date) }}</div>
          <div class="text-caption">Прослушивания: {{ track.listens || 0 }}</div>
        </div>
      </v-col>

      <!-- Управление воспроизведением -->
      <v-col cols="12" sm="4" class="text-center">
        <v-btn icon @click="$emit('playPrev')" class="rounded-btn">
          <go-start theme="outline" size="22" fill="#FFFFFF" strokeLinejoin="bevel"/>        
        </v-btn>
        <v-btn icon @click="$emit('togglePlay')" class="rounded-btn">
          <component :is="isPlaying ? 'pause' : 'play-one'" :size="35" fill="#FFFFFF"/>
          <!-- <play-one theme="outline" size="24" fill="#333"/>
          <pause theme="outline" size="24" fill="#000000"/> -->
        </v-btn>
        <v-btn icon @click="$emit('playNext')" class="rounded-btn">
          <go-end theme="outline" size="22" fill="#FFFFFF" strokeLinejoin="bevel"/>        
        </v-btn>
        
        <div class="mt-0.5">
          
          <v-slider
          
            v-model="currentTime"
            :max="duration"
            color="white"
            track-color="grey"
            thumb-size="10"
            @update:modelValue="seek"
            class="progress-slider"
            
          ></v-slider>
        
          <!-- <div class="text-caption text-white">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div> -->
        </div>
      </v-col>



      <!-- Управление громкостью и очередь -->
      <v-col cols="12" sm="4" class="d-flex justify-end align-center pa-2">
        <div class="volume-control">
          <volume-small theme="outline" size="24" fill="#FFFFFF"/>
          <v-slider
            v-model="volume"
            :max="1"
            :step="0.01"
            color="white"
            track-color="grey"
            thumb-size="10"
            class="volume-slider"
            style="max-width: 120px;"
            @update:modelValue="updateVolume"
          ></v-slider>
        </div>

        <v-btn icon @click="toggleRepeat" class="rounded-btn">          
          <component :is="repeatMode === 'queue' ? 'refresh' : 'play-once'" :size="24" fill="#FFFFFF"/>
        </v-btn>
        <!-- <v-btn icon @click="play-once" class="rounded-btn">
          <repeat-one :size="24" :fill="repeatMode === 'single' ? '#BB86FC' : '#FFFFFF'" />
        </v-btn> -->
        
        <v-btn icon @click="toggleShuffle" class="rounded-btn">
          <shuffle-one v-if="toggleShuffle" :size="24" fill="#FFFFFF"/>
          <shuffle v-else :size="24" />
        </v-btn>

        <v-btn icon @click="showQueue = !showQueue" class="rounded-btn ml-2">
          <music-list theme="outline" size="30" fill="#FFFFFF"/>
        </v-btn>
      </v-col>

      <!-- Очередь воспроизведения -->
      <v-card v-if="showQueue && queue.length > 0" class="queue-panel">
        <v-card-title class="queue-title">
          Очередь
          <!-- <v-spacer></v-spacer> -->
          <v-btn icon @click="showQueue = false" class="rounded-btn " >
            <close theme="outline" size="24" fill="#FFFFFF"/>
          </v-btn>
        </v-card-title>
        <v-card-text class="queue-content">
          <v-list dense  class="queue-box">
            <v-list-item
              v-for="(queuedTrack, index) in queue"
              :key="queuedTrack.track_id"
              :class="{ 'active-track': index === currentQueueIndex }"
              @click="playTrackFromQueue(index)"
            >
              <v-list-item-title class="queue-track-title">
                <!-- {{ queuedTrack.title }} - {{ queuedTrack.artist }} -->
                <div class="d-flex align-center">
                  <acoustic v-if="index === currentQueueIndex" theme="outline" size="24" fill="#BB86FC" class="mr-2"/>
                  <div> 
                    <div class="text-subtitle-2">{{ queuedTrack.title }}</div>
                    <div class="text-caption">{{ queuedTrack.artist }}</div>
                  </div>
                </div>
              
                <v-btn icon @click.stop="removeFromQueue(index)" class="rounded-btn" >
                  <Delete :size="14" fill="#FFFFFF"/>
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
    </v-row>
  </v-footer>
</template>

<script>

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
        this.originalQueue = [...newQueue] // Обновляем исходную очередь при изменениях
      }
    }
  },
  methods: {
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
        this.$emit('restoreQueue', this.originalQueue) // Восстанавливаем исходную очередь
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
      this.queue = [currentTrack, ...shuffled] // Локальное обновление для отображения
      this.currentQueueIndex = 0
      this.$emit('updateQueue', this.queue) // Передаём обновление в Home.vue
    },
    handleTrackEnd() {
      if (this.shuffle && this.queue.length > 1) {
        const nextIndex = Math.floor(Math.random() * this.queue.length)
        this.currentQueueIndex = nextIndex
        this.currentTrack = this.queue[this.currentQueueIndex]
        this.$refs.audioPlayer.play()
      } else if (this.repeatMode === 'single') {
        this.$refs.audioPlayer.currentTime = 0
        this.$refs.audioPlayer.play() // Убедимся, что трек повторяется
      } else { // repeatMode === 'queue'
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
  },
}
</script>

<style scoped>

.volume-control {
  display: flex;
  align-items: center;
  position: relative;
}

.volume-slider {
  max-width: 0; /* Скрыт по умолчанию */
  opacity: 0;
  transition: max-width 0.3s ease, opacity 0.3s ease;
  margin-left: 8px;
  height: 35px;
}

.volume-control:hover .volume-slider {
  width: 120px; /* Появляется при наведении */
  opacity: 1;
}
.rounded-player {
  border-radius: 12px !important;
  height: 100px; 
  transition: height 0.3s ease;
}

.progress-slider, .volume-slider {
  margin: 0 10px;
}
.text-white {
  color: white;
}
.queue-panel {
  position: absolute;
  bottom: 70px;
  width: 100%;
  /* background-color: #424242; */
  z-index: 1000;
}


.volume-control {
  display: flex;
  align-items: center;
}

.queue-panel {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 320px;
  height: 400px;
  background-color: #3d55e2;
  color: white;
  z-index: 1000;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  
  
}

.queue-box {
  background-color: #3d55e2;
}


/* .queue-panel {
  position: fixed;
  bottom: 90px;
  right: 10px;
  width: 320px;
  height: 340px;
  color: white;
  z-index: 1000;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  overflow: hidden;
} */

.queue-title {
  /* background-color: #0b79ef; */
  padding: 8px 16px;
  font-weight: 500;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 300px; */
  display: flex;
  align-items: center;
  justify-content: space-between; 
}

.queue-content {
  padding: 8px;
  /* max-height: 200px; */
  overflow-y: auto;
  height: 300px;
  background-color: #3d55e2;  
  

}

.queue-track-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* max-width: 300px; */
  display: flex;
  align-items: center;
  /* width: 100%; */
  color: aliceblue;
  
}

.queue-track-title .rounded-btn {
  margin-left: auto; /* Перемещаем кнопку удаления в конец */
}

.active-track {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

/* .active-track .queue-track-title {
  color: #bb86fc;
} */

.v-list-item:hover {
  /* background-color: rgba(202, 29, 29, 0.831); */
  border-radius: 8px;
}

.rounded-btn {
  border-radius: 50px !important;
  background-color: transparent !important; /* Прозрачный фон */
  opacity: 0.8; /* Лёгкая прозрачность для видимости */
  transition: opacity 0.2s; /* Плавное изменение прозрачности */
  /* size: 18px; */
  box-shadow: 0 0px 0px rgba(0, 0, 0, 0.5);
  

  
}

.rounded-btn:hover {
  opacity: 1; /* Полная видимость при наведении */
}

.queue-panel .rounded-btn {
  background-color: rgba(255, 255, 255, 0.1) ; /* Лёгкий фон для контраста в очереди */
  opacity: 0.9;
  
}

.queue-panel .rounded-btn:hover {
  opacity: 1;
  background-color: rgba(235, 17, 17, 0.991) !important;
}
</style>