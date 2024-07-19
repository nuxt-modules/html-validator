import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  experimental: {
    payloadExtraction
  },
  modules: ['@nuxtjs/html-validator'],
})
