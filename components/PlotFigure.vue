<script setup lang="ts">
import type { Plot } from '@observablehq/plot'

const props = defineProps<{
  plot: (HTMLElement | SVGSVGElement) & Plot
}>()
const plotWrapperRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  plotWrapperRef.value?.appendChild(props.plot)
})

watch(() => props.plot, (value, _old) => {
  plotWrapperRef.value?.firstChild?.remove()
  plotWrapperRef.value?.appendChild(value)
})
</script>

<template>
  <div ref="plotWrapperRef" role="img" />
</template>
