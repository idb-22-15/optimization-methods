import { fibNumbers } from './fibonacci'

export type Fn = (x: number) => number

export class Dot {
  public x: number
  public y: number

  constructor(x: number, f: Fn) {
    this.x = x
    this.y = f(x)
  }
}

export interface IRange {
  start: Dot
  end: Dot
  dots: [Dot, Dot] | null
}

export class Range implements IRange {
  public start: Dot
  public end: Dot
  public dots: [Dot, Dot] | null = null
  private f: Fn

  constructor(range: { start: Dot, end: Dot, f: Fn, dots?: [Dot, Dot] }) {
    this.start = range.start
    this.end = range.end
    this.f = range.f
    if (range.dots)
      this.dots = range.dots || null
  }

  get width(): number {
    return this.end.x - this.start.x
  }

  get middle(): Dot {
    const x = (this.start.x + this.end.x) / 2
    const y = this.f(x)
    return { x, y }
  }

  toString(toRounded?: Fn) {
    if (toRounded)
      return `[ ${toRounded(this.start.x)}, ${toRounded(this.end.x)} ]`
    return `[ ${this.start.x}, ${this.end.x} ]`
  }
}

export function halfDivision(range: Range, f: Fn, toRounded: Fn): Range {
  const fMid = toRounded(range.middle.y)
  const left = toRounded(range.start.x + range.width / 4)
  const right = toRounded(range.end.x - range.width / 4)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))

  const midDot = { x: range.middle.x, y: fMid }
  const leftDot = { x: left, y: fLeft }
  const rightDot = { x: right, y: fRight }
  const dots: [Dot, Dot] = [leftDot, rightDot]
  if (fLeft < fMid) {
    return new Range({ start: range.start, end: range.middle, f, dots })
  }
  else {
    if (fMid > fRight)
      return new Range({ start: midDot, end: range.end, f, dots })
    else return new Range({ start: leftDot, end: rightDot, f, dots })
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
  const left = toRounded(range.start.x + goldenRule * range.width)
  const right = toRounded(range.start.x + range.end.x - left)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))

  const leftDot = { x: left, y: fLeft }
  const rightDot = { x: right, y: fRight }
  const dots: [Dot, Dot] = [leftDot, rightDot]
  if (fLeft <= fRight)
    return new Range({ start: range.start, end: rightDot, f, dots })
  else return new Range({ start: leftDot, end: range.end, f, dots })
}

export function goldenRatioDivisionAnswer(range: Range, f: Fn, epsilon: number, toRounded: Fn): Range[] {
  const ranges: Range[] = [range]

  while (ranges.at(-1)!.width > epsilon)
    ranges.push(goldenRatioDivision(ranges.at(-1)!, f, toRounded))

  return ranges
}

export function fibonacciDivision(range: Range, f: Fn, n: number, k: number, toRounded: Fn): Range {
  const left = toRounded(range.start.x + (fibNumbers[n - k - 2] / fibNumbers[n]) * range.width)
  const right = toRounded(range.start.x + (fibNumbers[n - k - 1] / fibNumbers[n]) * range.width)
  const fLeft = toRounded(f(left))
  const fRight = toRounded(f(right))
  const leftDot = { x: left, y: fLeft }
  const rightDot = { x: right, y: fRight }
  const dots: [Dot, Dot] = [leftDot, rightDot]
  if (fLeft <= fRight)
    return new Range({ start: range.start, end: rightDot, f, dots })
  else return new Range({ start: leftDot, end: range.end, f, dots })
}

export function fibonacciDivisionAnswer(range: Range, f: Fn, epsilon: number, l: number, toRounded: Fn) {
  const condition = Math.abs(range.width) / l

  const maxSteps = (() => {
    for (let n = 0; n < fibNumbers.length; n++) {
      if (fibNumbers[n] >= condition)
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
