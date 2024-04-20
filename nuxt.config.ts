import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: true,
  css: ['~/assets/index.css'],
  devtools: { enabled: true },
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
    name: 'Методы оптимизации',
    url: 'http://optimization-methods.biplane-design.com',
  },
  alias: {
    '~': '..',
    // 'plotly.js-dist': '../node_modules/@types/plotly.js',
  },
})
