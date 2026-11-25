import { describe, it, expect, vi, beforeEach } from 'vitest'

const config = vi.hoisted(() => ({
  options: { extends: ['html-validate:recommended'] },
  usePrettier: false,
  logLevel: 'error',
  ignore: [/\.json$/] as Array<string | RegExp>,
  hookable: false,
}))
const callHook = vi.hoisted(() => vi.fn())

vi.mock('#html-validator-config', () => ({ default: config }))
vi.mock('nuxt/server', () => ({ useServerHooks: () => ({ callHook }) }))

const { default: plugin } = await import('../src/runtime/renderer')

type RenderDocument = (document: { html: string }, context: { event: { url: URL } }) => Promise<void>

function setupPlugin() {
  let renderDocument: RenderDocument | undefined
  plugin({ hooks: { hook: (name: string, handler: RenderDocument) => {
    expect(name).toBe('render:document')
    renderDocument = handler
    return () => {}
  } } as any })
  return renderDocument!
}

const invalidHTML = '<!DOCTYPE html><html lang="en"><head><title>x</title></head><body><a href="/"><a href="/">x</a></a></body></html>'

describe('renderer plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    config.hookable = false
  })

  it('validates the rendered document', async () => {
    await setupPlugin()({ html: invalidHTML }, { event: { url: new URL('http://localhost/page?q=1') } })

    await vi.waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('/page'))
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('<a> element is not permitted as a descendant of <a>'))
    })
    expect(callHook).not.toHaveBeenCalled()
  })

  it('skips ignored paths', async () => {
    config.hookable = true
    await setupPlugin()({ html: invalidHTML }, { event: { url: new URL('http://localhost/data.json') } })

    expect(callHook).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('calls the html-validator:check hook when hookable', async () => {
    config.hookable = true
    const document = { html: invalidHTML }
    const event = { url: new URL('http://localhost/') }
    await setupPlugin()(document, { event })

    expect(callHook).toHaveBeenCalledWith('html-validator:check', expect.objectContaining({ valid: false }), document, { event })
  })
})
