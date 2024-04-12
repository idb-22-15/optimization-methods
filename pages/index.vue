<script setup lang="ts">
import { useElementSize, useWindowSize } from '@vueuse/core'
import * as Plot from '@observablehq/plot'

import { compile } from 'mathjs/number'
// import { type Ref, computed, onMounted, ref, watch } from 'vue'
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
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
// import { defineOgImageComponent, useHead, useSeoMeta } from '#imports'

import { type ExerciseVariant, exerciseVariants } from '~/assets/optimization-methods-variants'
import { type AnswerData, type Dot, type FibonacciDivisionStepData, type GoldenRatioDivisionStepData, type HalfDivisionStepData, type InitialXRange, type Range, type YZDots, fibonacciDivisionMethod, goldenRatioDivisionMethod, halfDivisionMethod } from '~/utils/main'

defineOgImageComponent('Frame', {})

const methods = ['Метод половинного деления', 'Метод золотого сечения', 'Метод чисел Фибоначчи'] as const
type Method = typeof methods[number]

const selectedMethod = ref<Method>(methods[0])

const plotRef = ref<HTMLDivElement | null>(null)

const fString = ref('x^3')
const expr = computed(() => {
  try {
    const res = compile(fString.value)
    return res
  }
  catch (e) {
    return null
  }
})

function f(x: number) {
  if (expr.value === null)
    return x
  try {
    const res = expr.value.evaluate({ x })
    return res as number
  }
  catch (e) {
    return x
  }
}

const range1d = ref<InitialXRange>({ a: -10, b: 10 })
const range2d = computed<{ start: Dot, end: Dot }>(() => ({
  start: {
    x: range1d.value.a,
    fx: f(range1d.value.a),
  },
  end: {
    x: range1d.value.b,
    fx: f(range1d.value.b),
  },

}))

function makeSlicedPlotArea(initialRange: Range, range: Range, minY: number, maxY: number): [Plot.Area, Plot.Area] {
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

const epsilon = ref(0.2)

const resultData = computed<{
  ans: AnswerData
  stepsData: HalfDivisionStepData[] | GoldenRatioDivisionStepData[] | FibonacciDivisionStepData[]
}>(() => {
  switch (selectedMethod.value) {
    case 'Метод половинного деления' : return halfDivisionMethod(f, range1d.value, epsilon.value)
    case 'Метод золотого сечения' : return goldenRatioDivisionMethod(f, range1d.value, epsilon.value)
    case 'Метод чисел Фибоначчи': return fibonacciDivisionMethod(f, range1d.value, epsilon.value)
    default: throw new Error('no path')
  }
})

// const halfDivisionMethodResultData = computed(() => halfDivisionMethod(f, range1d.value, epsilon.value))
// const goldenRatioDivisionMethodResultData = computed(() => goldenRatioDivisionMethod(f, range1d.value, epsilon.value))
// const fibonacciDivisionMethodResultData = computed(() => fibonacciDivisionMethod(f, range1d.value, epsilon.value, l.value))

type Step = 'initial' | number | 'answer'
const selectedStep = ref<Step>('answer')

function createArray(start: number, end: number, countItems: number) {
  const step = (end - start) / (countItems - 1)
  return Array.from({ length: countItems }, (_, index) => start + index * step)
}

const selectedResultData = computed<Range[]>(() => {
  if (selectedStep.value === 'initial')
    return [range2d.value]

  else if (selectedStep.value === 'answer')
    return [...resultData.value.stepsData, resultData.value.ans]

  else
    return resultData.value.stepsData.slice(0, selectedStep.value + 1)
})
const steps = computed(() => resultData.value.stepsData.length)

const COUNT_DOTS = 100
const data = computed<Dot[]>(() => createArray(range1d.value.a, range1d.value.b, COUNT_DOTS).map(x => ({
  x,
  fx: f(x),
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

onMounted(() => {
  plotRef.value?.appendChild(plot.value)
})

watch(plot, (value, _old) => {
  plotRef.value?.firstChild?.remove()
  plotRef.value?.appendChild(value)
})

function selectStep(step: Step) {
  selectedStep.value = step
}

watch([selectedMethod, fString, range1d, epsilon], () => {
  selectedStep.value = 'answer'
})

function setExerciseVariant(variant: ExerciseVariant) {
  fString.value = variant.f
  range1d.value.a = variant.range[0]
  range1d.value.b = variant.range[1]
  epsilon.value = variant.epsilon
}

useSeoMeta({
  title: 'Методы оптимизации',
  description: 'Методы оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фибоначчи',
  ogTitle: 'Методы оптимизации',
  ogDescription: 'Методы оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фибоначчи',
})
</script>

<template>
  <main class="mx-auto my-4 flex flex-col gap-4 px-8">
    <h1 class="text-2xl font-bold">
      Методы оптимизации
    </h1>
    <section class="grid grid-cols-[minmax(700px,1fr),1fr] grid-rows-[repeat(2,auto)] gap-4 xl:grid-cols-[1fr] xl:grid-rows-[repeat(3,auto)]">
      <section ref="plotRef" class="row-span-2 2xl:row-span-1" role="img" />

      <section class="grid h-max grid-cols-[repeat(2,max-content_1fr)] items-center gap-x-8 gap-y-4 2xl:grid-cols-[max-content,1fr]">
        <Tabs v-model="selectedMethod" class="col-span-4 2xl:hidden">
          <TabsList>
            <TabsTrigger
              v-for="method in methods"
              :key="method" :value="method"
              :class="[method === selectedMethod ? '' : '']"
            >
              <h2> {{ method }}</h2>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Select v-model="selectedMethod" name="select-method">
          <SelectTrigger class="hidden w-max 2xl:-order-1 2xl:flex 2xl:[grid-area:1/1/2/3]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Методы</SelectLabel>
              <SelectItem v-for="method in methods" :key="method" class="cursor-pointer" :value="method">
                {{ method }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Label class="whitespace-nowrap text-base" for="function">Функция f(x)</Label>
        <Input
          id="function" class="min-w-[160px]"
          :model-value="fString"
          :class="[expr === null ? 'bg-red-100' : '']"
          type="text"
          placeholder="x^2 + 1"
          @change="fString = ($event.target as HTMLInputElement).value"
        />
        <Popover>
          <PopoverTrigger as-child class="col-span-2 w-fit 2xl:-order-1 2xl:justify-self-end 2xl:[grid-area:1/1/2/3]">
            <Button variant="secondary">
              Варианты
            </Button>
          </PopoverTrigger>
          <PopoverContent class="max-h-[70dvh] w-full overflow-y-auto">
            <Table class="w-max">
              <TableHeader>
                <TableRow>
                  <TableHead>№</TableHead>
                  <TableHead>f(x)</TableHead>
                  <TableHead>L<sub>0</sub></TableHead>
                  <TableHead>&epsilon;</TableHead>
                </TableRow>
                <TableRow
                  v-for="variant in exerciseVariants" :key="variant.order" class="cursor-pointer" tabindex="0"
                  @keypress.enter.space="setExerciseVariant(variant)"
                  @click="setExerciseVariant(variant)"
                >
                  <TableCell>{{ variant.order }}</TableCell>
                  <TableCell>{{ variant.f }}</TableCell>
                  <TableCell>{{ variant.range }}</TableCell>
                  <TableCell>{{ variant.epsilon }}</TableCell>
                </TableRow>
              </TableHeader>
            </Table>
          </PopoverContent>
        </Popover>
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
