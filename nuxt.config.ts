// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  app: {
    head: {
      script: [
        {
          src: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js',
          async: true,
        },
      ],
    },
    baseURL: '/learning-cards', 
  },

  runtimeConfig: {
    public: {
      dropboxAppKey: process.env.DROPBOX_APP_KEY || 'key-not-found',
    }
  },
  ssr: false,

  modules: [
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils'
  ],

  css: ['~/assets/css/main.css'],

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-27'
})