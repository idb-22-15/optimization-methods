<script setup lang="ts">
import { newPlot, react } from 'plotly.js-dist-min'
import type * as Plotly from 'plotly.js-dist-min'

const props = defineProps<{
  data: Plotly.Data[]
  layout?: Partial<Plotly.Layout>
  config?: Partial< Plotly.Config>
}>()

const plotWrapperRef = ref<HTMLDivElement | null>(null)

function setPlot() {
  if (!plotWrapperRef.value)
    return
  newPlot(plotWrapperRef.value, props.data, props.layout, props.config)
}

onMounted(() => {
  setPlot()
})

watchEffect(() => {
  if (!plotWrapperRef.value)
    return
  react(plotWrapperRef.value, props.data, props.layout, props.config)
})
</script>

<template>
  <div ref="plotWrapperRef" class="w-fit" />
</template>
