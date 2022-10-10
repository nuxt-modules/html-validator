import chalk from 'chalk'
import { ConfigData, HtmlValidate, formatterFactory } from 'html-validate'

export const getValidator = (options: ConfigData = {}) => {
  return new HtmlValidate(options)
}

export const useChecker = (
  validator: HtmlValidate,
  usePrettier = false
) => {
  const invalidPages: string[] = []

  const checkHTML = async (url: string, html: string) => {
    let couldFormat = false
    try {
      if (usePrettier) {
        const { format } = await import('prettier')
        html = format(html, { parser: 'html' })
        couldFormat = true
      }
    } catch (e) {
      console.error(e)
    }

    // Clean up Vue scoped style attributes
    html = typeof html === 'string' ? html.replace(/ ?data-v-[-a-z0-9]+\b/g, '') : html
    const { valid, results } = validator.validateString(html)

    if (valid && !results.length) {
      return console.log(
        `No HTML validation errors found for ${chalk.bold(url)}`
      )
    }

    if (!valid) { invalidPages.push(url) }

    // TODO: investigate the many levels of default
    const formatter = couldFormat ? formatterFactory('codeframe') : await import('@html-validate/stylish').then(r => r.default?.default ?? r.default ?? r)

    const formattedResult = formatter?.(results)
    const reporter = valid ? console.warn : console.error

    reporter([
      `HTML validation errors found for ${chalk.bold(url)}`,
      formattedResult
    ].join('\n'))
  }

  return { checkHTML, invalidPages }
}
