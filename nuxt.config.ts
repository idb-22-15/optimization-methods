import '@total-typescript/ts-reset'

export default defineNuxtConfig({
  ssr: false,
  css: ['~/assets/index.css'],
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', 'nuxt-module-eslint-config'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  eslintConfig: {
    setup: false,
  },
})
