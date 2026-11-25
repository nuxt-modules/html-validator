import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch, useTestContext } from '@nuxt/test-utils'

await setup({
  rootDir: fileURLToPath(new URL('./fixtures/nuxt-v5', import.meta.url)),
  dev: true,
})

describe('Nuxt dev', () => {
  it('should add hook to server response', async () => {
    const body = await $fetch('/')
    const getLogs = () => useTestContext().serverLogs.join('\n')

    expect(body).toContain('This is an invalid nested anchor tag')
    await expect.poll(getLogs, { timeout: 10_000 }).toContain('element-permitted-content')
    expect(getLogs()).not.toContain('NUXT_E8013')
    expect(getLogs()).not.toContain('NUXT_B9001')
  }, 20_000)
})
