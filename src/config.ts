import type { ConfigData } from 'html-validate'

export const defaultHtmlValidateConfig: ConfigData = {
  extends: [
    'html-validate:document',
    'html-validate:recommended',
    'html-validate:standard'
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
    // Unreasonable rule
    'no-inline-style': 'off'
  }
}

export interface ModuleOptions {
  usePrettier?: boolean
  options?: ConfigData
}

export const DEFAULTS: Required<ModuleOptions> = {
  usePrettier: false,
  options: defaultHtmlValidateConfig
}
