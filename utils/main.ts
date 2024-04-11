import { fibNumbers } from './fibonacci'
import { logger } from './logger'

export type Fx = (x: number) => number

export interface InitialXRange {
  a: number
  b: number
}

export interface Dot {
  x: number
  fx: number
}

export interface Range {
  start: Dot
  end: Dot
}

export interface HalfDivisionStepData extends Range {
  start: Dot
  center: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface GoldenRatioDivisionStepData extends Range {
  start: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface FibonacciDivisionStepData extends Range {
  start: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface AnswerData extends Range {
  start: Dot
  min: Dot
  end: Dot
  step: number
}

export function halfDivisionMethod(f: Fx, L0: InitialXRange, epsilon: number) {
  logger.log(`halfDivisionMethod`)
  const stepsData: HalfDivisionStepData[] = []
  // step 1
  // L0, epsilon
  let L = L0

  // step 2
  let k = 0
  while (true) {
    // step 3
    const xCenter = (L.a + L.b) / 2
    const LLen = L.b - L.a
    const fxCenter = f(xCenter)

    // step 4
    const y = L.a + LLen / 4
    const z = L.b - LLen / 4
    const fy = f(y)
    const fz = f(z)

    const stepData: HalfDivisionStepData = {
      start: {
        x: L.a,
        fx: f(L.a),
      },
      end: {
        x: L.b,
        fx: f(L.b),
      },
      center: {
        x: xCenter,
        fx: fxCenter,
      },
      y: {
        x: y,
        fx: fy,
      },
      z: {
        x: z,
        fx: fz,
      },
      step: k,
    }

    logger.log(`k: ${stepData.step}, a: ${stepData.start.x}, b: ${stepData.end.x}, y: ${stepData.y.x}, z: ${stepData.z.x}`)
    stepsData.push(stepData)

    // step 5
    let bNext: number = null!
    let aNext: number = null!
    let xCenterNext: number = null!

    if (fy < fxCenter) {
      bNext = xCenter
      aNext = L.a
      xCenterNext = y
      // to 7
    }
    // step 6
    else if (fy > fxCenter) {
      if (fz < fxCenter) {
        aNext = xCenter
        bNext = L.b
        xCenterNext = z
        // to 7
      }
      else if (fz >= fxCenter) {
        aNext = y
        bNext = z
        xCenterNext = xCenter
        // to 7
      }
    }

    // step 7
    const LLenNext = bNext - aNext
    if (LLenNext <= epsilon) {
      const ans: AnswerData = {
        start: { x: aNext, fx: f(aNext) },
        min: { x: xCenterNext, fx: f(xCenterNext) },
        end: { x: bNext, fx: f(bNext) },
        step: k,
      }

      logger.log(`k: ${ans.step}, a: ${ans.start.x}, b: ${ans.end.x}, x: ${ans.min.x}`)
      return {
        stepsData,
        ans,
      }
    }
    else {
      k++
      L = { a: aNext, b: bNext }
    }
  }
}

export function goldenRatioDivisionMethod(f: Fx, L0: InitialXRange, epsilon: number) {
  logger.log(`goldenRatioDivisionMethod`)
  const stepsData: GoldenRatioDivisionStepData[] = []

  // step 1
  // L0, epsilon
  let L = L0

  // step 2
  let k = 0

  while (true) {
    // step 3
    const y = L.a + (3 - (5 ** 0.5)) / 2 * (L.b - L.a)
    const z = L.a + L.b - y

    // step 4
    const fy = f(y)
    const fz = f(z)

    const stepData: GoldenRatioDivisionStepData = {
      start: {
        x: L.a,
        fx: f(L.a),
      },
      end: {
        x: L.b,
        fx: f(L.b),
      },
      y: {
        x: y,
        fx: fy,
      },
      z: {
        x: z,
        fx: fz,
      },
      step: k,
    }
    stepsData.push(stepData)
    logger.log(`k: ${stepData.step}, a: ${stepData.start.x}, b: ${stepData.end.x}, y: ${stepData.y.x}, z: ${stepData.z.x}`)
    // step 5
    let aNext: number = null!
    let bNext: number = null!

    if (fy <= fz) {
      aNext = L.a
      bNext = z
    // to 6
    }
    else {
      aNext = y
      bNext = L.b
    // to 6
    }

    // step 6
    const delta = bNext - aNext
    if (delta <= epsilon) {
      const xMin = (aNext + bNext) / 2
      const ans: AnswerData = {
        start: {
          x: aNext,
          fx: f(aNext),
        },
        end: {
          x: bNext,
          fx: f(bNext),
        },
        min: {
          x: xMin,
          fx: f(xMin),
        },
        step: k,
      }

      logger.log(`k: ${ans.step}, a: ${ans.start.x}, b: ${ans.end.x}, x: ${ans.min.x}`)
      return {
        stepsData,
        ans,
      }
    }
    else {
      k++
      L = { a: aNext, b: bNext }
    }
  }
}

export function fibonacciDivisionMethod(f: Fx, L0: InitialXRange, epsilon: number, l: number) {
  logger.log(`fibonacciDivisionMethod`)
  const stepsData: FibonacciDivisionStepData[] = []
  // step 1
  // L0, epsilon, l

  let L = L0

  // step 2
  const LLen = L.b - L.a
  const findN = () => {
    let N = 0
    while (!(fibNumbers[N] >= LLen / l)) N++
    return N
  }
  const N = findN()
  logger.log(`N: ${N}`)
  // step 3
  let k = 0

  while (true) {
    // step 4
    const y = L.a + (fibNumbers[N - k - 2] / fibNumbers[N]) * LLen
    const z = L.a + (fibNumbers[N - k - 1] / fibNumbers[N]) * LLen

    // step 5

    const fy = f(y)
    const fz = f(z)

    const NMinus2StepData: FibonacciDivisionStepData = {
      start: {
        x: L.a,
        fx: f(L.a),
      },
      end: {
        x: L.b,
        fx: f(L.b),
      },
      y: {
        x: y,
        fx: fy,
      },
      z: {
        x: z,
        fx: fz,
      },
      step: k,
    }

    logger.log(`k: ${NMinus2StepData.step}, a: ${NMinus2StepData.start.x}, b: ${NMinus2StepData.end.x}, y: ${NMinus2StepData.y.x}, z: ${NMinus2StepData.z.x}`)
    stepsData.push(NMinus2StepData)

    // step 6
    let aNext: number = null!
    let bNext: number = null!
    if (fy <= fz) {
      aNext = L.a
      bNext = z
      // to 7
    }
    else {
      aNext = y
      bNext = L.b
    }

    // step 7

    // 7a
    if (k !== N - 3) {
      k++
      L = {
        a: aNext,
        b: bNext,
      }
    }
    // 7b
    else {
      const zNMinus2 = (aNext + bNext) / 2
      const yNMinus2 = zNMinus2

      const yNMinus1 = yNMinus2
      const zNMinus1 = yNMinus1 + epsilon

      let aNMinus1: number = null!
      let bNMinus1: number = null!
      if (f(yNMinus1) <= f(zNMinus1)) {
        aNMinus1 = aNext
        bNMinus1 = zNMinus1
      }
      else {
        aNMinus1 = yNMinus1
        bNMinus1 = bNext
      }

      const NMinus2StepData: FibonacciDivisionStepData = {
        start: {
          x: aNext,
          fx: f(aNext),
        },
        end: {
          x: bNext,
          fx: f(bNext),
        },
        y: {
          x: yNMinus2,
          fx: f(yNMinus2),
        },
        z: {
          x: zNMinus2,
          fx: f(zNMinus2),
        },
        step: k + 1,
      }
      const NMinus1StepData: FibonacciDivisionStepData = {
        start: {
          x: aNMinus1,
          fx: f(aNMinus1),
        },
        end: {
          x: bNMinus1,
          fx: f(bNMinus1),
        },
        y: {
          x: yNMinus1,
          fx: f(yNMinus1),
        },
        z: {
          x: zNMinus1,
          fx: f(zNMinus1),
        },
        step: k + 2,
      }

      const xMin = (aNMinus1 + bNMinus1) / 2
      const ans: AnswerData = {
        start: {
          x: aNMinus1,
          fx: f(aNMinus1),
        },
        min: {
          x: xMin,
          fx: f(xMin),
        },
        end: {
          x: bNMinus1,
          fx: f(bNMinus1),
        },
        step: k + 2,
      }

      logger.log(`k: ${NMinus2StepData.step}, a: ${NMinus2StepData.start.x}, b: ${NMinus2StepData.end.x}, y: ${NMinus2StepData.y.x}, z: ${NMinus2StepData.z.x}`)
      logger.log(`k: ${NMinus1StepData.step}, a: ${NMinus1StepData.start.x}, b: ${NMinus1StepData.end.x}, y: ${NMinus1StepData.y.x}, z: ${NMinus1StepData.z.x}`)
      logger.log(`k: ${ans.step}, a: ${ans.start.x}, b: ${ans.end.x}, x: ${ans.min.x}`)

      stepsData.push(NMinus2StepData)
      stepsData.push(NMinus1StepData)
      return {
        stepsData,
        ans,
      }
    }
  }
}