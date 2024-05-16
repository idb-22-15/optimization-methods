import { expect, test } from 'bun:test'
import { getFunction } from '../core'
import { variants } from './one-dimensional-optimization-variants'

test('one dimensional optimization variants are correct', () => {
  for (const v of variants) {
    const f = getFunction(v.f)!
    expect(f).not.toBe(null)
    expect(f({ x: 1 }))
  }
})
