import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },

  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icon.svg' },
      ],
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@nuxt/eslint',
    '@nuxt/fonts',
    'shadcn-nuxt',
  ],

  // style
  css: ['~/assets/index.css'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  fonts: {
    families: [{
      name: 'JetBrains Mono',
    }],
  },

  // imports
  imports: {
    autoImport: true,
    dirs: [],
  },
  components: {
    dirs: [],
  },

  site: {
    name: 'Методы оптимизации онлайн. Найти минимум функции',
    url: 'https://optimization-methods.artistick.tech',
  },
})
