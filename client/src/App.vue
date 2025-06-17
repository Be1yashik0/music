<script>
import { useAuthStore } from './stores/auth'

export default {
  name: 'App',
  async mounted() {
    const authStore = useAuthStore()
    await authStore.verifyToken()
  },
  data() {
  return {
    snackbar: {
      show: false,
      message: '',
      color: 'success',
    },
  }
},
methods: {
  showSnackbar(message, color = 'success') {
    this.snackbar.message = message
    this.snackbar.color = color
    this.snackbar.show = true
  },
},
}
</script>

<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    :timeout="3000"
    location="top"
  >
    {{ snackbar.message }}
    <v-btn text @click="snackbar.show = false">Закрыть</v-btn>
  </v-snackbar>
</template>

<style scoped>

</style>

