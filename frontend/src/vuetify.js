import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light', // Можно позже настроить темную тему
    themes: {
      light: {
        colors: {
          primary: '#1976D2', // Синий, как в Spotify
          secondary: '#424242',
          accent: '#82B1FF',
        },
      },
    },
  },
})

export default vuetify  