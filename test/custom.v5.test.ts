import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, useTestContext } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/nuxt-v5', import.meta.url)),
  dev: true,
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
    const getLogs = () => useTestContext().serverLogs.join('\n')

    await $fetch('/')
    await expect.poll(getLogs, { timeout: 10_000 }).toContain('No HTML validation errors found')
    expect(getLogs()).not.toContain('element-permitted-content')
  }, 20_000)
})
