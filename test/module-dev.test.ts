import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils'

vi.spyOn(console, 'error')

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  dev: true,
})

describe.todo('Nuxt dev', () => {
  it('should add hook to server response', async () => {
    const body = await $fetch('/')

    expect(body).toContain('This is an invalid nested anchor tag')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('element-permitted-content'),
    )
  })
})
