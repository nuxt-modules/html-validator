export default defineAppConfig({
  header: {
    title: '@nuxtjs/html-validator',
    logo: {
      light: '/logo-light.svg',
      dark: '/logo-dark.svg',
      alt: 'HTML Validator Logo',
    },
  },
  url: 'https://html-validator.nuxtjs.org',
  description: 'The best place to start your documentation.',
  image: 'https://html-validator.nuxtjs.org/preview.png',
  aside: {
    level: 0,
    exclude: [],
  },
  footer: {
    iconLinks: [
      {
        href: 'https://nuxt.com',
        icon: 'simple-icons:nuxtdotjs',
      },
    ],
  },
})
