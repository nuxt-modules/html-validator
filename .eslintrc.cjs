module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript'],
  overrides: [
    {
      files: ['*.test.ts', 'validator.ts'],
      rules: {
        'no-console': 'off'
      }
    }
  ]
}
