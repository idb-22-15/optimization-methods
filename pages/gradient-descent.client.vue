<script setup lang="ts">
import * as Plotly from 'plotly.js-dist-min'
import { getFunction } from '~/math/core'
import { useFunction } from '~/composables/core'
import { variants } from '~/math/variants/gradient-descent-variants'

const plotWrapperRef = ref<HTMLDivElement | null >(null)

const fString = ref(variants[14].f)
const f = useFunction(fString)

const xInterval = {
  start: -2,
  end: 2,
}

const yInterval = {
  start: -2,
  end: 2,
}

const dots = 30

const xs = Array(dots).fill(0).map((_, i) => xInterval.start + i * (xInterval.end - xInterval.start) / dots)
const ys = xs

const zs = computed(() => {
  if (f.value === null)
    return []
  const zLayers: number[][] = []

  for (const x of xs) {
    const zLayer: number[] = []
    for (const y of ys)
      zLayer.push(f.value!({ x1: x, x2: y })!)
    zLayers.push(zLayer)
  }
  return zLayers
})

const data = computed<Plotly.Data[] >(() => [
  {
    z: zs.value,
    type: 'surface',
  },
])

const layout: Partial<Plotly.Layout> = {
  width: 600,
  height: 600,

}

function setPlot() {
  if (!plotWrapperRef.value)
    return
  Plotly.newPlot(plotWrapperRef.value, data.value, layout, { displaylogo: false, responsive: true })
}

onMounted(() => {
  setPlot()
})

watchEffect(() => {
  if (!plotWrapperRef.value)
    return
  Plotly.react(plotWrapperRef.value, data.value)
})
</script>

<template>
  <main class="p-4">
    8888
    <div ref="plotWrapperRef" />
  </main>
</template>
