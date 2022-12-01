import chalk from 'chalk'
import { ConfigData, HtmlValidate, formatterFactory } from 'html-validate'
import type { LogLevel } from '../config'

export const getValidator = (options: ConfigData = {}) => {
  return new HtmlValidate(options)
}

export const useChecker = (
  validator: HtmlValidate,
  usePrettier = false,
  logLevel: LogLevel = 'verbose'
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
      if (logLevel === 'verbose') {
        console.log(`No HTML validation errors found for ${chalk.bold(url)}`)
      }

      return
    }

    if (!valid) { invalidPages.push(url) }

    // TODO: investigate the many levels of default
    const formatter = couldFormat ? formatterFactory('codeframe') : await import('@html-validate/stylish').then(r => r.default?.default ?? r.default ?? r)

    const formattedResult = formatter?.(results)
    const message = [
      `HTML validation errors found for ${chalk.bold(url)}`,
      ...(formattedResult ? [formattedResult] : [])
    ].join('\n')

    if (valid) {
      if (logLevel === 'verbose' || logLevel === 'warning') {
        console.warn(message)
      }
    } else {
      console.error(message)
    }
  }

  return { checkHTML, invalidPages }
}
