<script setup lang="ts">
import { buttonVariants } from '~/components/ui/button'

const route = useRoute()

const links = [{
  title: 'Методы одномерной оптимизации',
  link: '/one-dimensional-optimization',
}, {
  title: 'Методы двумерной оптимизации',
  link: '/gradient-descent',
}]
</script>

<template>
  <header class="container flex gap-4 py-4 mb-4 justify-between items-center">
    <NuxtLink to="/" class="flex gap-2 items-center">
      <img src="/icon.svg" alt="" class="w-10 h-10">
      <span class="font-medium text-xl"> Методы оптимизации</span>
    </NuxtLink>

    <nav>
      <ul class="flex gap-x-4">
        <li v-for="link in links" :key="link.link">
          <NuxtLink
            :to="link.link"
            :class="[buttonVariants({ variant: 'ghost' }), route.path === link.link ? 'font-bold' : '']"
          >
            {{ link.title }}
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>
