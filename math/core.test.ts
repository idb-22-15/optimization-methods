import { describe, expect, test } from 'bun:test'
import { evalFunction, getFunction, getFunctionDerivativeNode, getFunctionNode, getGradient } from './core'

describe('math core', () => {
  const s = 'x^2 + 2x'

  test('eval function', () => {
    const s1 = 'x^2 + 2x'
    const f1 = getFunction(s1)!
    expect(f1).not.toBe(null)
    const res1 = f1({ x: 4 })!
    const res2 = f1({ x1: 0, x2: 0 })
    expect(res1).toBe(4 ** 2 + 2 * 4)
    expect(res2).toBe(null)

    const s2 = 'x??#$%^&*(X|x'
    const f2 = getFunction(s2)
    expect(f2).toBe(null)

    const s3 = 'x1^2 + x2^2'
    const f3 = getFunction(s3)!
    expect(f3).not.toBe(null)
    expect(f3({ x1: 2, x2: 3 })).toBe(2 ** 2 + 3 ** 2)

    const s4 = '2*x1*x2'
    const f4 = getFunction(s4)!
    expect(f4).not.toBe(null)
    expect(f4({ x1: 3, x2: 5 })).toBe(2 * 3 * 5)
  })

  test('derivation', () => {
    const n1 = getFunctionDerivativeNode(s, 'x')
    expect(n1).not.toBe(null)
    const f1 = n1!.compile()
    expect(evalFunction(f1, { x: 4 })).toBe(2 * 4 + 2)
  })

  test('gradient', () => {
    const s = '2*x1 + 3*x2'
    const grad = getGradient(s, { x1: 999, x2: 999 })!
    expect(grad).toStrictEqual({
      x1: 2,
      x2: 3,
    })
  })
})
