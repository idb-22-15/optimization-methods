<script setup lang="ts">
import type { Plot } from '@observablehq/plot'
import { ImageDown } from 'lucide-vue-next'
import { toSvg } from 'html-to-image'

const props = defineProps<{
  plot: (HTMLElement | SVGSVGElement) & Plot
}>()
const plotWrapperRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  plotWrapperRef.value?.appendChild(props.plot)
})

watch(() => props.plot, (value, _old) => {
  plotWrapperRef.value?.lastChild?.remove()
  plotWrapperRef.value?.appendChild(value)
})

async function download() {
  if (!plotWrapperRef.value?.lastChild)
    return
  const dataUrl = await toSvg(plotWrapperRef.value.lastChild as HTMLElement)
  const link = document.createElement('a')
  link.download = 'plot.svg'
  link.href = dataUrl
  link.click()
}
</script>

<template>
  <div ref="plotWrapperRef" role="img" class="relative">
    <ImageDown
      class="top-0 right-0 p-2 bg-white absolute cursor-pointer rounded-lg hover:bg-primary-foreground transition-colors "
      :size="50"
      :stroke-width="1.5"
      @click="download"
    />
  </div>
</template>
