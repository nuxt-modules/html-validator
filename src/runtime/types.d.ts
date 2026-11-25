import type { Result } from 'html-validate'

declare module 'nuxt/schema' {
  interface NuxtServerHooks {
    'html-validator:check': (result: { valid: boolean, results: Result[] }, document: { html: string }, context: {
      event: {
        url: URL
      }
    }) => void | Promise<void>
  }
}
