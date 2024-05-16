import { fib } from '../utils/fibonacci'
import { logger } from '../utils/logger'
import type { Fx, Interval } from './core'

export enum Method {
  halfDivision = 'halfDivision',
  goldenRatio = 'goldenRatio',
  fibonacci = 'fibonacci',
}

export interface InitialXRange {
  a: number
  b: number
}

export interface Dot {
  x: number
  fx: number
}

export interface YZDots {
  y: Dot
  z: Dot
}

export interface HalfDivisionStepData extends Interval<Dot>, YZDots {
  start: Dot
  center: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface GoldenRatioDivisionStepData extends Interval<Dot>, YZDots {
  start: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface FibonacciDivisionStepData extends Interval<Dot>, YZDots {
  start: Dot
  end: Dot
  y: Dot
  z: Dot
  step: number
}

export interface AnswerData extends Interval<Dot> {
  start: Dot
  min: Dot
  end: Dot
  step: number
}

export function halfDivisionMethod(f: Fx<number>, L0: InitialXRange, epsilon: number) {
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

export function goldenRatioDivisionMethod(f: Fx<number>, L0: InitialXRange, epsilon: number) {
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

export function fibonacciDivisionMethod2(f: Fx<number>, interval: InitialXRange, epsilon: number) {
  logger.log(`fibonacciDivisionMethod`)
  const stepsData: FibonacciDivisionStepData[] = []
  // step 1
  // L0, epsilon, l

  let L = interval

  // step 2
  const LLen = L.b - L.a
  const findN = () => {
    let n = 0
    while (!(fib[n] >= LLen / epsilon)) n++
    return n
  }
  const n = Math.max(2, findN())
  logger.log(`N: ${n}`)
  // step 3
  let k = 0

  const y = L.a + (fib[n - 2] / fib[n]) * LLen
  const z = L.a + (fib[n - 1] / fib[n]) * LLen

  const firstStepData: FibonacciDivisionStepData = {
    start: {
      x: L.a,
      fx: f(L.a),
    },
    end: {
      x: L.b,
      fx: f(L.b),
    },
    step: 0,
    y: {
      x: y,
      fx: f(y),
    },
    z: {
      x: z,
      fx: f(z),
    },
  }
  stepsData.push(firstStepData)
  k++

  while (k <= n - 3) {
    // step 4
    const y = L.a + (fib[n - k - 2] / fib[n]) * LLen
    const z = L.a + (fib[n - k] / fib[n]) * LLen

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
    k++
    L = {
      a: aNext,
      b: bNext,
    }
    // 7b
  }

  const zNMinus2 = (L.a + L.b) / 2
  const yNMinus2 = zNMinus2

  const yNMinus1 = yNMinus2
  const zNMinus1 = yNMinus1 + epsilon

  let aNMinus1: number = null!
  let bNMinus1: number = null!
  if (f(yNMinus1) <= f(zNMinus1)) {
    aNMinus1 = L.a
    bNMinus1 = zNMinus1
  }
  else {
    aNMinus1 = yNMinus1
    bNMinus1 = L.b
  }

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

export function fibonacciDivisionMethod(f: Fx<number>, interval: InitialXRange, epsilon: number) {
  logger.log(`fibonacciDivisionMethod`)
  const stepsData: FibonacciDivisionStepData[] = []

  let n = 2
  while ((interval.b - interval.a) / epsilon > fib[n - 1]) n++

  let a = interval.a
  let b = interval.b
  let y = a + (fib[n - 2] / fib[n]) * (b - a)
  let z = a + (fib[n - 1] / fib[n]) * (b - a)
  let fy = f(y)
  let fz = f(z)
  let k = 0

  while (k <= n - 3) {
    const stepData: FibonacciDivisionStepData = {
      start: {
        x: a,
        fx: f(a),
      },
      end: {
        x: b,
        fx: f(b),
      },
      y: {
        x: y,
        fx: f(y),
      },
      z: {
        x: z,
        fx: f(z),
      },
      step: k,
    }
    logger.log(`k: ${stepData.step}, a: ${stepData.start.x}, b: ${stepData.end.x}, y: ${stepData.y.x}, z: ${stepData.z.x}`)
    stepsData.push(stepData)

    if (fy < fz) {
      b = z
      z = y
      fz = fy
      y = a + (fib[n - k - 3] / fib[n - k - 1]) * (b - a)
      fy = f(y)
    }
    else {
      a = y
      y = z
      fy = fz
      z = a + (fib[n - k - 2] / fib[n - k - 1]) * (b - a)
      fz = f(z)
    }

    k++
  }

  const minX = (a + b) / 2

  const ans: AnswerData = {
    start: {
      x: a,
      fx: f(a),
    },
    end: {
      x: b,
      fx: f(b),
    },
    min: {
      x: minX,
      fx: f(minX),
    },
    step: k,
  }

  return {
    stepsData,
    ans,
  }
}
