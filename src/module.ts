import { fileURLToPath } from 'url'
import chalk from 'chalk'

import { defineNuxtModule, isNuxt2, logger, resolveModule } from '@nuxt/kit'
import { DEFAULTS, ModuleOptions } from './config'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/html-validator',
    configKey: 'htmlValidator',
    compatibility: {
      nuxt: '^2.0.0 || ^3.0.0-rc.7',
      bridge: true
    }
  },
  defaults: DEFAULTS,
  async setup (_options, nuxt) {
    logger.info(`Using ${chalk.bold('html-validate')} to validate server-rendered HTML`)

    const { usePrettier, failOnError, options } = _options as Required<ModuleOptions>
    if ((nuxt.options as any).htmlValidator?.options?.extends) {
      options.extends = (nuxt.options as any).htmlValidator.options.extends
    }

    if (nuxt.options.dev) {
      nuxt.hook('nitro:config', (config) => {
        // Transpile the nitro plugin we're injecting
        config.externals = config.externals || {}
        config.externals.inline = config.externals.inline || []
        config.externals.inline.push('@nuxtjs/html-validator')

        // Add a nitro plugin that will run the validator for us on each request
        config.plugins = config.plugins || []
        config.plugins.push(fileURLToPath(new URL('./runtime/nitro', import.meta.url)))
        config.virtual = config.virtual || {}
        config.virtual['#html-validator-config'] = `export default ${JSON.stringify(_options)}`
      })
    }

    if (!nuxt.options.dev || isNuxt2()) {
      const validatorPath = fileURLToPath(new URL('./runtime/validator', import.meta.url))
      const { useChecker, getValidator } = await import(resolveModule(validatorPath))
      const validator = getValidator(options)
      const { checkHTML, invalidPages } = useChecker(validator, usePrettier)

      if (failOnError) {
        const errorIfNeeded = () => {
          if (invalidPages.length) {
            throw new Error('html-validator found errors')
          }
        }

        nuxt.hook('generate:done', errorIfNeeded)
        nuxt.hook('close', errorIfNeeded)
      }

      // Nuxt 3/Nuxt Bridge prerendering

      nuxt.hook('nitro:init', (nitro) => {
        nitro.hooks.hook('prerender:generate', (route) => {
          if (!route.contents || !route.fileName?.endsWith('.html')) { return }
          checkHTML(route.route, route.contents)
        })
      })

      // Nuxt 2

      if (isNuxt2()) {
        nuxt.hook('render:route', (url: string, result: { html: string }) => checkHTML(url, result.html))
        nuxt.hook('generate:page', ({ path, html }: { path: string, html: string }) => checkHTML(path, html))
      }
    }
  }
})
