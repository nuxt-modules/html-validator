import { fileURLToPath, pathToFileURL } from 'node:url'
import chalk from 'chalk'
import { normalize } from 'pathe'
import { isWindows } from 'std-env'
import { genArrayFromRaw, genObjectFromRawEntries } from 'knitwork'

import { createResolver, defineNuxtModule, isNuxt2, logger, resolvePath } from '@nuxt/kit'
import { DEFAULTS } from './config'
import type { ModuleOptions } from './config'

export type { ModuleOptions }

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@nuxtjs/html-validator',
    configKey: 'htmlValidator',
    compatibility: {
      nuxt: '^2.0.0 || ^3.0.0-rc.7',
    },
  },
  defaults: nuxt => ({
    ...DEFAULTS,
    logLevel: nuxt.options.dev ? 'verbose' : 'warning',
  }),
  async setup(moduleOptions, nuxt) {
    logger.info(`Using ${chalk.bold('html-validate')} to validate server-rendered HTML`)

    const { usePrettier, failOnError, options, logLevel } = moduleOptions as Required<ModuleOptions>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((nuxt.options as any).htmlValidator?.options?.extends) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options.extends = (nuxt.options as any).htmlValidator.options.extends
    }

    const { resolve } = createResolver(import.meta.url)

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
        console.log(serialisedOptions)
        config.virtual['#html-validator-config'] = `export default ${serialisedOptions}`
      })

      nuxt.hook('prepare:types', ({ references }) => {
        const types = resolve('./runtime/types.d.ts')
        references.push({ path: types })
      })
    }

    if (!nuxt.options.dev || isNuxt2()) {
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

        // @ts-expect-error TODO: use @nuxt/bridge-schema
        nuxt.hook('generate:done', errorIfNeeded)
        nuxt.hook('close', errorIfNeeded)
      }

      // Nuxt 3/Nuxt Bridge prerendering

      nuxt.hook('nitro:init', (nitro) => {
        nitro.hooks.hook('prerender:generate', (route) => {
          if (!route.contents || !route.fileName?.endsWith('.html')) {
            return
          }
          checkHTML(route.route, route.contents)
        })
      })

      // Nuxt 2

      if (isNuxt2()) {
        // @ts-expect-error TODO: use @nuxt/bridge-schema
        nuxt.hook('render:route', (url: string, result: { html: string }) => checkHTML(url, result.html))
        // @ts-expect-error TODO: use @nuxt/bridge-schema
        nuxt.hook('generate:page', ({ path, html }: { path: string, html: string }) => checkHTML(path, html))
      }
    }
  },
})
