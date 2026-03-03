export default defineAppConfig({
  header: {
    title: '@nuxtjs/html-validator',
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
      alt: 'HTML Validator Logo',
    },
  },
  socials: {
    github: 'https://github.com/nuxt-modules/html-validator',
  },
  seo: {
    url: 'https://html-validator.nuxtjs.org',
    description:
      'Automatically validate Nuxt server-rendered HTML (SSR and SSG) to detect common issues with HTML that can lead to hydration errors, as well as improve accessibility and best practice.',
    image: 'https://html-validator.nuxtjs.org/preview.png',
  },
  ui: {
    colors: {
      primary: 'green',
    },
  },
  toc: {
    bottom: {
      title: 'Community',
      links: [
        {
          icon: 'i-lucide-book-open',
          label: 'Nuxt docs',
          to: 'https://nuxt.com',
          target: '_blank',
        },
      ],
    },
  },
})
