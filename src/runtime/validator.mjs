import chalk from 'chalk'
import { HtmlValidate, formatterFactory } from 'html-validate'

/** @param {import('html-validate').ConfigData} options */
export const getValidator = (options = {}) => {
  return new HtmlValidate(options)
}

/**
 * @param {import('html-validate').HtmlValidate} validator
 */
export const useChecker = (
  validator,
  usePrettier = false
) => {
  /** @type {string[]} */
  const invalidPages = []

  /**
   * @param {string} url
   * @param {string} html
   */
  const checkHTML = async (url, html) => {
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
    html = typeof html === 'string' ? html.replace(/ ?data-v-[a-z0-9]+\b/g, '') : html
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
