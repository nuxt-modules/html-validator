[![@nuxtjs/html-validator](https://html-validator.nuxtjs.org/preview.png)](https://html-validator.nuxtjs.org)

# @nuxtjs/html-validator

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions CI][github-actions-ci-src]][github-actions-ci-href]
[![Codecov][codecov-src]][codecov-href]
[![License][license-src]][license-href]

> HTML validation using [html-validate](https://html-validate.org/) for [NuxtJS](https://nuxtjs.org)

- [✨ &nbsp;Release Notes](https://html-validator.nuxtjs.org/releases)
- [📖 &nbsp;Documentation](https://html-validator.nuxtjs.org)

## Features

- Zero-configuration required
- Helps reduce hydration errors
- Detects common accessibility mistakes

[📖 &nbsp;Read more](https://html-validator.nuxtjs.org)

## Quick setup

1. Add `@nuxtjs/html-validator` dependency to your project

```bash
yarn add @nuxtjs/html-validator # or npm install @nuxtjs/html-validator
```

2. Add `@nuxtjs/html-validator` to the `buildModules` section of `nuxt.config.js`

```js
{
  buildModules: [
    '@nuxtjs/html-validator',
  ],
}
```

## Development

1. Clone this repository
2. Install dependencies using `yarn install`
3. Start development server using `yarn dev`

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/html-validator/latest.svg
[npm-version-href]: https://npmjs.com/package/@nuxtjs/html-validator

[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/html-validator.svg
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/html-validator

[github-actions-ci-src]: https://github.com/nuxt-community/html-validator-module/workflows/ci/badge.svg
[github-actions-ci-href]: https://github.com/nuxt-community/html-validator-module/actions?query=workflow%3Aci

[codecov-src]: https://img.shields.io/codecov/c/github/nuxt-community/html-validator-module.svg
[codecov-href]: https://codecov.io/gh/nuxt-community/html-validator-module

[license-src]: https://img.shields.io/npm/l/@nuxtjs/html-validator.svg
[license-href]: https://npmjs.com/package/@nuxtjs/html-validator
