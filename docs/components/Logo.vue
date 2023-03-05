<template>
  <img class="dark-img" src="/logo-dark.svg">
  <img class="light-img" src="/logo-light.svg">
</template>

<style lang="ts">
css({
  '.light .dark-img': {
    display: 'none',
  },
  '.dark .light-img': {
    display: 'none',
  },
})
</style>
