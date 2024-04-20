import { type Fx, type Vec2, getFunction, getFunctionDerivative, getGradient } from './core'

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

interface GradientDescentWithConstantStepStepData {
  x: Vec2
  fx: number
  step: number
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
  const f = getFunction(fString)!

  const stepsData: GradientDescentWithConstantStepStepData[] = []

  for (let k = 0, xk = x0; ; k++) {
    const step: GradientDescentWithConstantStepStepData = {
      x: xk,
      fx: f(xk)!,
      step: k,
    }
    stepsData.push(step)

    const grad = getGradient(fString, xk)!
    const norm = getNorm(grad)

    if (norm < epsilon1 || k >= M) {
      const answer: AnswerData = {
        x: xk,
        fx: f(xk)!,
        step: k,
      }
      return {
        stepsData,
        answer,
      }
    }

    // step 6
    // set t

    // step 7
    const xkPlus1 = () => ({
      x1: xk.x1 - t * grad.x1,
      x2: xk.x2 - t * grad.x2,
    })

    // step 8
    const fdiff = () => f(xkPlus1())! - f(xk)!
    const condition = () => fdiff() < 0 // || (fdiff() < -epsilon1 * norm ** 2)

    while (!condition())
      t = t / 2

    const xkPlus1Cur = xkPlus1()
    // step 9
    const diff: Vec2 = {
      x1: xkPlus1Cur.x1 - xk.x1,
      x2: xkPlus1Cur.x2 - xk.x2,
    }
    const diffnorm = getNorm(diff)
    if (diffnorm < epsilon2 && Math.abs(fdiff()) < epsilon2) {
      const answer: AnswerData = {
        x: xk,
        fx: f(xk)!,
        step: k,
      }
      return {
        stepsData,
        answer,
      }
    }

    xk = xkPlus1Cur
  }
}
