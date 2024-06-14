import type { NitroAppPlugin, RenderResponse } from 'nitropack'
import { useChecker, getValidator, isIgnored } from './validator'
// @ts-expect-error virtual module
import config from '#html-validator-config'

export default <NitroAppPlugin> function (nitro) {
  const validator = getValidator(config.options)
  const { checkHTML } = useChecker(validator, config.usePrettier, config.logLevel)

  nitro.hooks.hook('render:response', async (response: Partial<RenderResponse>, { event }) => {
    if (typeof response.body === 'string' && (response.headers?.['Content-Type'] || response.headers?.['content-type'])?.includes('html') && !isIgnored(event.path, config.ignore)) {
      // Block the response only if it's not hookable
      const promise = checkHTML(event.path, response.body)
      if (config.hookable) {
        await nitro.hooks.callHook('html-validator:check', await promise, response, { event })
      }
    }
  })
}
