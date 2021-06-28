import chalk from 'chalk'
import consola from 'consola'
import { ConfigData, HtmlValidate, formatterFactory } from 'html-validate'

const validators = new Map<ConfigData, HtmlValidate>()

const defaultOptions = {}

export const useValidator = (options: ConfigData = defaultOptions) => {
  if (validators.has(options)) {
    return { validator: validators.get(options)! }
  }

  const validator = new HtmlValidate(options)

  validators.set(options, validator)

  return { validator }
}

export const useChecker = (
  validator: HtmlValidate,
  usePrettier = false,
  reporter = consola.withTag('html-validate')
) => async (url: string, html: string) => {
  let couldFormat = false
  try {
    if (usePrettier) {
      const { format } = await import('prettier')
      html = format(html, { parser: 'html' })
      couldFormat = true
    }
    // eslint-disable-next-line
  } catch (e) {
    reporter.error(e)
  }

  // Clean up Vue scoped style attributes
  html = typeof html === 'string' ? html.replace(/ ?data-v-[a-z0-9]+\b/g, '') : html

  const { valid, results } = validator.validateString(html)

  if (valid) {
    return reporter.success(
      `No HTML validation errors found for ${chalk.bold(url)}`
    )
  }

  const formatter = couldFormat ? formatterFactory('codeframe') : formatterFactory('stylish')

  const formattedResult = formatter!(results)

  reporter.error(
    [
      `HTML validation errors found for ${chalk.bold(url)}`,
      formattedResult
    ].join('\n')
  )
}
