import { type Fx, type ValidFunctionWithScope, type Vec2, getFunction, getFunctionDerivative, getGradient } from './core'
import { logger } from '~/utils/logger'

function getNorm(vec: Vec2) {
  return Math.sqrt(vec.x1 ** 2 + vec.x2 ** 2)
}

export enum Method {
  gradientDescentWithConstantStep = 'gradientDescentWithConstantStep',
}

interface AnswerData {
  x: Vec2
  fx: number
  step: number
}

export interface StepData {
  x: Vec2
  fx: number
  step: number
}

interface GradientDescentWithConstantStepStepData {
  x: Vec2
  fx: number
  gradfx: Vec2
  step: number
  absfdiff: number
  diffnorm: number
  lastCondition: boolean
}

export function gradientDescentWithConstantStep(
  fString: string,
  x0: Vec2,
  epsilon1: number,
  epsilon2: number,
  M: number,
  t: number | undefined = 0.5,
) {
  // !FIXME null
  const f = getFunction(fString) as ValidFunctionWithScope

  const stepsData: GradientDescentWithConstantStepStepData[] = []

  for (let k = 0, xk = x0; ; k++) {
    const fx = f(xk)
    logger.log(`k: ${k}`)
    logger.log(`x^${k}: (${xk.x1}, ${xk.x2}), f(x^${k}) = ${fx}`)
    // step 3
    const gradfx = getGradient(fString, xk)!
    logger.log(`grad f: (${gradfx.x1}; ${gradfx.x2})`)

    const norm = getNorm(gradfx)
    logger.log(`norm = ${norm}`)

    // steps 4, 5
    if (norm < epsilon1 || k === M) {
      const answer: AnswerData = {
        x: xk,
        fx: f(xk)!,
        step: k,
      }
      logger.log(`Ответ: шаг: ${answer.step}, x: (${answer.x.x1}, ${answer.x.x2}), f(x) = ${answer.fx}`)
      return {
        stepsData,
        answer,
      }
    }

    // step 6
    let tk = t

    let xkPlus1: Vec2 = null!
    let fxkPlus1: number = null!
    let fdiff: number = null!
    do {
      // step 7
      xkPlus1 = {
        x1: xk.x1 - tk * gradfx.x1,
        x2: xk.x2 - tk * gradfx.x2,
      }
      fxkPlus1 = f(xkPlus1)
      fdiff = f(xkPlus1) - f(xk)
      logger.log(`t: ${tk}`)
      logger.log(`x^${k + 1}: (${xkPlus1.x1}: ${xkPlus1.x2}), f(x^${k + 1}) = ${fxkPlus1}`)
      tk = tk / 2

      // step 8
    } while (fdiff >= 0)

    // step 9
    const diff: Vec2 = {
      x1: xkPlus1.x1 - xk.x1,
      x2: xkPlus1.x2 - xk.x2,
    }
    const diffnorm = getNorm(diff)
    const absfdiff = Math.abs(fdiff)
    logger.log(`||x^${k + 1} - x^${k}|| = ${diffnorm}, |f(x^${k + 1} - f(x^${k})| = ${absfdiff}`)

    const kCondition = diffnorm < epsilon2 && absfdiff < epsilon2
    const prevStep = stepsData.at(-1) || null
    const kMinus1Condition = prevStep && prevStep.diffnorm < epsilon1 && prevStep.absfdiff < epsilon2

    const step: GradientDescentWithConstantStepStepData = {
      x: xk,
      fx,
      step: k,
      gradfx,
      diffnorm,
      absfdiff,
      lastCondition: kCondition,
    }

    stepsData.push(step)

    if (kCondition && kMinus1Condition) {
      logger.log(`Условие выполняется для k = ${k} и k = ${k - 1}`)
      const answer: AnswerData = {
        x: xkPlus1,
        fx: fxkPlus1,
        step: k + 1,
      }

      logger.log(`Ответ: k = ${answer.step}, x: (${answer.x.x1}, ${answer.x.x2}), fx = ${answer.fx}`)
      return {
        stepsData,
        answer,
      }
    }

    xk = xkPlus1
  }
}
