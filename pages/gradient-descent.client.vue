<script setup lang="ts">
import type * as Plotly from 'plotly.js-dist-min'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { type Vec2, getFunction } from '~/math/core'
import { useFunction } from '~/composables/core'
import { type ExerciseVariant, type ExerciseVariantKey, variants } from '~/math/variants/gradient-descent-variants'
import { Method, gradientDescentWithConstantStep } from '~/math/gradient-descent'
import { useMethodParams } from '~/composables/gradient-descent'
import SelectVariant, { type SelectVariantHeader } from '~/components/SelectVariant.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'
import PlotFigure3d from '~/components/PlotFigure3d.vue'
import SelectMethod, { type MethodData } from '~/components/SelectMethod.vue'

const resizablePlotRef = ref<HTMLInputElement | null>(null)
const { height: windowHeight } = useWindowSize()
const { width: resizablePlotWidth } = useElementSize(resizablePlotRef, { width: 500, height: 500 })

const { f, fString, x0, x1Interval, x2Interval, epsilon1, epsilon2, M, setExerciseVariant } = useMethodParams()

const dots = 30

const xs = useSequence(x1Interval, dots)
const ys = useSequence(x2Interval, dots)

const zs = computed(() => {
  const layers: number[][] = []
  if (!f.value)
    return []

  for (const x of xs) {
    const layer = []
    for (const y of ys) {
      const z = f.value({ x1: x, x2: y })!
      layer.push(z)
    }
    layers.push(layer)
  }
  return layers
})
const steps = ref(0)

const data = computed<Plotly.Data[] >(() => [
  {
    x: xs,
    y: ys,
    z: zs.value,
    type: 'surface',
  },
])

const layout = computed< Partial<Plotly.Layout>>(() => ({
  width: resizablePlotWidth.value,
  height: windowHeight.value * 0.8 || 500,
}))

const config: Partial<Plotly.Config> = { displaylogo: false, responsive: true, displayModeBar: false }

const methods: MethodData[] = [{
  method: Method.gradientDescentWithConstantStep,
  title: 'Метод градиентного спуска с постоянный шагом',
}]

const selectedMethod = ref(methods[0].method)

const variantsHeaders: SelectVariantHeader<ExerciseVariantKey>[] = [
  {
    key: 'order',
    title: '№',
  },
  {
    key: 'f',
    title: 'f(x₁, x₂)',
  },
  {
    key: 'x0',
    title: 'x₀',
  },
  {
    key: 'epsilon1',
    title: 'Ɛ₁',
  },
  {
    key: 'epsilon2',
    title: 'Ɛ₂',
  },
  {
    key: 'M',
    title: 'M',
  },
]
</script>

<template>
  <main class="p-4">
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel ref="resizablePlotRef">
        <PlotFigure3d :data="data" :layout="layout" :config="config" />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel :collapsible="true" :collapsed-size="20" :min-size="30" class="ml-4">
        <section>
          <SelectMethod v-model="selectedMethod" :methods="methods" />
          <Label class="whitespace-nowrap text-base" for="function">Функция f(x)</Label>
          <Input
            id="function" class="min-w-[160px]"
            :model-value="fString"
            :class="[f === null ? 'bg-red-100' : '']"
            type="text"
            placeholder="x^2 + 1"
            @change="fString = ($event.target as HTMLInputElement).value"
          />
          <SelectVariant
            class="col-span-2 w-fit 2xl:-order-1 2xl:justify-self-end 2xl:[grid-area:1/1/2/3]"
            :headers="variantsHeaders"
            :variants="variants as any"
            @select:variant="setExerciseVariant($event as any)"
          />
          <h4 class="whitespace-nowrap">
            Интервал L<sub>0</sub>
          </h4>
          <div class="col-span-3 grid w-max grid-cols-[1fr_1fr] items-center gap-4 2xl:col-span-1">
            <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
              <Label for="x1-start" class="text-base">От</Label>
              <Input id="x1-start" v-model="x1Interval.start" type="number" class="w-20" name="" />
            </fieldset>
            <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
              <Label for="x1-end" class="text-base">До</Label>
              <Input id="x1-end" v-model="x1Interval.end" type="number" class="w-20" name="" />
            </fieldset>
          </div>

          <Label for="accuracy-epsilon1" class="whitespace-nowrap text-base">Точность Ɛ₁</Label>
          <Input
            id="accuracy-epsilon1"
            v-model.number="epsilon1"
            type="number"
            min="0.001"
            step="0.01"
            max="1"
          />
          <Label for="accuracy-epsilon2" class="whitespace-nowrap text-base">Точность Ɛ₂</Label>
          <Input
            id="accuracy-epsilon2"
            v-model.number="epsilon2"
            type="number"
            min="0.001"
            step="0.01"
            max="1"
          />
          <!--   <Label for="decimal-places" class="whitespace-nowrap text-base">Знаков после запятой</Label>
        <Input
          id="decimal-places"
          v-model.number="decimalPlaces"
          type="number"
          min="2"
          step="1"
          max="10"
        /> -->

          <Label for="count-steps" class="whitespace-nowrap text-base">Количество шагов</Label>
          <Input
            id="count-steps"
            :value="steps"
            disabled
            :placeholder="steps"
            type="number"
            min="2"
            max="1000"
          />
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  </main>
</template>
