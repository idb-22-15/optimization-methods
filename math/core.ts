import { type EvalFunction, type MathNode, compile, derivative, parse, string } from 'mathjs/number'

export function getFunctionNode(f: string) {
  try {
    return parse(f)
  }
  catch (_e) {
    return null
  }
}

export function getFunction(f: string) {
  try {
    const compiled = compile(f)
    return (scope: FunctionScope) => evalFunction(compiled, scope)
  }
  catch (_e) {
    return null
  }
}

export function getFunctionDerivativeNode(f: string, variable: 'x' | 'x1' | 'x2') {
  try {
    return derivative(f, variable)
  }
  catch (_e) {
    return null
  }
}

export function getFunctionDerivative(f: string, variable: 'x' | 'x1' | 'x2') {
  try {
    const n = getFunctionDerivativeNode(f, variable)
    if (!n)
      return null
    const compiled = n.compile()
    return (scope: FunctionScope) => compiled.evaluate(scope)
  }
  catch (_e) {
    return null
  }
}

export interface VecX {
  x1: number
  x2: number
}

export type FunctionScope = {
  x: number
} | VecX

export function evalFunction(f: EvalFunction | null, scope: FunctionScope) {
  if (!f)
    return null
  try {
    return f.evaluate(scope) as number
  }
  catch (_e) {
    return null
  }
}

export function getGradient(fString: string, scope: FunctionScope): VecX | null {
  const dfdx1 = getFunctionDerivative(fString, 'x1')
  const dfdx2 = getFunctionDerivative(fString, 'x2')

  if (!dfdx1 || !dfdx2)
    return null

  const x1 = dfdx1(scope)
  const x2 = dfdx2(scope)
  return {
    x1,
    x2,
  }
}
