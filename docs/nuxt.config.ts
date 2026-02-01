export default defineNuxtConfig({
  extends: ['docus'],
  content: {
    experimental: { sqliteConnector: 'native' },
  },
  compatibilityDate: '2024-08-19',
})
