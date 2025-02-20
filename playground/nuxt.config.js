import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@nuxtjs/html-validator'],
  routeRules: {
    '/redirect': {
      redirect: '/',
    },
  },
  compatibilityDate: '2024-08-19',
})
