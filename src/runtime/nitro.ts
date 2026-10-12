import type { NitroAppPlugin } from 'nitro/types'
import { useChecker, getValidator, isIgnored } from './validator'
// @ts-expect-error virtual module
import config from '#html-validator-config'

export default <NitroAppPlugin> function (nitro) {
  const validator = getValidator(config.options)
  const { checkHTML } = useChecker(validator, config.usePrettier, config.logLevel)

  nitro.hooks.hook('response', async (response, event) => {
    const url = new URL(event.req.url)
    const path = url.pathname + url.search
    if (!response.body || !response.headers.get('content-type')?.includes('html') || isIgnored(path, config.ignore)) {
      return
    }
    const promise = response.clone().text().then(body => checkHTML(path, body))
    if (config.hookable) {
      await nitro.hooks.callHook('html-validator:check', await promise, response, { event })
    }
  })
}
