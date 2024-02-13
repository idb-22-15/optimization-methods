<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import * as Plot from '@observablehq/plot'

const canvas = ref<HTMLCanvasElement | null>(null)
const plotRef = ref<HTMLDivElement | null>(null)

const f = (x: number) => Math.pow(x, 3) + 3 * x - 3

class Range {
  public start: number
  public end: number
  constructor(range: { start: number; end: number }) {
    this.start = range.start
    this.end = range.end
  }
  get width() {
    return this.end - this.start
  }
  get middle() {
    return (this.start + this.end) / 2
  }
}

const _initialRange = ref({ start: -10, end: 10 })
const initialRange = computed(
  () =>
    new Range({
      start: _initialRange.value.start,
      end: _initialRange.value.end,
    }),
)

function divisionSearch(range: Range): Range {
  const fMiddle = f(range.middle)
  const left = range.start + range.width / 4
  const right = range.end - range.width / 4
  const fLeft = f(left)
  const fRight = f(right)

  if (fLeft < fMiddle) return new Range({ start: range.start, end: range.middle })
  else {
    if (fMiddle > fRight) return new Range({ start: range.middle, end: range.end })
    else return new Range({ start: left, end: right })
  }
}

function makeSlicedArea(initialRange: Range, range: Range): [Plot.Area, Plot.Area] {
  const leftArea = Plot.areaX(
    [
      { x: range.start, y: f(initialRange.start) },
      { x: range.start, y: f(initialRange.end) },
    ],
    { x: 'x', y: 'y', x1: initialRange.start, x2: range.start, opacity: 0.1 },
  )

  const rightArea = Plot.areaX(
    [
      { x: range.start, y: f(initialRange.start) },
      { x: range.start, y: f(initialRange.end) },
    ],
    { x: 'x', y: 'y', x1: range.end, x2: initialRange.end, opacity: 0.1 },
  )

  return [leftArea, rightArea]
}

const countDots = ref(10)

const steps = computed(() => answerRanges.value.length)

function findAnswerRanges(range: Range): Range[] {
  let curSteps = 0
  // let curRange = range
  const ranges = [range]

  while (ranges.at(-1)!.width > epsilon.value) {
    ranges.push(divisionSearch(ranges.at(-1)!))
    curSteps++
  }
  return ranges
}

const answerRanges = computed(() => findAnswerRanges(initialRange.value))
const slisedAreas = computed(() =>
  answerRanges.value.map(r => makeSlicedArea(initialRange.value, r)).flat(),
)
const answerRange = computed(() => answerRanges.value.at(-1)!)
const answerDotData = computed(() => ({
  x: answerRange.value.middle,
  y: f(answerRange.value.middle),
}))

const data = computed(() =>
  Array<number>(countDots.value)
    .fill(0)
    .map(
      (_, i) => initialRange.value.start + i * (initialRange.value.width / (countDots.value - 1)),
    )
    .map(x => ({ x: x, y: f(x) })),
)

const epsilon = ref(0.2)

// onMounted(() => {
//   const gl = canvas.value!.getContext('webgl')!
//   gl.clearColor(0, 0, 0, 1)
//   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

// })

onMounted(() => {
  plotRef.value!.appendChild(plot.value)
})

const plot = computed(() =>
  Plot.plot({
    margin: 60,
    height: window.innerHeight * 0.8,
    aspectRatio: 1,
    grid: true,
    marks: [
      Plot.line(data.value, { x: 'x', y: 'y', stroke: 'blue', curve: 'natural' }),
      Plot.dot(answerRanges.value, { x: d => d.middle, y: d => f(d.middle) }),
      Plot.crosshair(answerRanges.value, { x: d => d.middle, y: d => f(d.middle) }),
      Plot.ruleX([initialRange.value.start]),
      Plot.ruleY([f(initialRange.value.start)]),
      ...slisedAreas.value,

      Plot.crosshair([answerDotData.value], { x: 'x', y: 'y' }),
      Plot.dot([answerDotData.value], {
        x: 'x',
        y: 'y',
        fill: 'red',
      }),
      // Plot.frame(),
      // Plot.dotX(data, { x: 'x', y: 'y' }),
    ],
  }),
)

watch(plot, (value, old) => {
  plotRef.value!.removeChild(old)
  plotRef.value!.appendChild(value)
})
</script>

<template>
  <!-- <canvas ref="canvas" width="500" height="500"></canvas> -->
  <main class="container mx-auto my-8 flex gap-4 flex-col">
    <h1 class="text-2xl font-bold">Методы оптимизации</h1>
    <section class="flex gap-4">
      <div ref="plotRef" class="text-xl"></div>
      <div class="flex flex-col gap-4">
        <h2 class="text-xl font-bold">Метод половинного деления</h2>
        <div class="flex flex-col gap-2">
          <span>Интервал</span>
          <div class="flex gap-4 items-center">
            <label for="">От</label>
            <input
              type="number"
              class="input input-sm input-bordered w-20"
              name=""
              id=""
              v-model="_initialRange.start"
            />
          </div>
          <div class="flex gap-4 items-center">
            <label for="">До</label>
            <input
              type="number"
              class="input input-sm input-bordered w-20"
              name=""
              id=""
              v-model="_initialRange.end"
            />
          </div>
        </div>
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
        <div class="flex gap-2 flex-col">
          <h3 class="font-bold">Ответ</h3>
          <div class="flex flex-col">
            <span>x: {{ answerDotData.x.toFixed(3) }}</span>
            <span>y: {{ answerDotData.y.toFixed(3) }}</span>
          </div>
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
    </section>
  </main>
</template>

<style></style>
