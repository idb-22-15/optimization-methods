export interface Dot {
  x: number
  y: number
}

export type Fn = (x: number) => number

export class Range {
  public start: number
  public end: number
  public dots: number[] = []

  constructor(range: { start: number, end: number, dots?: [number, number] }) {
    this.start = range.start
    this.end = range.end
    if (range.dots)
      this.dots = range.dots
  }

  get width() {
    return this.end - this.start
  }

  get middle() {
    return (this.start + this.end) / 2
  }

  toString() {
    return `[${this.start};${this.end}]`
  }
}

export function halfDivision(range: Range, f: Fn, toRounded: Fn): Range {
  const fMiddle = toRounded(f(range.middle))
  const left = toRounded(range.start + range.width / 4)
  const right = toRounded(range.end - range.width / 4)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))
  const dots: [number, number] = [left, right]
  if (fLeft < fMiddle) {
    return new Range({ start: range.start, end: range.middle, dots })
  }
  else {
    if (fMiddle > fRight)
      return new Range({ start: range.middle, end: range.end, dots })
    else return new Range({ start: left, end: right, dots })
  }
}

export function halfDivisionAnswer(range: Range, f: Fn, epsilon: number, toRounded: Fn): Range[] {
  const ranges: Range[] = [range]

  while (ranges.at(-1)!.width > epsilon)
    ranges.push(halfDivision(ranges.at(-1)!, f, toRounded))

  return ranges
}

export function goldenRatioDivision(range: Range, f: Fn, toRounded: Fn): Range {
  const goldenRule = (3 - Math.sqrt(5)) / 2
  const left = toRounded(range.start + goldenRule * range.width)
  const right = toRounded(range.start + range.end - left)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))
  const dots: [number, number] = [left, right]
  if (fLeft <= fRight)
    return new Range({ start: range.start, end: right, dots })
  else return new Range({ start: left, end: range.end })
}

export function goldenRatioDivisionAnswer(range: Range, f: Fn, epsilon: number, toRounded: Fn): Range[] {
  const ranges: Range[] = [range]

  while (ranges.at(-1)!.width > epsilon)
    ranges.push(goldenRatioDivision(ranges.at(-1)!, f, toRounded))

  return ranges
}

function fibonacci(n: number) {
  const fibSequence = [0, 1]
  while (fibSequence.length < n) {
    const nextNumber = fibSequence[fibSequence.length - 1] + fibSequence[fibSequence.length - 2]
    fibSequence.push(nextNumber)
  }
  return fibSequence
}

export const fibNums = fibonacci(100)

export function fibonacciDivision(range: Range, f: Fn, n: number, k: number, toRounded: Fn): Range {
  const left = toRounded(range.start + (fibNums[n - k - 2] / fibNums[n]) * range.width)
  const right = toRounded(range.start + (fibNums[n - k - 1] / fibNums[n]) * range.width)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))
  const dots: [number, number] = [left, right]
  if (fLeft <= fRight)
    return new Range({ start: range.start, end: right, dots })
  else return new Range({ start: left, end: range.end, dots })
}

export function fibonacciDivisionAnswer(range: Range, f: Fn, epsilon: number, l: number, toRounded: Fn) {
  const condition = Math.abs(range.width) / l

  const maxSteps = (() => {
    for (let n = 0; n < fibNums.length; n++) {
      if (fibNums[n] >= condition)
        return n
    }
  })() as number

  let curSteps = 0
  const ranges: Range[] = [range]

  while (curSteps <= maxSteps - 3 && ranges.at(-1)!.width >= epsilon) {
    const newRange = fibonacciDivision(ranges.at(-1)!, f, maxSteps, curSteps, toRounded)
    ranges.push(newRange)
    curSteps++
  }
  return ranges
}
