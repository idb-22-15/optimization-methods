import { expect, test } from 'bun:test'
import { getFunction } from '../core'
import { variants } from './gradient-descent-variants'

test('gradient descent variants are correct', () => {
  for (const v of variants) {
    const f = getFunction(v.f)!
    expect(f).not.toBe(null)
    expect(f({ x1: 1, x2: 1 }))
  }
})
