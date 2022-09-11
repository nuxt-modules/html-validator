import { readFileSync } from 'fs'
import { resolve } from 'path'
import { setupTest, get, generate, getNuxt } from '@nuxt/test-utils'

import * as validator from '../src/validator'

const mockReporter = {
  error: jest.fn(),
  info: jest.fn(),
  success: jest.fn()
}

jest.mock('consola', () => ({
  info: jest.fn(),
  success: jest.fn(),
  debug: jest.fn(),
  withTag: jest.fn().mockImplementation(() => mockReporter)
}))

describe('Nuxt module', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../example',
    server: true,
    generate: true
  })

  test('should add hook to server response', async () => {
    const { body } = await get('/')

    expect(body).toContain('This is an invalid nested anchor tag')
    expect(mockReporter.error).toHaveBeenCalledWith(
      expect.stringContaining('element-permitted-content')
    )
  }, 50000)

  test('should add hook for generating HTML', async () => {
    await generate()

    const html = readFileSync(resolve(getNuxt().options.generate.dir, 'index.html'), 'utf8')

    expect(html).toContain('This is an invalid nested anchor tag')
    expect(mockReporter.error).toHaveBeenCalledWith(
      expect.stringContaining('index.html')
    )
    expect(mockReporter.error).toHaveBeenCalledWith(
      expect.stringContaining(
        '<a> element is not permitted as a descendant of <a>'
      )
    )
  }, 50000)
})

describe('custom options', () => {
  setupTest({
    testDir: __dirname,
    fixture: '../example',
    config: {
      htmlValidator: {
        options: {
          extends: []
        }
      }
    }
  })

  jest.spyOn(validator, 'useValidator')

  test('overriding extends does not merge array', () => {
    expect(validator.useValidator).toHaveBeenCalledWith(expect.objectContaining({
      extends: []
    }))
  }, 50000)
})
