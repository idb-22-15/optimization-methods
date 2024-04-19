import { expect, test } from 'bun:test'
import { variants } from './gradient-descent-variants'
import { getFunction } from '~/math/core'

test('gradient descent variants are correct', () => {
  for (const v of variants) {
    const f = getFunction(v.f)!
    expect(f).not.toBe(null)
    expect(f({ x1: 1, x2: 1 }))
  }
})
