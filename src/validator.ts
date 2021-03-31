import chalk from 'chalk'
import consola from 'consola'
import { ConfigData, HtmlValidate } from 'html-validate'

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

  const formatter = couldFormat
    ? await import('html-validate/dist/formatters/codeframe').then(r => r.default || /* istanbul ignore next */ r)
    : await import('html-validate/dist/formatters/stylish').then(r => r.default || /* istanbul ignore next */ r)

  const formattedResult = formatter(results)

  const urls =
    results[0]?.messages.map(
      ({ ruleId }: any) => `https://html-validate.org/rules/${ruleId}.html`
    ) || []

  reporter.error(
    [
      `HTML validation errors found for ${chalk.bold(url)}`,
      formattedResult,
      urls.length ? `${chalk.bold('More information:')}` : '',
      ...urls
    ].join('\n')
  )
}
