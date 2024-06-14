import { promises as fsp } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect, vi } from 'vitest'
import { setup, useTestContext } from '@nuxt/test-utils'
import { useNuxt } from '@nuxt/kit'

const error = vi.fn()
Object.defineProperty(console, 'error', {
  get() {
    return error
  },
  set() {},
})

await setup({
  rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
  build: true,
  nuxtConfig: {
    hooks: {
      'modules:before'() {
        const nuxt = useNuxt()
        nuxt.options.nitro.prerender = { routes: ['/'] }
      },
    },
  },
})

describe('Nuxt prerender', () => {
  it('should add hook for generating HTML', async () => {
    const ctx = useTestContext()
    const html = await fsp.readFile(
      resolve(ctx.nuxt!.options.nitro.output?.dir || '', 'public/index.html'),
      'utf-8',
    )

    expect(html).toContain('This is an invalid nested anchor tag')
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('HTML validation errors'),
    )
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(
        '<a> element is not permitted as a descendant of <a>',
      ),
    )
  })
})
