<script setup lang="ts">
const cards = [{
  title: 'Методы одномерной оптимизации',
  link: '/one-dimensional-optimization',
  sub: [
    'Метод половинного деления',
    'Метод золотого сечения',
    'Метод чисел Фибоначчи',
  ],
}, {

  title: 'Методы двумерной оптимизации',
  link: '/gradient-descent',
  sub: [
    'Метод градиентного спуска с постоянным шагом',
    'Метод наискорейшего градиентного спуска',
  ],
}]
</script>

<template>
  <main class="container mx-auto flex  flex-col min-h-[50dvh] justify-center items-center gap-8">
    <h1 class="text-4xl">
      Найти минимум функции 🚀
    </h1>
    <section class="flex gap-4">
      <NuxtLink
        v-for="card in cards"
        :key="card.link"
        :to="card.link"
        class="flex transition-colors hover:bg-secondary flex-col gap-2 border-2 border-primary rounded-lg p-8"
      >
        <h2 class="font-bold text-xl mb-2">
          {{ card.title }}
        </h2>
        <ul class="flex flex-col gap-2">
          <li v-for="subtitle in card.sub" :key="subtitle">
            {{ subtitle }}
          </li>
        </ul>
      </NuxtLink>
    </section>
  </main>
</template>
