<script setup lang="ts">
import type * as Plotly from 'plotly.js-dist-min'
import { useElementSize, useWindowSize } from '@vueuse/core'
import { type Vec2, getFunction, isValidFunction } from '~/math/core'
import { useFunction } from '~/composables/core'
import { type ExerciseVariant, type ExerciseVariantKey, variants } from '~/math/variants/gradient-descent-variants'
import { Method, type StepData, gradientDescentWithConstantStep } from '~/math/gradient-descent'
import { useMethodParams } from '~/composables/gradient-descent'
import SelectVariant, { type SelectVariantHeader } from '~/components/SelectVariant.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '~/components/ui/resizable'
import PlotFigure3d from '~/components/PlotFigure3d.client.vue'
import SelectMethod, { type MethodData } from '~/components/SelectMethod.vue'

useSeoMeta({
  title: 'Методы двумерной оптимизации',
  description: 'Методы двумерной оптимизации для нахождения глобальных минимумов функции. Метод градиентного спуска с постоянным шагом. Метод наискорейшего градиентного спуска.',
  ogTitle: 'Методы двумерной оптимизации',
  ogDescription: 'Методы двумерной оптимизации для нахождения глобальных минимумов функции. Метод градиентного спуска с постоянным шагом. Метод наискорейшего градиентного спуска.',
})

type Step = 'initial' | number | 'answer'
const selectedStep = ref<Step>('answer')

function selectStep(step: Step) {
  selectedStep.value = step
}

const resizablePlotRef = ref<HTMLInputElement | null>(null)
const { height: windowHeight } = useWindowSize()
const { width: resizablePlotWidth } = useElementSize(resizablePlotRef, { width: 500, height: 500 })

const methods: MethodData[] = [{
  method: Method.gradientDescentWithConstantStep,
  title: 'Метод градиентного спуска с постоянный шагом',
}, {
  method: Method.gradientDescentFastest,
  title: 'Метод наискорейшего градиентного спуска',
}]

const selectedMethod = ref(methods[0].method)
const {
  f,
  fString,
  x0,
  x1Interval,
  x2Interval,
  epsilon1,
  epsilon2,
  M,
  l,
  setExerciseVariant,
  result,
} = useMethodParams(selectedMethod)

const dots = 50

const xs = useSequence(x1Interval, dots)
const ys = useSequence(x2Interval, dots)

const zs = computed(() => {
  const layers: number[][] = []
  if (!f.value)
    return []

  for (const y of ys.value) {
    const layer = []
    for (const x of xs.value) {
      const z = f.value({ x1: x, x2: y })!
      layer.push(z)
    }
    layers.push(layer)
  }
  return layers
})

const startDot = computed(() => {
  if (!f.value || !isValidFunction(f.value, x0.value))
    return null

  return {
    x: [x0.value.x1],
    y: [x0.value.x2],
    z: [f.value(x0.value)],
    type: 'scatter3d',
    marker: {
      size: 7,
      color: 'black',
    },
  } satisfies Plotly.Data
})

const resultPlot = computed(() => {
  if (!result.value)
    return []
  const resultPlot: Plotly.Data[] = []

  const stepsPlot = {
    x: [] as number[],
    y: [] as number[],
    z: [] as number[],
    type: 'scatter3d',
    mode: 'lines+markers',
    marker: {
      color: 'blue',
      size: 5,

    },
    line: { width: 5 },
  } satisfies Plotly.Data

  for (const step of result.value.stepsData) {
    stepsPlot.x.push(step.x.x1)
    stepsPlot.y.push(step.x.x2)
    stepsPlot.z.push(step.fx)
  }

  if (typeof selectedStep.value === 'number') {
    stepsPlot.x = stepsPlot.x.slice(0, selectedStep.value + 1)
    stepsPlot.y = stepsPlot.y.slice(0, selectedStep.value + 1)
    stepsPlot.z = stepsPlot.z.slice(0, selectedStep.value + 1)
  }

  if (selectedStep.value !== 'initial')
    resultPlot.push(stepsPlot)

  const answerDot = {
    x: [result.value.answer.x.x1],
    y: [result.value.answer.x.x2],
    z: [result.value.answer.fx],
    type: 'scatter3d',
    marker: {
      size: 7,
      color: 'red',
    },
  } satisfies Plotly.Data

  if (selectedStep.value === 'answer') {
    resultPlot.push(answerDot)
    stepsPlot.x.push(result.value.answer.x.x1)
    stepsPlot.y.push(result.value.answer.x.x2)
    stepsPlot.z.push(result.value.answer.fx)
  }

  return resultPlot
})

const data = computed<Plotly.Data[] >(() => {
  const plot: Plotly.Data[] = [
    {
      x: xs.value,
      y: ys.value,
      z: zs.value,
      type: 'surface',
      opacity: 0.2,
    },
    ...resultPlot.value,
  ]
  if (startDot.value)
    plot.push(startDot.value)

  return plot
})

const layout = computed< Partial<Plotly.Layout>>(() => ({
  width: resizablePlotWidth.value,
  height: windowHeight.value * 0.8 || 500,
  showlegend: false,
  scene: {

    xaxis: { title: 'x1' },
    yaxis: { title: 'x2' },
    zaxis: { title: 'f(x₁, x₂)' },
  },

}))

const config: Partial<Plotly.Config> = { displaylogo: false, responsive: true, displayModeBar: false }

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
  <main class="container">
    <ResizablePanelGroup direction="horizontal" class="[overflow:visible_!important]">
      <ResizablePanel ref="resizablePlotRef" as-child :min-size="30">
        <ClientOnly>
          <PlotFigure3d :data="data" :layout="layout" :config="config" />
        </ClientOnly>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel :min-size="40" class="ml-4 flex flex-col gap-4 [overflow:visible_!important]" as-child>
        <section class="grid h-max grid-cols-2 items-center gap-x-8 gap-y-4">
          <SelectMethod v-model="selectedMethod" :methods="methods" />
          <SelectVariant
            class="w-fit 2xl:justify-self-end"
            :headers="variantsHeaders"
            :variants="variants"
            @select:variant="(variant) => {
              setExerciseVariant(variant)
              selectedStep = 'answer'
            }"
          />
          <div class="col-start-1 col-end-3">
            <Label class="whitespace-nowrap text-base" for="function">Функция f(x₁, x₂)</Label>
            <Input
              id="function" class="min-w-[160px]"
              :model-value="fString"
              :class="[f === null ? 'bg-red-100' : '']"
              type="text"
              placeholder="x^2 + 1"
              @change="fString = ($event.target as HTMLInputElement).value"
            />
          </div>

          <div class="">
            <h4 class="whitespace-nowrap">
              Исходная точка (x<sub>1</sub>, x<sub>2</sub>)
            </h4>
            <div class="col-span-3 grid w-max grid-cols-[1fr_1fr] items-center gap-4 2xl:col-span-1">
              <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
                <Label for="x1" class="text-base">x<sub>1</sub></Label>
                <Input id="x1" v-model="x0.x1" type="number" step="0.1" class="w-20" name="" />
              </fieldset>
              <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
                <Label for="x2" class="text-base">x<sub>2</sub></Label>
                <Input id="x2" v-model="x0.x2" type="number" step="0.1" class="w-20" name="" />
              </fieldset>
            </div>
          </div>

          <div class="">
            <template v-if="selectedMethod === Method.gradientDescentWithConstantStep">
              <Label for="count-steps" class="whitespace-nowrap text-base">Исходный шаг сходимости l</Label>
              <Input
                id="count-steps"
                v-model.number="l"
                :placeholder="l"
                type="number"
                min="0.001"
                step="0.1"
                max="100"
              />
            </template>
          </div>

          <div class="">
            <h4 class="whitespace-nowrap">
              Интервал x<sub>1</sub>
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
          </div>

          <div class="">
            <h4 class="whitespace-nowrap">
              Интервал x<sub>2</sub>
            </h4>
            <div class="col-span-3 grid w-max grid-cols-[1fr_1fr] items-center gap-4 2xl:col-span-1">
              <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
                <Label for="x2-start" class="text-base">От</Label>
                <Input id="x2-start" v-model="x2Interval.start" type="number" class="w-20" name="" />
              </fieldset>
              <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
                <Label for="x2-end" class="text-base">До</Label>
                <Input id="x2-end" v-model="x2Interval.end" type="number" class="w-20" name="" />
              </fieldset>
            </div>
          </div>

          <div class="">
            <Label for="accuracy-epsilon1" class="whitespace-nowrap text-base">Точность Ɛ₁</Label>
            <Input
              id="accuracy-epsilon1"
              v-model.number="epsilon1"
              type="number"
              min="0.001"
              step="0.01"
              max="1"
            />
          </div>

          <div class="">
            <Label for="accuracy-epsilon2" class="whitespace-nowrap text-base">Точность Ɛ₂</Label>
            <Input
              id="accuracy-epsilon2"
              v-model.number="epsilon2"
              type="number"
              min="0.001"
              step="0.01"
              max="1"
            />
          </div>
          <div class="">
            <Label for="count-steps" class="whitespace-nowrap text-base">Максимум шагов M</Label>
            <Input
              id="count-steps"
              v-model.number="M"
              :placeholder="M"
              type="number"
              min="1"
              max="50"
            />
          </div>
        </section>
        <section v-if="result" class="flex flex-col whitespace-nowrap 2xl:col-span-2 xl:col-span-1">
          <RadioGroup class="w-full" :model-value="`${selectedStep}`">
            <Table class="overflow-x-scroll">
              <TableHeader>
                <TableRow>
                  <TableHead>Шаг k</TableHead>
                  <TableHead>x<sub>k</sub></TableHead>
                  <TableHead>f(x<sub>k</sub>)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(stepData, i) in result.stepsData"
                  :key="stepData.toString()"
                  :class="[i === selectedStep ? 'bg-zinc-200' : '']"
                  class="cursor-pointer"
                  @click="selectStep(i)"
                >
                  <TableCell class="space-x-4">
                    <RadioGroupItem :id="`step-${i}`" :value="`${i}`" />
                    <Label :for="`step-${i}`">{{ stepData.step }}</Label>
                  </TableCell>
                  <TableCell>[{{ stepData.x.x1 }}, {{ stepData.x.x2 }}]</TableCell>
                  <TableCell>{{ stepData.fx }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Результат</TableHead>
                  <TableHead>x</TableHead>
                  <TableHead>f(x)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  class="cursor-pointer"
                  @click="selectStep('answer')"
                >
                  <TableCell class="space-x-4">
                    <RadioGroupItem id="answer" value="answer" />
                    <Label for="answer">{{ result.answer.step }}</Label>
                  </TableCell>
                  <TableCell>[{{ result.answer.x.x1 }}, {{ result.answer.x.x2 }}]</TableCell>
                  <TableCell>{{ result.answer.fx }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </RadioGroup>
        </section>
      </ResizablePanel>
    </ResizablePanelGroup>
  </main>
</template>
