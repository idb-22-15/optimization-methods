import { logger } from '../utils/logger'
import type { Fx, Vec2 } from './core'

const f = (x: Vec2) => x.x1 ** 2 + 0.6 * x.x1 * x.x2 + 6 * x.x2 ** 2
const x0: Vec2 = {
  x1: 1.5,
  x2: 0.5,
}
const epsilon1 = 0.15
const epsilon2 = 0.2
const M = 10

function gradFx(x: Vec2) {
  const df_dx_1 = 2 * x.x1 + 0.6 * x.x2
  const df_dx_2 = 0.6 * x.x1 + 12 * x.x2

  return {
    x1: df_dx_1,
    x2: df_dx_2,
  }
}

export type Matrix2 = [[number, number], [number, number]]

export function getHessianMatrix(_x: Vec2): Matrix2 {
  const d2f_dx2_1 = 2
  const d2f_dx1_dx2 = 0.6
  const d2f_dx2_2 = 12

  return [
    [d2f_dx2_1, d2f_dx1_dx2],
    [d2f_dx1_dx2, d2f_dx2_2],
  ]
}

export function getDet(m: Matrix2) {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0]
}

export function getTransponated(m: Matrix2): Matrix2 {
  return [
    [m[0][0], m[1][0]],
    [m[0][1], m[1][1]],
  ]
}

export function getAlg(m: Matrix2): Matrix2 {
  const a11 = (-1) ** (1 + 1) * m[1][1]
  const a12 = (-1) ** (1 + 2) * m[1][0]
  const a21 = (-1) ** (2 + 1) * m[0][1]
  const a22 = (-1) ** (2 + 2) * m[0][0]
  const a: Matrix2 = [
    [a11, a12],
    [a21, a22],
  ]
  return a
}

export function getInversed(m: Matrix2) {
  const det = getDet(m)
  const A = getAlg(m)

  const mult = 1 / Math.abs(det)
  const _A: Matrix2 = [
    [mult * A[0][0], mult * A[0][1]],
    [mult * A[1][0], mult * A[1][1]],
  ]
  const inverted = getTransponated(_A)
  return inverted
}

function getNorm(x: Vec2) {
  return Math.sqrt(x.x1 ** 2 + x.x2 ** 2)
}

interface StepData {
  x: Vec2
  fx: number
  gradfx: Vec2
  step: number
  absFdiff: number
  diffnorm: number
  lastCondition: boolean
}

interface AnswerData {
  x: Vec2
  fx: number
  step: number
}

const stepsData: StepData[] = []

export function newtonMethod(f: Fx<Vec2>, gradf: (x: Vec2) => Vec2, x0: Vec2, epsilon1: number, epsilon2: number, M: number) {
  // step 1
  logger.ready('Шаг 1')
  logger.log(`Ɛ₁ = ${epsilon1}, Ɛ₂ = ${epsilon2}, M = ${M}`)
  // step 2
  logger.ready('Шаг 2')
  let k = 0
  let x = x0

  while (true) {
    // step 3
    logger.ready(`Шаг 3^${k}`)
    const fx = f(x)
    logger.info(`k = ${k}`)
    logger.log(`x^${k} = (${x.x1}, ${x.x2}), f(x^${k}) = ${fx}`)
    const gradfx = gradf(x)
    logger.log(`grad(f(x^${k})) = (${gradfx.x1}; ${gradfx.x2})`)
    const norm = getNorm(gradfx)
    logger.log(`norm(grad(f(x^${k}))) = ${norm}`)
    // step 4
    // logger.ready(`Шаг 4^${k}`)

    if (norm <= epsilon1) {
    // step 4 a
      logger.ready(`Шаг 4a^${k}`)

      const ans: AnswerData = {
        x,
        fx,
        step: k,
      }
      logger.box(`Ответ: k = ${k}, x = (${x.x1}, ${x.x2}), f(x^${k}) = ${f(x)}`)
      return {
        stepsData,
        ans,
      }
    }
    else {
      logger.ready(`Шаг 4b^${k}`)

      // step 4 b
      // step 5
      // logger.ready(`Шаг 5^${k}`)
      if (k >= M) {
        // step 5 a
        logger.ready(`Шаг 5a^${k}`)
        const ans: AnswerData = {
          x,
          fx,
          step: k,
        }
        logger.box(`Ответ: k = ${k}, x = (${x.x1}, ${x.x2}), f(x^${k}) = ${f(x)}`)
        return {
          stepsData,
          ans,
        }
      }
      else {
        // step 5 b
        // step 6
        logger.ready(`Шаг 5b^${k}`)
        logger.ready(`Шаг 6^${k}`)

        const hessian = getHessianMatrix(x)
        // step 7
        // logger.ready(`Шаг 7^${k}`)

        const hessianInversed = getInversed(hessian)
        // step 8
        // logger.ready(`Шаг 8^${k}`)

        let d: Vec2 = null!
        let t: number = null!
        const detHessianInversed = getDet(hessianInversed)
        logger.log(`|H|^-1 = ${detHessianInversed}`)

        if (detHessianInversed > 0) {
          // step 8 a
          // step 9
          logger.ready(`Шаг 8a^${k}`)
          logger.ready(`Шаг 9^${k}`)

          logger.log(`|H|^-1 = ${detHessianInversed} > 0`)
          d = {
            x1: -detHessianInversed * gradfx.x1,
            x2: -detHessianInversed * gradfx.x2,
          }
          t = 1
          logger.log(`d^${k} = (${d.x1}, ${d.x2}), t^${k} = ${t}`)
        }
        else {
          // step 8 b
          logger.ready(`Шаг 8b^${k}`)

          logger.log(`|H|^-1 = ${detHessianInversed} < 0`)
          d = {
            x1: -gradfx.x1,
            x2: -gradfx.x2,
          }
          t = 1
          const ts: number[] = Array.from({ length: 100 }).map((_, i) => (i + 1) / 100)
          const xConds: Vec2[] = ts.map(t => ({
            x1: x.x1 - t * gradfx.x1,
            x2: x.x2 = t * gradfx.x2,
          }))
          const fxConds = xConds.map((x, idx) => [f(x), idx]).filter(([fx]) => fx < f(x)).toSorted(([fx1], [fx2]) => fx1 - fx2)
          const minFx = fxConds[0]
          const tIndex = minFx[1]
          t = ts[tIndex]
        }
        logger.log(`d^${k} = (${d.x1}, ${d.x2}), t^${k} = ${t}`)

        // step 10
        logger.ready(`Шаг 10^${k}`)

        const xNext: Vec2 = {
          x1: x.x1 + t * d.x1,
          x2: x.x2 + t * d.x2,
        }
        const fxNext = f(xNext)
        logger.log(`x^${k + 1} = (${xNext.x1}, ${xNext.x2}), f(x^${k + 1}) = ${fxNext}`)

        // step 11
        logger.ready(`Шаг 11^${k}`)

        const diff: Vec2 = {
          x1: xNext.x1 - x.x1,
          x2: xNext.x2 - x.x2,
        }
        const diffnorm = getNorm(diff)

        const fdiff = fxNext - f(x)
        const absFdiff = Math.abs(fdiff)
        logger.log(`||x^${k + 1} - x^${k}|| = ${diffnorm}, |f(x^${k + 1} - f(x^${k})| = ${absFdiff}`)

        const prevCondition = stepsData[k - 1]?.lastCondition
        const condition = diffnorm < epsilon2 && absFdiff < epsilon2

        const step: StepData = {
          x,
          fx,
          step: k,
          gradfx,
          diffnorm,
          absFdiff,
          lastCondition: condition,
        }
        stepsData.push(step)
        if (condition && prevCondition) {
          // step 11 a
          logger.log(`Условие выполняется для k = ${k} и k = ${k - 1}`)
          logger.ready(`Шаг 11a^${k}`)
          x = xNext
          const ans: AnswerData = {
            x,
            fx: f(x),
            step: k,
          }
          logger.box(`Ответ: k = ${k}, x^${k} = (${x.x1}, ${x.x2}), f(x^${k}) = ${f(x)}`)

          return {
            stepsData,
            ans,
          }
        }
        else {
          // step 11 b
          logger.ready(`Шаг 11b^${k}`)

          k = k + 1
          x = xNext
        }
      }
    }
  }
}

newtonMethod(f, gradFx, x0, epsilon1, epsilon2, M)
