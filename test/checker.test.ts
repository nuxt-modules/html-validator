import { colors } from 'consola/utils'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { useChecker } from '../src/runtime/validator'

vi.mock('prettier', () => ({
  format: vi.fn().mockImplementation((str: string) => {
    if (typeof str !== 'string') {
      throw new TypeError('invalid')
    }
    return 'valid'
  }),
}))

vi.mock('html-validate')

vi.spyOn(console, 'error')
vi.spyOn(console, 'log')
vi.spyOn(console, 'warn')

describe('useChecker', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('logs valid output', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false)

    await checker('https://test.com/', Symbol as any)
    expect(console.log).toHaveBeenCalledWith(
      `No HTML validation errors found for ${colors.bold('https://test.com/')}`,
    )
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('logs valid output', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, 'verbose')

    await checker('https://test.com/', Symbol as any)
    expect(console.log).toHaveBeenCalledWith(
      `No HTML validation errors found for ${colors.bold('https://test.com/')}`,
    )
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  for (const logLevel of ['warning', 'error'] as const) {
    it(`does not log valid output when logging on level ${logLevel}`, async () => {
      const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
      const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, logLevel)

      await checker('https://test.com/', Symbol as any)
      expect(console.log).not.toHaveBeenCalled()
      expect(console.warn).not.toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
    })
  }

  for (const logLevel of [undefined, 'verbose', 'warning'] as const) {
    it(`logs a warning when valid html is provided with warnings and log level is set to ${logLevel}`, async () => {
      const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [{ messages: [{ message: '' }] }] }))
      const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, logLevel)

      await checker('https://test.com/', Symbol as any)
      expect(console.log).not.toHaveBeenCalled()
      expect(console.warn).toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
    })
  }

  it('does not log a warning when valid html is provided with warnings and log level is set to error', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [{ messages: [{ message: '' }] }] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, 'error')

    await checker('https://test.com/', Symbol as any)
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  for (const logLevel of [undefined, 'verbose', 'warning', 'error'] as const) {
    it(`logs an error when invalid html is provided and log level is set to ${logLevel}`, async () => {
      const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [{ messages: [{ message: '' }] }] }))
      const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, logLevel)

      await checker('https://test.com/', '<a>Link</a>')
      expect(mockValidator).toHaveBeenCalled()
      expect(console.log).not.toHaveBeenCalled()
      expect(console.warn).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith(
        `HTML validation errors found for ${colors.bold('https://test.com/')}`,
      )
    })
  }

  it('records urls when invalid html is provided', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [] }))
    const { checkHTML: checker, invalidPages } = useChecker({ validateString: mockValidator } as any, false)

    await checker('https://test.com/', '<a>Link</a>')
    expect(invalidPages).toContain('https://test.com/')
  })

  it('ignores Vue-generated scoped data attributes', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false)

    await checker(
      'https://test.com/',
      '<a data-v-35b4e14a data-v-35b4e14a>Link</a>',
    )
    expect(mockValidator).toHaveBeenCalledWith(
      '<a>Link</a>',
    )
    expect(console.log).toHaveBeenCalledWith(
      `No HTML validation errors found for ${colors.bold('https://test.com/')}`,
    )
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('ignores vite-plugin-inspect generated data attributes', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false)

    await checker(
      'https://test.com/',
      '<a style="color:red" class="xxx" data-v-inspector="Xxxx/Xxx.vue:2:3">Link</a>',
    )
    expect(mockValidator).toHaveBeenCalledWith(
      '<a style="color:red" class="xxx">Link</a>',
    )
    expect(console.log).toHaveBeenCalledWith(
      `No HTML validation errors found for ${colors.bold('https://test.com/')}`,
    )
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('formats HTML with prettier when asked to do so', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, true)

    await checker('https://test.com/', '<a>Link</a>')
    const { format } = await import('prettier')
    expect(format).toHaveBeenCalledWith('<a>Link</a>', { parser: 'html' })

    const formatterFactory = await import('html-validate').then(r => r.formatterFactory)
    expect(formatterFactory).toHaveBeenCalledWith('codeframe')
  })

  it('falls back gracefully when prettier cannot format', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, true)

    await checker('https://test.com/', Symbol as any)
    const { format } = await import('prettier')
    expect(format).toHaveBeenCalledWith(Symbol, { parser: 'html' })
    expect(console.log).not.toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      `HTML validation errors found for ${colors.bold('https://test.com/')}`,
    )

    const validate = await import('html-validate')
    expect(validate.formatterFactory).not.toHaveBeenCalledWith('codeframe')
  })
})
