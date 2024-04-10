import { describe, expect, test } from 'bun:test'

import { roundToSignificantFigures } from './math'

describe('round significant', () => {
  test('round', () => {
    const number = 123.456789
    expect(roundToSignificantFigures(number, 1)).toBe(100)
    expect(roundToSignificantFigures(number, 2)).toBe(120)
    expect(roundToSignificantFigures(number, 3)).toBe(123)
    expect(roundToSignificantFigures(number, 4)).toBe(123.5)
    expect(roundToSignificantFigures(number, 5)).toBe(123.46)
  })
  test('round', () => {
    const number = 0.000456789
    expect(roundToSignificantFigures(number, 1)).toBe(0.0005)
    expect(roundToSignificantFigures(number, 2)).toBe(0.00046)
    expect(roundToSignificantFigures(number, 3)).toBe(0.000457)
    expect(roundToSignificantFigures(number, 4)).toBe(0.0004568)
    expect(roundToSignificantFigures(number, 5)).toBe(0.00045679)
    expect(roundToSignificantFigures(number, 10)).toBe(0.000456789)
  })
})
