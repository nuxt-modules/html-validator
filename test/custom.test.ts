import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

const error = vi.fn()
Object.defineProperty(console, 'error', {
  get() {
    return error
  },
  set() {},
})

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  nuxtConfig: {
    htmlValidator: {
      options: {
        extends: [],
      },
    },
  },
})

describe('custom options', () => {
  it('overriding extends does not merge array', async () => {
    await $fetch('/')
    expect(console.error).not.toHaveBeenCalled()
  })
})
