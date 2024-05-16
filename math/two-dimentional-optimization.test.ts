import { describe, expect, test } from 'bun:test'
import { type Matrix2, getAlg, getDet, getInversed, getTransponated } from './two-dimentional-optimization'

describe('ulils', () => {
  test('det', () => {
    const m: Matrix2 = [[10, 44], [55, 77]]

    const det = getDet(m)
    expect(det).toBe(-1650)
  })

  test('transponate', () => {
    const m: Matrix2 = [[10, 44], [55, 77]]
    const mT = getTransponated(m)

    expect(mT).toEqual([[10, 55], [44, 77]])

    const a: Matrix2 = [
      [1, -1],
      [0, 2],
    ]

    const aT = getTransponated(a)
    const aTExpected: Matrix2 = [
      [1, 0],
      [-1, 2],
    ]
    expect(aT).toEqual(aTExpected)
  })
  test('alg', () => {
    const m: Matrix2 = [
      [1, -1],
      [0, 2],
    ]
    const expected: Matrix2 = [
      [2, 0],
      [1, 1],
    ]
    const alg = getAlg(m)
    expect(alg).toBe(expected)
  })

  test('invert', () => {
    const a: Matrix2 = [
      [1, -1],
      [0, 2],
    ]
    const aInversedExpected: Matrix2 = [
      [1, 1 / 2],
      [0, 1 / 2],
    ]
    expect(getInversed(a)).toEqual(aInversedExpected)

    const m: Matrix2 = [
      [4, 8],
      [9, 3],
    ]

    const expected: Matrix2 = [
      [-1 / 20, 2 / 15],
      [3 / 20, -1 / 15],
    ]
    const inversed = getInversed(m)
    expect(inversed).toEqual(expected)
  })
})
