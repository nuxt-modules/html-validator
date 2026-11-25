import type { RendererPlugin } from 'nuxt/server'
import { useServerHooks } from 'nuxt/server'
import { useChecker, getValidator, isIgnored } from './validator'
// @ts-expect-error virtual module
import config from '#html-validator-config'

export default (({ hooks }) => {
  const validator = getValidator(config.options)
  const { checkHTML } = useChecker(validator, config.usePrettier, config.logLevel)

  hooks.hook('render:document', async (document, { event }) => {
    if (isIgnored(event.url.pathname, config.ignore)) {
      return
    }

    const promise = checkHTML(event.url.pathname, document.html)

    if (config.hookable) {
      await useServerHooks().callHook('html-validator:check', await promise, document, { event })
    }
  })
}) satisfies RendererPlugin
