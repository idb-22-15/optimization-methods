import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  
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
  runtimeConfig: {
    public: {
      posthogPublicKey: 'phc_cqwkS30Ryuk6jRZm0QLsO6dh0ExR5DeaDVL1KU10hOI',
      posthogHost: "https://eu.i.posthog.com"
    }
  }
})
