<template>
  <v-footer app color="primary" class="rounded-player" padless>
    <v-row align="center" no-gutters class="w-100">
      <v-col cols="12" sm="4" class="d-flex align-center pa-2">
        <v-img
          :src="trackCover"
          width="50"
          height="50"
          class="rounded-card mr-3"
        ></v-img>
        <div class="text-white">
          <div class="text-subtitle-1">{{ track.title }}</div>
          <div class="text-caption">{{ track.artist }}</div>
        </div>
      </v-col>

      <v-col cols="12" sm="4" class="text-center">
        <div class="d-flex align-center justify-center">
          <v-btn icon @click="skipBackward" class="rounded-btn mx-2">
            <v-icon color="white">mdi-skip-backward</v-icon>
          </v-btn>
          <v-btn 
            icon 
            @click="togglePlay" 
            class="rounded-btn mx-2"
            :disabled="!hasAudio"
          >
            <v-icon color="white" large>
              {{ isPlaying ? 'mdi-pause' : 'mdi-play' }}
            </v-icon>
          </v-btn>
          <v-btn icon @click="skipForward" class="rounded-btn mx-2">
            <v-icon color="white">mdi-skip-forward</v-icon>
          </v-btn>
        </div>
        <div class="mt-2 px-4">
          <v-slider
            v-model="currentTime"
            :max="duration"
            color="white"
            track-color="grey lighten-1"
            thumb-size="14"
            @input="seek"
            hide-details
          ></v-slider>
          <div class="d-flex justify-space-between text-caption text-white mt-1">
            <span>{{ formattedCurrentTime }}</span>
            <span>{{ formattedDuration }}</span>
          </div>
        </div>
      </v-col>

      <v-col cols="12" sm="4" class="d-flex justify-end align-center pa-2">
        <v-icon color="white" class="mr-2">mdi-volume-high</v-icon>
        <v-slider
          v-model="volume"
          :max="1"
          :step="0.01"
          color="white"
          track-color="grey lighten-1"
          thumb-size="14"
          class="volume-slider"
          style="max-width: 120px;"
          hide-details
        ></v-slider>
      </v-col>

      <audio
        ref="audioPlayer"
        :src="audioUrl"
        @timeupdate="updateTime"
        @loadedmetadata="updateDuration"
        @ended="handleTrackEnd"
        @error="handleAudioError"
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
      default: () => ({
        title: 'Unknown Track',
        artist: 'Unknown Artist',
        cover_url: '/default-cover.jpg',
        audio_url: ''
      })
    },
    isPlaying: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    trackCover() {
      // Используем URL из пропсов вместо require
      return this.track.cover_url 
        ? `http://localhost:5000${this.track.cover_url}`
        : '/default-cover.jpg';
    },
    audioUrl() {
      return this.track.audio_url 
        ? `http://localhost:5000${this.track.audio_url}`
        : '';
    }
  },
  // ... остальные методы и хуки ...
}
</script>


<style scoped>
.rounded-player {
  border-radius: 16px 16px 0 0 !important;
}

.volume-slider {
  min-width: 120px;
}

.v-slider--horizontal {
  margin: 0 8px;
}
</style>