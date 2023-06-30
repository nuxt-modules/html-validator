import { describe, it, expect } from 'vitest'
import { defaultHtmlValidateConfig } from '../src/config'
import { getValidator } from '../src/runtime/validator'

describe('useValidator', () => {
  it('generates a new validator for each set of options', () => {
    const option1 = { extends: [] }
    const validator1 = getValidator(option1)
    const validator2 = getValidator({ extends: ['html-validate:document'] })
    const validator3 = getValidator(option1)
    const validator4 = getValidator()
    const validator5 = getValidator()

    expect(validator1).not.toEqual(validator2)
    expect(validator1).toEqual(validator3)
    expect(validator4).toEqual(validator5)
  })

  it('returns a valid htmlValidate instance', async () => {
    const validator = getValidator({ extends: ['html-validate:standard'] })

    const { valid, results } = await validator.validateString('<!DOCTYPE html><title>x</title>')
    expect(valid).toBeTruthy()
    expect(results).toEqual([])

    const { valid: invalid, results: invalidResults } = await validator.validateString('<!DOCTYPE html><title>x</title><body><a><a>Test</a></a></body>')
    expect(invalid).toBeFalsy()
    expect(invalidResults).toMatchSnapshot()
  })

  it('works with default config', async () => {
    const validator = getValidator(defaultHtmlValidateConfig)
    const { valid, results } = await validator.validateString('<!DOCTYPE html><title>x</title>')
    expect(valid).toBeTruthy()
    expect(results).toEqual([])
  })
})
