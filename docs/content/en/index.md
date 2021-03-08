---
title: Introduction
description: 'Automatically validate Nuxt server-rendered HTML (SSR and SSG) to detect common issues with HTML that can lead to hydration errors, as well as improve accessibility and best practice.'
category: Getting started
items:
 - Zero-configuration required
 - Helps reduce hydration errors
 - Detects common accessibility mistakes

---

<img src="/preview.png" class="light-img" />
<img src="/preview-dark.png" class="dark-img" />

## Key features

<list :items="items"></list>

This module configures [`html-validate`](https://html-validate.org/) to automatically validate Nuxt server-rendered HTML (SSR and SSG) to detect common issues with HTML that can lead to hydration errors, as well as improve accessibility and best practice.

## Quick start

1. **Install the module**

  <code-group>
    <code-block label="Yarn" active>

    ```bash
    yarn add @nuxtjs/html-validator --dev
    ```

    </code-block>
    <code-block label="NPM">

    ```bash
    npm install @nuxtjs/html-validator --save-dev
    ```

    </code-block>

  </code-group>

2. **Enable module**

  <code-group>
    <code-block label="Nuxt 2.9+" active>

    ```js{}[nuxt.config.js]
    {
      buildModules: ['@nuxtjs/html-validator']
    }
    ```

    </code-block>
    <code-block label="Nuxt < 2.9">

    ```js{}[nuxt.config.js]
    {
      // Install @nuxtjs/html-validator as dependency instead of devDependency
      modules: ['@nuxtjs/html-validator']
    }
    ```

    </code-block>

  </code-group>

  <alert type="info">`html-validator` won't be added to your production bundle - it's just used in development and at build/generate time.</alert>

3. **Add configuration** (optional)

   `@nuxtjs/html-validator` takes two options.

   - `usePrettier` enables prettier printing of your source code to show errors in-context.

      <alert>Consider not enabling this if you are using TailwindCSS, as prettier will struggle to cope with parsing the size of your HTML in development mode.</alert>

   - `options` allows you to pass in `html-validate` options that will be merged with the default configuration

      <alert type="info">You can find more about configuring `html-validate` [here](https://html-validate.org/rules/index.html).</alert>

   **Defaults**

   ```js{}[nuxt.config.js]
   {
     htmlValidator: {
       usePrettier: false,
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

4. **You're good to go!**

   Every time you hard-refresh (server-render) a page in Nuxt, you will see any HTML validation issues printed in your server console.
