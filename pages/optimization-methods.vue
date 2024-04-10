<script setup lang="ts">
import { executeTransition, useElementSize, useWindowSize } from '@vueuse/core'
import * as Plot from '@observablehq/plot'

import { compile, number } from 'mathjs/number'
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
import PlotFigure from '~/components/PlotFigure'
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Select, SelectContent, SelectGroup, SelectItem, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'
import { roundToFixed } from '~/utils/math'
import { Dot, Range, fibonacciDivisionAnswer, goldenRatioDivisionAnswer, halfDivisionAnswer } from '~/utils/optimization-methods'
import type { IRange } from '~/utils/optimization-methods'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { type ExerciseVariant, exerciseVariants } from '~/assets/optimization-methods-variants'

const decimalPlaces = ref(3)
const toRounded = (x: number) => roundToFixed(x, decimalPlaces.value)

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

const range1d = ref({ start: -10, end: 10 })
const range2d = computed<Range>(() =>
  new Range({
    start: new Dot(range1d.value.start, f),
    end: new Dot(range1d.value.end, f),
    f,
  }),
) as Ref<Range>

const l = ref(0.2)

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

const countDots = ref(100)

const epsilon = ref(0.2)

function findAnswerRanges(range: Range): Range[] {
  switch (selectedMethod.value) {
    case 'Метод половинного деления' : return halfDivisionAnswer(range, f, epsilon.value, toRounded)
    case 'Метод золотого сечения' : return goldenRatioDivisionAnswer(range, f, epsilon.value, toRounded)
    case 'Метод чисел Фибоначчи': return fibonacciDivisionAnswer(range, f, epsilon.value, l.value, toRounded)
  }
}
const answerRanges = computed(() => findAnswerRanges(range2d.value))
const selectedStep = ref(answerRanges.value.length - 1)
const selectedAnswerRanges = computed(() => answerRanges.value.slice(0, selectedStep.value + 1))
const steps = computed(() => answerRanges.value.length - 1)

const data = computed<Dot[]>(() =>
  Array<number>(countDots.value)
    .fill(0)
    .map(
      (_, i) => range2d.value.start.x + i * (range2d.value.width / (countDots.value - 1)),
    )
    .map(x => ({ x, y: f(x) })),
)
const minY = computed(() => Math.min(...data.value.map(d => d.y)))
const maxY = computed(() => Math.max(...data.value.map(d => d.y)))

const slicedAreas = computed(() =>
  selectedAnswerRanges.value.map(r => makeSlicedPlotArea(range2d.value as Range, r, minY.value, maxY.value)).flat(),
)

const { width: windowWidth, height: windowHeight } = useWindowSize()
const { width: plotRefWidth } = useElementSize(plotRef, { width: windowWidth.value, height: windowHeight.value })

const plotRefSize = computed(() => {
  const height = Math.min(windowHeight.value * 0.9, plotRefWidth.value)
  return height
})

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
      Plot.line(data.value, { x: 'x', y: 'y', stroke: 'blue', curve: 'natural' }),
      selectedAnswerRanges.value
        .at(-1)!
        .dots?.map(dot => [
          Plot.dot([dot], { x: d => d.x, y: d => d.y, stroke: 'orange' }),
          Plot.crosshair([dot], { x: d => d.x, y: d => d.y }),
        ]),

      ...slicedAreas.value,

      Plot.dot([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle.x,
        y: d => d.middle.y,
        stroke: 'red',
      }),
      Plot.crosshair([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle.x,
        y: d => d.middle.y,
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

watch(plot, (value, _old) => {
  plotRef.value?.firstChild?.remove()
  plotRef.value?.appendChild(value)
})

function selectStep(step: number) {
  selectedStep.value = step
}
watch([selectedMethod, fString, range1d, epsilon], () => {
  selectedStep.value = steps.value
})

function setExerciseVariant(variant: ExerciseVariant) {
  fString.value = variant.f
  range1d.value.start = variant.range[0]
  range1d.value.end = variant.range[1]
  epsilon.value = variant.epsilon
}

useSeoMeta({
  title: 'Методы оптимизации',
  description: 'Методы оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фиббоначи',
  ogTitle: 'Методы оптимизации',
  ogDescription: 'Методы оптимизации для нахождения глобальных минимумов функции. Метод половинного деления. Метод золотого сечения. Метод чисел Фиббоначи',
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
        <Input id="function" class="min-w-[160px]" :model-value="fString" :class="[expr === null ? 'bg-red-100' : '']" type="text" placeholder="x^2 + 1" @change="s => fString = (s as string)" />
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
                  v-for="v in exerciseVariants" :key="v.order" class="cursor-pointer" tabindex="0"
                  @keypress.enter.space="setExerciseVariant(v)"
                  @click="setExerciseVariant(v)"
                >
                  <TableCell>{{ v.order }}</TableCell>
                  <TableCell>{{ v.f }}</TableCell>
                  <TableCell>{{ v.range }}</TableCell>
                  <TableCell>{{ v.epsilon }}</TableCell>
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
            <Input id="range-start" v-model="range1d.start" type="number" class="w-20" name="" />
          </fieldset>
          <fieldset class="grid grid-cols-[max-content_1fr] items-center gap-2">
            <Label for="range-start" class="text-base">До</Label>
            <Input id="range-end" v-model="range1d.end" type="number" class="w-20" name="" />
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
        <Label for="decimal-places" class="whitespace-nowrap text-base">Знаков после запятой</Label>
        <Input
          id="decimal-places"
          v-model.number="decimalPlaces"
          type="number"
          min="2"
          step="1"
          max="10"
        />
        <Label for="count-dots" class="whitespace-nowrap text-base">Количество точек</Label>
        <Input
          id="count-dots"
          v-model.number="countDots"
          type="number"
          min="2"
          max="1000"
        />
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

      <section class="flex flex-col 2xl:col-span-2 xl:col-span-1">
        <span class="font-bold">Шаги</span>

        <RadioGroup class="w-full" :model-value="`${selectedStep}`">
          <Table class="overflow-x-scroll">
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
                class="cursor-pointer whitespace-nowrap"
                @click="selectStep(i)"
              >
                <TableCell>
                  <RadioGroupItem :value="`${i}`" />
                </TableCell>
                <TableCell>
                  <span>{{ i === 0 ? '-' : i - 1 }}</span>
                </TableCell>
                <TableCell>{{ range.toString(toRounded) }}</TableCell>
                <TableCell>{{ toRounded(range.middle.x) }}</TableCell>
                <TableCell>{{ toRounded(range.middle.y) }}</TableCell>
                <TableCell>{{ range.dots?.[0].x }}</TableCell>
                <TableCell>{{ range.dots?.[0].y }}</TableCell>
                <TableCell>{{ range.dots?.[1].x }}</TableCell>
                <TableCell>{{ range.dots?.[1].y }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </RadioGroup>
      </section>
    </section>
  </main>
</template>
