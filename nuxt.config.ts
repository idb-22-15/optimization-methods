import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/index.css'],
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    'shadcn-nuxt',
    'nuxt-module-eslint-config',
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  eslintConfig: {
    setup: false,
  },
  googleFonts: {
    families: {
      'Roboto Mono': true,
    },
  },
  imports: {
    autoImport: true,
    dirs: [],
  },
  components: {
    dirs: [],
  },
})
