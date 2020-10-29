import { defaultHtmlValidateConfig } from '../src/config'
import { useValidator } from '../src/validator'

describe('useValidator', () => {
  it('generates a new validator for each set of options', () => {
    const option1 = { extends: [] }
    const { validator: validator1 } = useValidator(option1)
    const { validator: validator2 } = useValidator({ extends: ['html-validate:document'] })
    const { validator: validator3 } = useValidator(option1)
    const { validator: validator4 } = useValidator()
    const { validator: validator5 } = useValidator()

    expect(validator1).not.toEqual(validator2)
    expect(validator1).toEqual(validator3)
    expect(validator4).toEqual(validator5)
  })

  it('returns a valid htmlValidate instance', () => {
    const { validator } = useValidator({ extends: ['html-validate:standard'] })

    const { valid, results } = validator.validateString('<!DOCTYPE html><title>x</title>')
    expect(valid).toBeTruthy()
    expect(results).toEqual([])

    const { valid: invalid, results: invalidResults } = validator.validateString('<!DOCTYPE html><title>x</title><body><a><a>Test</a></a></body>')
    expect(invalid).toBeFalsy()
    expect(invalidResults).toMatchSnapshot()
  })

  it('works with default config', () => {
    const { validator } = useValidator(defaultHtmlValidateConfig)
    const { valid, results } = validator.validateString('<!DOCTYPE html><title>x</title>')
    expect(valid).toBeTruthy()
    expect(results).toEqual([])
  })
})
