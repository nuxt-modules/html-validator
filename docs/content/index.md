---
title: Introduction
description: 'Automatically validate Nuxt server-rendered HTML (SSR and SSG) to detect common issues with HTML that can lead to hydration errors, as well as improve accessibility and best practice.'
category: Getting started
---
::u-container

![Light preview](/preview.png){class="block dark:hidden w-full rounded-xl shadow"}
![Dark preview](/preview-dark.png){class="hidden dark:block w-full rounded-xl shadow"}

Validate your SSR/SSG HTML automatically to catch hydration and accessibility issues before they ship.

## Key features

- Zero-configuration required
- Helps reduce hydration errors
- Detects common accessibility mistakes

This module configures [`html-validate`](https://html-validate.org/) to automatically validate Nuxt server-rendered HTML (SSR and SSG) to detect common issues with HTML that can lead to hydration errors, as well as improve accessibility and best practice.

## Quick start

### Install
```bash [Terminal]
npx nuxi@latest module add html-validator
```

### Configure Nuxt

::tabs
:::tabs-item{label="Nuxt 3"}
```js
defineNuxtConfig({
  modules: ['@nuxtjs/html-validator']
})
```
:::
:::tabs-item{label="Nuxt 2.9+"}
```js
export default {
  buildModules: ['@nuxtjs/html-validator']
}
```
:::
:::tabs-item{label="Nuxt < 2.9"}
```js
export default {
  // Install @nuxtjs/html-validator as a dependency instead of devDependency
  modules: ['@nuxtjs/html-validator']
}
```
:::
::


::note
`html-validator` won't be added to your production bundle — it's only used in development and at build/generate time.
::

## Configuration

`@nuxtjs/html-validator` exposes four options:

- `usePrettier` enables prettier printing of your source code to show errors in-context.

  ::tip
  Consider not enabling this if you are using TailwindCSS, as prettier will struggle to cope with parsing the size of your HTML in development mode.
  ::

- `logLevel` sets the verbosity to one of `verbose`, `warning` or `error`. It defaults to `verbose` in dev, and `warning` when generating.

  ::note
  Use this option to turn off console logging for the `No HTML validation errors found for ...` message.
  ::

- `failOnError` will throw an error after running `nuxt generate` if there are any validation errors with the generated pages.

  ::tip
  Useful in continuous integration.
  ::

- `options` allows you to pass in `html-validate` options that will be merged with the default configuration.

  ::note
  You can find more about configuring `html-validate` [here](https://html-validate.org/rules/index.html).
  ::

**Defaults**

```js [nuxt.config.ts]
{
  htmlValidator: {
    usePrettier: false,
    logLevel: 'verbose',
    failOnError: false,
    /** A list of routes to ignore (that is, not check validity for). */
    ignore: [/\\.(xml|rss|json)$/],
    options: {
      extends: [
        'html-validate:document',
        'html-validate:recommended',
        'html-validate:standard'
      ],
      rules: {
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
        'no-inline-style': 'off'
      }
    }
  }
}
```

**You're good to go!**

Every time you hard-refresh (server-render) a page in Nuxt, you will see any HTML validation issues printed in your server console.
