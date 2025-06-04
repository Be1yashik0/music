import { defineStore } from 'pinia'

export const useMusicStore = defineStore('music', {
  state: () => ({
    currentTrack: null,
    isPlaying: false,
    volume: 1.0,
    progress: 0,
    duration: 0,
    queue: [], // Очередь треков
    currentQueueIndex: -1,
  }),
  actions: {
    addToQueue(track) {
      this.queue.push(track)
    },
    playNext(track) {
      this.queue.splice(this.currentQueueIndex + 1, 0, track)
    },
    playAlbum(albumTracks, startIndex = 0) {
      this.queue = [...albumTracks]
      this.currentQueueIndex = startIndex
      this.setTrack(this.queue[startIndex])
      this.play()
    },
    nextTrack() {
      if (this.currentQueueIndex < this.queue.length - 1) {
        this.currentQueueIndex++
        this.setTrack(this.queue[this.currentQueueIndex])
        this.play()
      }
    },
    setTrack(track) {
      this.currentTrack = track
      this.isPlaying = false
      this.progress = 0
      this.duration = 0
      const index = this.queue.findIndex(t => t.track_id === track.track_id)
      if (index !== -1) this.currentQueueIndex = index
    },
  }
})