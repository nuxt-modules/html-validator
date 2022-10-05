import type { NitroAppPlugin, RenderResponse } from 'nitropack'
import { useChecker, getValidator } from './validator'
// @ts-expect-error virtual module
import config from '#html-validator-config'

export default <NitroAppPlugin> function (nitro) {
  const validator = getValidator(config.options)
  const { checkHTML } = useChecker(validator, config.usePrettier, config.isVerbose)

  nitro.hooks.hook('render:response', (response: RenderResponse, { event }) => {
    if (typeof response.body === 'string' && (response.headers['Content-Type'] || response.headers['content-type'])?.includes('html')) {
      // We deliberately do not await so as not to block the response
      checkHTML(event.req.url, response.body)
    }
  })
}
