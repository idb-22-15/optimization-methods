<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import * as Plot from '@observablehq/plot'
import { evaluate, parse, compile, flatten } from 'mathjs'

const plotRef = ref<HTMLDivElement | null>(null)

const fAsString = ref('x^3 + 4')
const expr = computed(() => {
  try {
    const res = compile(fAsString.value)
    return res
  } catch (e) {
    return null
  }
})

const f = computed(() => (x: number) => expr.value ? expr.value.evaluate({ x }) : x)

interface Dot {
  x: number
  y: number
}

class Range {
  public start: number
  public end: number
  public dots: number[] = []

  constructor(range: { start: number; end: number; dots?: [number, number] }) {
    this.start = range.start
    this.end = range.end
    if (range.dots) this.dots = range.dots
  }

  get width() {
    return this.end - this.start
  }

  get middle() {
    return (this.start + this.end) / 2
  }

  toString() {
    return `[${trimNumber(this.start, 3)};${trimNumber(this.end, 3)}]`
  }
}

/*
interface AnswerRange extends Range {
  answer: number
}

class AnswerRangeHalfDivision extends Range implements AnswerRange {
  constructor(range: { start: number; end: number; dots?: number[] }) {
    super(range)
  }

  get answer() {
    return this.middle
  }
}

function isAnswerRange(range: Range): range is AnswerRange {
  return 'answer' in range
}
*/

function trimNumber(num: number, maxLen: number) {
  return +num.toFixed(maxLen)
}

const initialRange = ref(
  new Range({
    start: -10,
    end: 10,
  }),
)

function halfDivision(range: Range): Range {
  const fMiddle = f.value(range.middle)
  const left = range.start + range.width / 4
  const right = range.end - range.width / 4
  const fLeft = f.value(left)
  const fRight = f.value(right)
  const dots: [number, number] = [left, right]
  if (fLeft < fMiddle) return new Range({ start: range.start, end: range.middle, dots })
  else {
    if (fMiddle > fRight) return new Range({ start: range.middle, end: range.end, dots })
    else return new Range({ start: left, end: right, dots })
  }
}

function goldenRatioDivision(range: Range): Range {
  const goldenRule = (3 - Math.sqrt(5)) / 2
  const left = range.start + goldenRule * range.width
  const right = range.start + range.end - left
  const fLeft = f.value(left)
  const fRight = f.value(right)
  const dots: [number, number] = [left, right]
  if (fLeft <= fRight) return new Range({ start: range.start, end: right, dots })
  else return new Range({ start: left, end: range.end })
}

const l = ref(0.2)
const fibNums = [1, 1, 2]
function findNextFibNum() {
  const next = fibNums.at(-1)! + fibNums.at(-2)!
  fibNums.push(next)
}

const condition = computed(() => Math.abs(initialRange.value.width) / l.value)

while (fibNums.at(-1)! >= condition.value) {
  findNextFibNum()
}
const countFibNums = computed(() => fibNums.length)

function fibonacciDivision(range: Range, k: number): Range {
  const left =
    range.start + (fibNums[countFibNums.value - k - 2] / fibNums[countFibNums.value]) * range.width
  const right =
    range.start + (fibNums[countFibNums.value - k - 1] / fibNums[countFibNums.value]) * range.width
  const fLeft = f.value(left)
  const fRight = f.value(right)
  if (fLeft <= fRight) {
    return new Range({ start: range.start, end: right })
  } else {
  }
}

const divisionMethod = halfDivision

function makeSlicedPlotArea(initialRange: Range, range: Range): [Plot.Area, Plot.Area] {
  const leftArea = Plot.areaX(
    [
      { x: range.start, y: f.value(initialRange.start) },
      { x: range.start, y: f.value(initialRange.end) },
    ],
    { x: 'x', y: 'y', x1: initialRange.start, x2: range.start, opacity: 0.1 },
  )

  const rightArea = Plot.areaX(
    [
      { x: range.start, y: f.value(initialRange.start) },
      { x: range.start, y: f.value(initialRange.end) },
    ],
    { x: 'x', y: 'y', x1: range.end, x2: initialRange.end, opacity: 0.1 },
  )

  return [leftArea, rightArea]
}

const countDots = ref(10)

const steps = computed(() => answerRanges.value.length - 1)

function findAnswerRanges(range: Range): Range[] {
  let curSteps = 0
  const ranges: Range[] = [range]

  while (ranges.at(-1)!.width > epsilon.value) {
    ranges.push(divisionMethod(ranges.at(-1)!))
    curSteps++
  }
  return ranges
}

const answerRanges = computed(() => findAnswerRanges(initialRange.value))
const slisedAreas = computed(() =>
  selectedAnswerRanges.value.map(r => makeSlicedPlotArea(initialRange.value, r)).flat(),
)

const data = computed(() =>
  Array<number>(countDots.value)
    .fill(0)
    .map(
      (_, i) => initialRange.value.start + i * (initialRange.value.width / (countDots.value - 1)),
    )
    .map(x => ({ x: x, y: f.value(x) })),
)

const epsilon = ref(0.2)

const selectedStep = ref(answerRanges.value.length - 1)
const selectedAnswerRanges = computed(() => answerRanges.value.slice(0, selectedStep.value + 1))

function selectStep(step: number) {
  selectedStep.value = step
}

const plot = computed(() =>
  Plot.plot({
    label: '',
    labelArrow: 'none',
    marginLeft: 60,
    height: window.innerHeight * 0.9,
    //   width: plotWidth.value,
    aspectRatio: 1,
    grid: true,
    marks: [
      Plot.line(data.value, { x: 'x', y: 'y', stroke: 'blue', curve: 'natural' }),
      selectedAnswerRanges.value
        .at(-1)!
        .dots.map(dot => [
          Plot.dot([dot], { x: d => d, y: d => f.value(d), stroke: 'orange' }),
          Plot.crosshair([dot], { x: d => d, y: d => f.value(d) }),
        ]),

      ...slisedAreas.value,

      Plot.ruleY([f.value(initialRange.value.start)]),
      Plot.ruleX([initialRange.value.start]),
      Plot.dot([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle,
        y: d => f.value(d.middle),
        stroke: 'red',
      }),
      Plot.crosshair([selectedAnswerRanges.value.at(-1)!], {
        x: d => d.middle,
        y: d => f.value(d.middle),
      }),
      /*Plot.crosshair([answerDotData.value], { x: 'x', y: 'y' }),
      Plot.dot([answerDotData.value], {
        x: 'x',
        y: 'y',
        fill: 'red',
      }),*/
      // Plot.frame(),
    ],
  }),
)
const plotWidth = ref(window.innerWidth)
function onWindowResize() {}

onMounted(() => {
  plotRef.value!.appendChild(plot.value)
  window.addEventListener('resize', onWindowResize)
})

watch(plot, (value, old) => {
  plotRef.value?.removeChild(old)
  plotRef.value?.appendChild(value)
})
</script>

<template>
  <main class="w-[90dvw] mx-auto my-8 flex gap-4 flex-col">
    <h1 class="text-3xl font-bold">Методы оптимизации</h1>
    <section class="grid grid-cols-[max-content_1fr] gap-4">
      <div ref="plotRef" role="img"></div>
      <div class="flex flex-col gap-4">
        <h2 class="text-2xl font-bold">Метод половинного деления</h2>
        <div class="flex flex-col gap-2">
          <h4 class="text-xl font-bold">Функция</h4>
          <label
            class="input input-bordered flex items-center gap-2 w-fit"
            :class="[expr === null ? 'input-error' : '']"
          >
            y =
            <input type="text" class="grow" placeholder="x^2 + 1" v-model.lazy="fAsString" />
          </label>
        </div>
        <div class="flex flex-col gap-2">
          <span class="text-xl font-bold">Интервал</span>
          <div class="flex gap-4 items-center">
            <label for="">От</label>
            <input
              type="number"
              class="input input-sm input-bordered w-20"
              name=""
              id=""
              v-model="initialRange.start"
            />
          </div>
          <div class="flex gap-4 items-center">
            <label for="">До</label>
            <input
              type="number"
              class="input input-sm input-bordered w-20"
              name=""
              id=""
              v-model="initialRange.end"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-4">
            <label for="" class="w-max">Количество точек</label>
            <input
              v-model.number="countDots"
              type="number"
              class="input input-sm input-bordered"
              id=""
              min="2"
              max="1000"
            />
          </div>

          <div class="flex items-center gap-4">
            <label for="" class="w-max">Количество шагов</label>
            <input
              :value="steps"
              disabled
              type="number"
              class="input input-sm input-bordered w-20"
              id=""
              min="2"
              max="1000"
            />
          </div>
        </div>
        <div class="flex flex-col">
          <span class="text-xl font-bold">Шаги</span>

          <ul class="flex flex-col steps steps-vertical gap-2">
            <li
              :data-content="i"
              @click.self="selectStep(i)"
              v-for="(range, i) in answerRanges"
              :key="range.toString()"
              class="step after:cursor-pointer"
              :class="[i === selectedStep ? 'step-primary' : '']"
            >
              <div class="grid grid-cols-[repeat(3,140px)] items-center place-items-start gap-4">
                <span>{{ range }}</span>
                <span
                  ><span class="kbd kbd-md mr-2">x</span> {{ trimNumber(range.middle, 3) }}</span
                >
                <span
                  ><span class="kbd kbd-md mr-2">y</span>{{ trimNumber(f(range.middle), 3) }}</span
                >
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
</template>

<style></style>
