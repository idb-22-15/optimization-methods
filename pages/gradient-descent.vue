<script setup lang="ts">
import Plotly from 'plotly.js-dist'
import { getFunction } from '~/math/core'

const data: Plotly.Data[] = [
  {





    
    x: ['giraffes', 'orangutans', 'monkeys'],
    y: [20, 14, 23],
    z: [1, 2, 3],
    type: 'surface',
  },
]

onMounted(() => {
  console.log('111')
  Plotly.newPlot('3d-plot', data)
})
</script>

<template>
  <main class="p-4">
    8888
    <div id="3d-plot" />
  </main>
</template>
