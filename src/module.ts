import { fileURLToPath, pathToFileURL } from 'node:url'
import { colors } from 'consola/utils'
import { normalize } from 'pathe'
import { isWindows } from 'std-env'
import { genArrayFromRaw, genObjectFromRawEntries } from 'knitwork'

import { createResolver, defineNuxtModule, logger, resolvePath } from '@nuxt/kit'
import { DEFAULTS, NuxtRedirectHtmlRegex } from './config'
import type { ModuleOptions } from './config'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/html-validator',
    configKey: 'htmlValidator',
    compatibility: {
      nuxt: '>=3.0.0-rc.7',
    },
  },
  defaults: nuxt => ({
    ...DEFAULTS,
    logLevel: nuxt.options.dev ? 'verbose' : 'warning',
  }),
  async setup(moduleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)
    nuxt.hook('prepare:types', ({ references }) => {
      const types = resolver.resolve('./runtime/types.d.ts')
      references.push({ path: types })
    })

    if (nuxt.options._prepare || moduleOptions.enabled === false) {
      return
    }

    logger.info(`Using ${colors.bold('html-validate')} to validate server-rendered HTML`)

    const { usePrettier, failOnError, options, logLevel } = moduleOptions as Required<ModuleOptions>

    if (nuxt.options.htmlValidator?.options?.extends) {
      options.extends = nuxt.options.htmlValidator.options.extends
    }

    if (nuxt.options.dev) {
      nuxt.hook('nitro:config', (config) => {
        // Transpile the nitro plugin we're injecting
        config.externals = config.externals || {}
        config.externals.inline = config.externals.inline || []
        config.externals.inline.push('@nuxtjs/html-validator')

        // Add a nitro plugin that will run the validator for us on each request
        config.plugins = config.plugins || []
        config.plugins.push(normalize(fileURLToPath(new URL('./runtime/nitro', import.meta.url))))
        config.virtual = config.virtual || {}
        const serialisedOptions = genObjectFromRawEntries(Object.entries(moduleOptions).map(([key, value]) => {
          if (key !== 'ignore') return [key, JSON.stringify(value, null, 2)]
          const ignore = value as ModuleOptions['ignore'] || []
          return [key, genArrayFromRaw(ignore.map(v => typeof v === 'string' ? JSON.stringify(v) : v.toString()))]
        }))
        config.virtual['#html-validator-config'] = `export default ${serialisedOptions}`
      })
    }

    if (!nuxt.options.dev) {
      const validatorPath = await resolvePath(fileURLToPath(new URL('./runtime/validator', import.meta.url)))
      const { useChecker, getValidator } = await import(isWindows ? pathToFileURL(validatorPath).href : validatorPath)
      const validator = getValidator(options)
      const { checkHTML, invalidPages } = useChecker(validator, usePrettier, logLevel)

      if (failOnError) {
        const errorIfNeeded = () => {
          if (invalidPages.length) {
            throw new Error('html-validator found errors')
          }
        }
        nuxt.hook('close', errorIfNeeded)
      }

      // Prerendering

      nuxt.hook('nitro:init', (nitro) => {
        nitro.hooks.hook('prerender:generate', (route) => {
          if (!route.contents || !route.fileName?.endsWith('.html')) {
            return
          }
          if (route.contents.match(NuxtRedirectHtmlRegex)) {
            return
          }
          checkHTML(route.route, route.contents)
        })
      })
    }
  },
})
