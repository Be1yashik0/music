import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          background: '#FFFFFF',
          surface: '#F5F5F5',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#BB86FC',
          secondary: '#03DAC6',
          background: '#121212',
          surface: '#1E1E1E',
          error: '#CF6679',
          info: '#BB86FC',
          success: '#03DAC6',
          warning: '#FB8C00',
        },
      },
    },
  },
})

export default vuetify