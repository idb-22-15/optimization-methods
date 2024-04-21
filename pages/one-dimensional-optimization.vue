<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core'
import * as Plot from '@observablehq/plot'

import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'

import {
  type ExerciseVariant,
  type ExerciseVariantKey,
  variants,
} from '~/math/variants/one-dimensional-optimization-variants'

import {
  type AnswerData,
  type Dot,
  type FibonacciDivisionStepData,
  type GoldenRatioDivisionStepData,
  type HalfDivisionStepData,
  type InitialXRange,
  Method,
  type YZDots,
  fibonacciDivisionMethod,
  goldenRatioDivisionMethod,
  halfDivisionMethod,
} from '~/math/one-dimensional-optimization'

import { useFunction } from '~/composables/core'
import SelectVariant, { type SelectVariantHeader } from '~/components/SelectVariant.vue'
import PlotFigure from '~/components/PlotFigure.vue'
import { useMethodParams } from '~/composables/one-dimensional-optimization'
import SelectMethod, { type MethodData } from '~/components/SelectMethod.vue'
import type { Interval } from '~/math/core'

defineOgImageComponent('Frame', {})

const methods: MethodData[] = [
  {
    method: Method.halfDivision,
    title: 'Метод половинного деления',
  },
  {
    method: Method.goldenRatio,
    title: 'Метод золотого сечения',
  },
  {
    method: Method.fibonacci,
    title: 'Метод чисел Фибоначчи',
  },
]
const { f, fString, range1d, range2d, setExerciseVariant, epsilon } = useMethodParams()

const selectedMethod = ref<string>(methods[0].method)

const plotRef = ref<HTMLDivElement | null>(null)

function makeSlicedPlotArea(initialRange: Interval<Dot>, range: Interval<Dot>, minY: number, maxY: number): [Plot.Area, Plot.Area] {
  const leftArea = Plot.areaX(
    [
      { x: range.start.x, y: minY },
      { x: range.start.x, y: maxY },
    ],
    { x: 'x', y: 'y', x1: initialRange.start.x, x2: range.start.x, opacity: 0.1 },
  )

  const rightArea = Plot.areaX(
    [
      { x: range.start.x, y: minY },
      { x: range.start.x, y: maxY },
    ],
    { x: 'x', y: 'y', x1: range.end.x, x2: initialRange.end.x, opacity: 0.1 },
  )

  return [leftArea, rightArea]
}

const resultData = computed<{
  ans: AnswerData
  stepsData: HalfDivisionStepData[] | GoldenRatioDivisionStepData[] | FibonacciDivisionStepData[]
}>(() => {
  switch (selectedMethod.value) {
    case Method.halfDivision : return halfDivisionMethod(f.value, range1d.value, epsilon.value)
    case Method.goldenRatio : return goldenRatioDivisionMethod(f.value, range1d.value, epsilon.value)
    case Method.fibonacci: return fibonacciDivisionMethod(f.value, range1d.value, epsilon.value)
    default: throw new Error('no method')
  }
})

// const halfDivisionMethodResultData = computed(() => halfDivisionMethod(f, range1d.value, epsilon.value))
// const goldenRatioDivisionMethodResultData = computed(() => goldenRatioDivisionMethod(f, range1d.value, epsilon.value))
// const fibonacciDivisionMethodResultData = computed(() => fibonacciDivisionMethod(f, range1d.value, epsilon.value, l.value))

type Step = 'initial' | number | 'answer'
const selectedStep = ref<Step>('answer')

const selectedResultData = computed<Interval<Dot>[]>(() => {
  if (selectedStep.value === 'initial')
    return [range2d.value]

  else if (selectedStep.value === 'answer')
    return [...resultData.value.stepsData, resultData.value.ans]

  else
    return resultData.value.stepsData.slice(0, selectedStep.value + 1)
})
const steps = computed(() => resultData.value.stepsData.length)

const COUNT_DOTS = 100
const interval = computed<Interval<number>>(() => ({ start: range1d.value.a, end: range1d.value.b }))
const data = computed<Dot[]>(() => useSequence(interval, COUNT_DOTS).value.map(x => ({
  x,
  fx: f.value(x),
})))

const minY = computed(() => Math.min(...data.value.map(d => d.fx)))
const maxY = computed(() => Math.max(...data.value.map(d => d.fx)))

const slicedAreas = computed(() =>
  selectedResultData.value.map(r => makeSlicedPlotArea(range2d.value, r, minY.value, maxY.value)).flat(),
)

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { width: plotRefWidth } = useElementSize(plotRef, { width: windowWidth.value, height: windowHeight.value })

const plotRefSize = computed(() => {
  const height = Math.min(windowHeight.value * 0.9, plotRefWidth.value)
  return height
})

function makeYZPlots(stepsData: YZDots[], step: Step): Plot.Markish[] {
  if (typeof step !== 'number')
    return []

  const selectedStepData = stepsData.at(step)
  if (!selectedStepData)
    return []

  const yzPlots = [
    Plot.dot([selectedStepData.y, selectedStepData.z], { x: 'x', y: 'fx', stroke: 'blue' }),
    Plot.crosshair([selectedStepData.y, selectedStepData.z], { x: 'x', y: 'fx', stroke: 'blue' }),
    Plot.text([selectedStepData.y], { x: 'x', y: 'fx', text: () => 'y', dy: -20, fontSize: 16, lineAnchor: 'bottom' }),
    Plot.text([selectedStepData.z], { x: 'x', y: 'fx', text: () => 'z', dy: -20, fontSize: 16, lineAnchor: 'bottom' }),
  ]
  return yzPlots
}

const yzPlots = computed(() => makeYZPlots(resultData.value.stepsData, selectedStep.value))

const answerPlot = computed(() => [
  Plot.dot([resultData.value.ans.min], { x: 'x', y: 'fx', stroke: 'red' }),
  Plot.crosshair([resultData.value.ans.min], { x: 'x', y: 'fx', stroke: 'red' }),
])

const plot = computed(() =>
  Plot.plot({
    label: '',
    labelArrow: 'none',
    // marginLeft: 65,
    height: plotRefSize.value,
    width: plotRefSize.value,
    aspectRatio: 1,
    grid: true,
    marks: [
      Plot.line(data.value, { x: 'x', y: 'fx', stroke: 'blue', curve: 'natural' }),
      slicedAreas.value,
      answerPlot.value,
      yzPlots.value,
    ],
  }),
)

function selectStep(step: Step) {
  selectedStep.value = step
}

watch([selectedMethod, fString, range1d, epsilon], () => {
  selectedStep.value = 'answer'
})

const variantsHeaders: SelectVariantHeader<ExerciseVariantKey>[] = [
  {
    key: 'order',
    title: '№',
  },
  {
    key: 'f',
    title: 'f(x)',
  },
  {
    key: 'range',
    title: 'L₀',
  },
  {
    key: 'epsilon',
    title: 'Ɛ',
  },
]

useSeoMeta({
  title: 'Методы одномерной оптимизации',
  description: 'Методы одномерной оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фибоначчи',
  ogTitle: 'Методы одномерной оптимизации',
  ogDescription: 'Методы одномерной оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фибоначчи',
})
</script>

<template>
  <main class="mx-auto my-4 flex flex-col gap-4 px-8">
    <section class="grid grid-cols-[minmax(700px,1fr),1fr] grid-rows-[repeat(2,auto)] gap-4 xl:grid-cols-[1fr] xl:grid-rows-[repeat(3,auto)]">
      <PlotFigure :plot="plot" class="row-span-2 2xl:row-span-1" />

      <section class="grid h-max grid-cols-[repeat(2,max-content_1fr)] items-center gap-x-8 gap-y-4 2xl:grid-cols-[max-content,1fr]">
        <SelectMethod
          v-model="selectedMethod" :methods="methods"
          tab-class="col-span-4 "
          select-class="2xl:-order-1 2xl:[grid-area:1/1/2/3]"
        />

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
          :variants="variants"
          @select:variant="setExerciseVariant"
        />
        <h4 class="whitespace-nowrap">
          Интервал L<sub>0</sub>
        </h4>
        <div class="col-span-3 grid w-max grid-cols-[1fr_1fr] items-center gap-4 2xl:col-span-1">
          <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
            <Label for="range-start" class="text-base">От</Label>
            <Input id="range-start" v-model="range1d.a" type="number" class="w-20" name="" />
          </fieldset>
          <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
            <Label for="range-start" class="text-base">До</Label>
            <Input id="range-end" v-model="range1d.b" type="number" class="w-20" name="" />
          </fieldset>
        </div>

        <Label for="accuracy-epsilon" class="whitespace-nowrap text-base">Точность &epsilon;</Label>
        <Input
          id="accuracy-epsilon"
          v-model.number="epsilon"
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

      <section class="flex flex-col whitespace-nowrap 2xl:col-span-2 xl:col-span-1">
        <RadioGroup class="w-full" :model-value="`${selectedStep}`">
          <Table class="overflow-x-scroll">
            <TableHeader>
              <TableRow>
                <TableHead>Старт</TableHead>
                <TableHead>L<sub>0</sub></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                class="cursor-pointer"
                @click="selectStep('initial')"
              >
                <TableCell><RadioGroupItem value="initial" /></TableCell>
                <TableCell>[{{ range1d.a }}, {{ range1d.b }}]</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table class="overflow-x-scroll">
            <TableHeader>
              <TableRow>
                <TableHead>Шаг k</TableHead>
                <TableHead>a</TableHead>
                <TableHead>b</TableHead>
                <TableHead>y</TableHead>
                <TableHead>f(y)</TableHead>
                <TableHead>z</TableHead>
                <TableHead>f(z)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                v-for="(stepData, i) in resultData.stepsData"
                :key="stepData.toString()"
                :class="[i === selectedStep ? 'bg-zinc-200' : '']"
                class="cursor-pointer"
                @click="selectStep(i)"
              >
                <TableCell class="space-x-4">
                  <RadioGroupItem :id="`step-${i}`" :value="`${i}`" />
                  <Label :for="`step-${i}`">{{ stepData.step }}</Label>
                </TableCell>
                <TableCell>{{ stepData.start.x }}</TableCell>
                <TableCell>{{ stepData.end.x }}</TableCell>
                <TableCell>{{ stepData.y.x }}</TableCell>
                <TableCell>{{ stepData.y.fx }}</TableCell>
                <TableCell>{{ stepData.z.x }}</TableCell>
                <TableCell>{{ stepData.z.fx }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Результат</TableHead>
                <TableHead>L</TableHead>
                <TableHead>x</TableHead>
                <TableHead>f(x)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                class="cursor-pointer"
                @click="selectStep('answer')"
              >
                <TableCell><RadioGroupItem value="answer" /></TableCell>
                <TableCell>[{{ resultData.ans.start.x }}, {{ resultData.ans.end.x }}]</TableCell>
                <TableCell>{{ resultData.ans.min.x }}</TableCell>
                <TableCell>{{ resultData.ans.min.fx }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </RadioGroup>
      </section>
    </section>
  </main>
</template>
