import chalk from 'chalk'
import { describe, it, expect, vi, afterEach } from 'vitest'

import { LogLevel } from '../src/config'
import { useChecker } from '../src/runtime/validator'

vi.mock('prettier', () => ({
  format: vi.fn().mockImplementation((str: string) => {
    if (typeof str !== 'string') {
      throw new TypeError('invalid')
    }
    return 'valid'
  })
}))

vi.mock('html-validate')

vi.spyOn(console, 'error')
vi.spyOn(console, 'log')
vi.spyOn(console, 'warn')

describe('useChecker', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('logs an error', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any)

    await checker('https://test.com/', '<a><a>Link</a></a>')
    expect(mockValidator).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalled()
  })

  it('prints an error when invalid html is provided', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: false, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false)

    await checker('https://test.com/', '<a>Link</a>')
    expect(mockValidator).toHaveBeenCalled()
    expect(console.error).toHaveBeenCalled()
  })

  it('prints a warning when invalid html is provided and log level is set to verbose', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [{ messages: [{ message: '' }] }] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, LogLevel.verbose)

    await checker('https://test.com/', '<a>Link</a>')
    expect(mockValidator).toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('prints a warning when invalid html is provided and log level is set to warning', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, LogLevel.warning)

    await checker('https://test.com/', '<a>Link</a>')
    expect(mockValidator).toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

  it('prints no warning when invalid html is provided and log level is set to error', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, LogLevel.error)

    await checker('https://test.com/', '<a>Link</a>')
    expect(mockValidator).toHaveBeenCalled()
    expect(console.warn).not.toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
  })

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
      '<a data-v-35b4e14a data-v-35b4e14a>Link</a>'
    )
    expect(mockValidator).toHaveBeenCalledWith(
      '<a>Link</a>'
    )
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
    expect(console.error).toHaveBeenCalled()

    const validate = await import('html-validate')
    expect(validate.formatterFactory).not.toHaveBeenCalledWith('codeframe')
  })

  it('logs valid output', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, LogLevel.verbose)

    await checker('https://test.com/', Symbol as any)
    expect(console.log).toHaveBeenCalledWith(
      `No HTML validation errors found for ${chalk.bold('https://test.com/')}`
    )
  })

  it('does not log valid output when logging on level warning', async () => {
    const mockValidator = vi.fn().mockImplementation(() => ({ valid: true, results: [] }))
    const { checkHTML: checker } = useChecker({ validateString: mockValidator } as any, false, LogLevel.warning)

    await checker('https://test.com/', Symbol as any)
    expect(console.log).not.toHaveBeenCalled()
  })
})
