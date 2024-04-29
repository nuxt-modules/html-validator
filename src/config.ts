import type { ConfigData } from 'html-validate'

export const defaultHtmlValidateConfig: ConfigData = {
  extends: [
    'html-validate:document',
    'html-validate:recommended',
    'html-validate:standard',
  ],
  rules: {
    //
    'svg-focusable': 'off',
    'no-unknown-elements': 'error',
    // Conflicts or not needed as we use prettier formatting
    'void-style': 'off',
    'no-trailing-whitespace': 'off',
    // Conflict with Nuxt defaults
    'require-sri': 'off',
    'attribute-boolean-style': 'off',
    'doctype-style': 'off',
    // Unreasonable rule
    'no-inline-style': 'off',
  },
}

export type LogLevel = 'verbose' | 'warning' | 'error'

export interface ModuleOptions {
  usePrettier?: boolean
  logLevel?: LogLevel
  failOnError?: boolean
  options?: ConfigData
  /**
   * A list of routes to ignore (that is, not check validity for)
   * @default [/\.(xml|rss|json)$/]
   */
  ignore?: Array<string | RegExp>
  /**
   * allow to hook into `html-validator`
   * enabling this option block the response until the HTML check and the hook has finished
   *
   * @default false
   */
  hookable?: boolean
}

export const DEFAULTS: Required<Omit<ModuleOptions, 'logLevel'>> & { logLevel?: LogLevel } = {
  usePrettier: false,
  failOnError: false,
  options: defaultHtmlValidateConfig,
  hookable: false,
  ignore: [/\.(xml|rss|json)$/],
}
