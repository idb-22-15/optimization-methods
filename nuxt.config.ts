import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/index.css'],
  devtools: { enabled: true },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/icon.svg' },
      ],
    },
  },
  modules: [
    '@nuxtjs/google-fonts',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/seo',
    '@nuxt/eslint',
    'shadcn-nuxt',
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  // eslintConfig: {
  //   setup: false,
  // },
  googleFonts: {
    families: {
      'JetBrains Mono': true,
    },
  },
  imports: {
    autoImport: true,
    dirs: [],
  },
  components: {
    dirs: [],
  },
  site: {
    name: 'Методы оптимизации онлайн. Найти минимум функции',
    url: 'http://optimization-methods.biplane-design.com',

  },
  alias: {
    '~': '..',
    // 'plotly.js-dist': '../node_modules/@types/plotly.js',
  },

})
