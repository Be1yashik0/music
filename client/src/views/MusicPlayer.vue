<template>
    <div class="music-player-page">
      <h1>Music Player</h1>
      <Player />
    </div>
  </template>
  
  <script>
  import Player from '@/components/Player.vue';
  
  export default {
    name: 'MusicPlayerView',
    components: {
      Player
    }
  };
  </script>
  
  <style scoped>
  .music-player-page {
    padding: 20px;
  }
  </style>