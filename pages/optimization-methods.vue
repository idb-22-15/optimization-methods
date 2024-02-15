<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import * as Plot from '@observablehq/plot'

import { compile } from 'mathjs/number'
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

import { roundToFixed } from '~/utils/math'
import { Range, fibonacciDivisionAnswer, goldenRatioDivisionAnswer, halfDivisionAnswer } from '~/utils/optimization-methods'

const decimalPlaces = ref(3)
const toRounded = (x: number) => roundToFixed(x, decimalPlaces.value)

const methods = ['Метод половинного деления', 'Метод золотого сечения', 'Метод чилел Фибоначчи'] as const
type Method = typeof methods[number]

const selectedMethod = ref<Method>(methods[0])

const plotRef = ref<HTMLDivElement | null>(null)

const fAsString = ref('x^3')
const expr = computed(() => {
  try {
    const res = compile(fAsString.value)
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

const initialRange = ref(
  new Range({
    start: -10,
    end: 10,
  }),
)

const l = ref(0.2)

function makeSlicedPlotArea(initialRange: Range, range: Range, minY: number, maxY: number): [Plot.Area, Plot.Area] {
  const leftArea = Plot.areaX(
    [
      { x: range.start, y: minY },
      { x: range.start, y: maxY },
    ],
    { x: 'x', y: 'y', x1: initialRange.start, x2: range.start, opacity: 0.1 },
  )

  const rightArea = Plot.areaX(
    [
      { x: range.start, y: minY },
      { x: range.start, y: maxY },
    ],
    { x: 'x', y: 'y', x1: range.end, x2: initialRange.end, opacity: 0.1 },
  )

  return [leftArea, rightArea]
}

const countDots = ref(100)

const epsilon = ref(0.2)

function findAnswerRanges(range: Range): Range[] {
  switch (selectedMethod.value) {
    case 'Метод половинного деления' : return halfDivisionAnswer(range, f, epsilon.value, toRounded)
    case 'Метод золотого сечения' : return goldenRatioDivisionAnswer(range, f, epsilon.value, toRounded)
    case 'Метод чилел Фибоначчи': return fibonacciDivisionAnswer(range, f, epsilon.value, l.value, toRounded)
  }
}
const answerRanges = computed(() => findAnswerRanges(initialRange.value))
const selectedStep = ref(answerRanges.value.length - 1)
const selectedAnswerRanges = computed(() => answerRanges.value.slice(0, selectedStep.value + 1))
const steps = computed(() => answerRanges.value.length - 1)

const data = computed(() =>
  Array<number>(countDots.value)
    .fill(0)
    .map(
      (_, i) => initialRange.value.start + i * (initialRange.value.width / (countDots.value - 1)),
    )
    .map(x => ({ x, y: f(x) })),
)
const minY = computed(() => Math.min(...data.value.map(d => d.y)))
const maxY = computed(() => Math.max(...data.value.map(d => d.y)))

const slisedAreas = computed(() =>
  selectedAnswerRanges.value.map(r => makeSlicedPlotArea(initialRange.value, r, minY.value, maxY.value)).flat(),
)
function selectStep(step: number) {
  selectedStep.value = step
}

watch(selectedMethod, () => {
  selectedStep.value = steps.value
})

const { height: windowHeight } = useWindowSize()
const plot = computed(() =>
  Plot.plot({
    label: '',
    labelArrow: 'none',
    // marginLeft: 65,
    height: windowHeight.value * 0.9,
    //   width: plotWidth.value,
    aspectRatio: 1,
    grid: true,
    marks: [
      Plot.line(data.value, { x: 'x', y: 'y', stroke: 'blue', curve: 'natural' }),
      selectedAnswerRanges.value
        .at(-1)!
        .dots.map(dot => [
          Plot.dot([dot], { x: d => d, y: d => f(d), stroke: 'orange' }),
          Plot.crosshair([dot], { x: d => d, y: d => f(d) }),
        ]),

      ...slisedAreas.value,

      Plot.ruleY([f(initialRange.value.start)]),
      Plot.ruleX([initialRange.value.start]),
      Plot.dot([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle,
        y: d => f(d.middle),
        stroke: 'red',
      }),
      Plot.crosshair([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle,
        y: d => f(d.middle),
      }),
      /* Plot.crosshair([answerDotData.value], { x: 'x', y: 'y' }),
      Plot.dot([answerDotData.value], {
        x: 'x',
        y: 'y',
        fill: 'red',
      }), */
      // Plot.frame(),
    ],
  }),
)
// const plotWidth = ref(window.innerWidth)

onMounted(() => {
  plotRef.value!.appendChild(plot.value)
})

watch(plot, (value, old) => {
  plotRef.value?.removeChild(old)
  plotRef.value?.appendChild(value)
})
</script>

<template>
  <main class="px-8 mx-auto my-4 flex gap-4 flex-col">
    <h1 class="text-2xl font-bold">
      Методы оптимизации
    </h1>
    <section class="grid grid-cols-[max-content_1fr] gap-4">
      <div ref="plotRef" role="img" />
      <div class="flex flex-col gap-4">
        <Tabs v-model="selectedMethod">
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

        <div class="flex flex-row gap-2 items-center">
          <h4 class="">
            Функция
          </h4>
          <fieldset class="flex gap-4 items-center">
            <Label :class="[expr === null ? 'ring-red-500' : '']"> f(x)</Label>
            <Input :model-value="fAsString" class="w-[300px]" type="text" placeholder="x^2 + 1" @change="s => fAsString = (s as string)" />
          </fieldset>
        </div>
        <div class="flex flex-row gap-8 items-center">
          <h4 class="">
            Интервал
          </h4>
          <fieldset class="flex gap-4 items-center">
            <Label for="range-start" class="text-base">От</Label>
            <Input id="range-start" v-model="initialRange.start" type="number" class="w-20" name="" />
          </fieldset>
          <div class="flex gap-4 items-center">
            <Label for="range-start" class="text-base">До</Label>
            <Input id="range-end" v-model="initialRange.end" type="number" class="w-20" name="" />
          </div>
        </div>
        <div class="grid w-[600px] grid-rows-2 grid-cols-2 gap-x-8 gap-y-2">
          <fieldset class="flex justify-between items-center gap-4">
            <Label for="accuracy-epsilon" class="text-base">Точность&nbsp;&nbsp;&epsilon;</Label>
            <Input
              id="accuracy-epsilon"
              v-model.number="epsilon"
              type="number"
              class="w-20"
              min="0.001"
              step="0.01"
              max="1"
            />
          </fieldset>
          <fieldset class="flex items-center justify-between gap-4">
            <Label for="decimal-places" class="text-base">Знаков после запятой</Label>
            <Input
              id="decimal-places"
              v-model.number="decimalPlaces"
              type="number"
              class="w-20"
              min="2"
              step="1"
              max="10"
            />
          </fieldset>

          <fieldset class="flex justify-between  items-center gap-4">
            <Label for="count-dots" class="text-base">Количество точек</Label>
            <Input
              id="count-dots"
              v-model.number="countDots"
              type="number"
              class="w-20"
              min="2"
              max="1000"
            />
          </fieldset>

          <fieldset class="flex justify-between items-center gap-4">
            <Label for="count-steps" class="text-base">Количество шагов</Label>
            <Input
              id="count-steps"
              :value="steps"
              disabled
              :placeholder="steps"
              type="number"
              class="w-20"
              min="2"
              max="1000"
            />
          </fieldset>
        </div>
        <div class="flex flex-col">
          <span class="text-lg font-bold">Шаги</span>

          <RadioGroup class="" :model-value="`${selectedStep}`">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Шаг k</TableHead>
                  <TableHead>L</TableHead>
                  <TableHead>x</TableHead>
                  <TableHead>f(x)</TableHead>
                  <TableHead>y</TableHead>
                  <TableHead>f(y)</TableHead>
                  <TableHead>z</TableHead>
                  <TableHead>f(z)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow
                  v-for="(range, i) in answerRanges"
                  :key="range.toString()"
                  :class="[i === selectedStep ? 'bg-zinc-200' : '']"
                  class="cursor-pointer"
                  @click="selectStep(i)"
                >
                  <TableCell>
                    <RadioGroupItem :value="`${i}`" />
                  </TableCell>
                  <TableCell>
                    <span>{{ i === 0 ? '-' : i - 1 }}</span>
                  </TableCell>
                  <TableCell>{{ range.toString() }}</TableCell>
                  <TableCell>{{ range.middle }}</TableCell>
                  <TableCell>{{ toRounded(f(range.middle)) }}</TableCell>
                  <TableCell>{{ range.dots[0] }}</TableCell>
                  <TableCell>{{ range.dots.length ? toRounded(f(range.dots[0])) : '' }}</TableCell>
                  <TableCell>{{ range.dots[1] }}</TableCell>
                  <TableCell>{{ range.dots.length ? toRounded(f(range.dots[1])) : '' }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </RadioGroup>
        </div>
      </div>
    </section>
  </main>
</template>
