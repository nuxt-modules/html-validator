import { fileURLToPath } from 'url'
import { describe, it, expect, vi } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

vi.spyOn(console, 'error')

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  nuxtConfig: {
    htmlValidator: {
      options: {
        extends: []
      }
    }
  }
})

describe('custom options', () => {
  it('overriding extends does not merge array', async () => {
    await $fetch('/')
    expect(console.error).not.toHaveBeenCalled()
  })
})
