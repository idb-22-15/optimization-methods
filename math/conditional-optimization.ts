import { logger } from '../utils/logger'
import type { Fx, Vec2 } from './core'
import { newtonMethod } from './conditional-optimization-newton'

export enum Method {
  penalty = 'penalty',
  barrier = 'barrier',
}

export interface FParams {
  a: number
  b: number
  c: number
}

const getF = ({ a, b, c }: FParams) => (x: Vec2) => a * x.x1 ** 2 + b * x.x2 ** 2 + c
const getG = ({ a, b, c }: FParams) => (x: Vec2) => a * x.x1 + b * x.x2 + c

const epsilon = 0.05
const r0 = 0.5
const C = 10

const fp: FParams = {
  a: 6,
  b: 2,
  c: -17,
}

const gp: FParams = {
  a: 8,
  b: 1,
  c: -7,
}

// logger.log('f(x) = a*x1^2 + b*x2^2 + c')
// const a = Number(await logger.prompt('Введите a', {
//   type: 'text',
// }))

// const b = Number(await logger.prompt('Введите b', {
//   type: 'text',
// }))

// const c = Number(await logger.prompt('Введите c', {
//   type: 'text',
// }))

export interface StepData {
  x: Vec2
  fx: number
  gradfx: Vec2
  step: number
  absFdiff: number
  diffnorm: number
  lastCondition: boolean
}

export interface AnswerData {
  x: Vec2
  fx: number
  step: number
}

export function penalty(fp: FParams, gp: FParams, x0: Vec2, r0: number, C: number, epsilon: number) {
  // step 1
  const f = getF(fp)
  const g = getG(gp)
  logger.ready('Шаг 1')
  logger.log(`x0 = (${x0.x1}, ${x0.x2}), r0 = ${r0}, C = ${C}, Ɛ = ${epsilon}`)
  const fString = `(${fp.a}*x1^2) + (${fp.b}*x2^2) + (${fp.c})`
  const gString = `(${gp.a}*x1) + (${gp.b}*x2) + (${gp.c})`
  logger.log(`f(x) = ${fString}`)
  logger.log(`g(x) = ${gString} = 0`)
  logger.log(`k = 0`)
  let k = 0
  let x = x0
  let r = r0
  while (true) {
    // step 2
    logger.ready(`Шаг 2^${k}`)
    const P = (x: Vec2, r: number) => {
      const sum1 = g(x) ** 2
      // const gPlus = Math.max(0, g(x))
      // const sum2 = gPlus ** 2
      return r / 2 * (sum1)
    }
    // const gPlusString = g(x) > 0 ? gString : '0'
    const PString = `${r} / 2 + (${gString})^2`
    const FString = `${fString} + ${PString}`

    // const F = (x: Vec2, r: number) => f(x) + P(x, r)

    logger.log(`P(x, r^${k}) = ${PString}`)
    logger.log(`F(x, r^${k}) = f(x) + P(x, r^${k}) = ${FString}`)

    // step 3

    logger.ready(`Шаг 3^${k}`)
    logger.warn('Решаем Методом наискорейшего градиентного спуска')
    const res = newtonMethod(fp, gp, r, x, epsilon, epsilon, 10)
    logger.warn('Решили')

    const Fx = res.answer.fx
    const xAns = res.answer.x
    const Px = P(xAns, r)
    logger.log(`x*(r^${k}) = (${xAns.x1}, ${xAns.x2}), F(x, r^${k}) = ${Fx}`)
    logger.log(`P(x, r^${k}) = ${Px}`)
    // step 4
    logger.ready(`Шаг 4^${k}`)
    if (Px <= epsilon) {
    // step 4a
      logger.log(`${Px} <= ${epsilon}`)
      logger.ready(`Шаг 4a^${k}`)
      logger.box(`Ответ: k = ${k}, r^${k} = ${r}, x* = (${xAns.x1}, ${xAns.x2}), f(x*) = ${f(x)}`)
      return
    }
    else {
    // step 4b
      logger.log(`${Px} > ${epsilon}`)
      logger.ready(`Шаг 4b^${k}`)
      r = C * r
      x = xAns
      k++
      logger.log(`k = ${k}`)
      logger.log(`r^${k} = ${r}`)
      logger.log(`x^${k} = (${xAns.x1}, ${xAns.x2})`)
    }
  }
}

penalty(fp, gp, { x1: 0, x2: -1 }, r0, C, epsilon)

export function barrier(fp: FParams, gp: FParams, x0: Vec2, r0: number, C: number, epsilon: number) {
  // step 1
  const f = getF(fp)
  const g = getG(gp)
  const fString = `(${fp.a}*x1^2) + (${fp.b}*x2^2) + (${fp.c})`
  const gString = `(${gp.a}*x1) + (${gp.b}*x2) + (${gp.c})`
  logger.ready('Шаг 1')
  logger.log(`x0 = (${x0.x1}, ${x0.x2}), r0 = ${r0}, C = ${C}, Ɛ = ${epsilon}`)
  logger.log(`f(x) = ${fString}`)
  logger.log(`g(x) = ${gString} = 0`)
  logger.log(`k = 0`)
  let k = 0
  let x = x0
  let r = r0
  while (true) {
  // step 2
    logger.ready(`Шаг 2^${k}`)
    const P = (x: Vec2, r: number) => -r * 1 / g(x)
    const F = (x: Vec2, r: number) => f(x) + P(x, r)
    // const PString = `-${r} * 1 / (${gString})`
    // const FString = `${fString} ${PString}`
    logger.log(`P(x, r^${k}) = -${r} * 1 / g(x)`)
    logger.log(`F(x, r^${k}) = f(x) + P(x, r^${k})`)

    // step 3
    logger.ready(`Шаг 3^${k}`)
    logger.warn('Решаем Методом наискорейшего градиентного спуска')
    const res = newtonMethod(fp, gp, r, x, epsilon, epsilon, 10)
    logger.warn('Решили')
    const Fx = res.answer.fx
    const xAns = res.answer.x
    const Px = P(xAns, r)
    logger.log(`x*(r^${k}) = (${xAns.x1}, ${xAns.x2}), F(x, r^${k}) = ${Fx}`)
    logger.log(`P(x, r^${k}) = ${Px}`)

    // step 4
    logger.ready(`Шаг 4^${k}`)
    if (Math.abs(Px) <= epsilon) {
      logger.log(`${Math.abs(Px)} <= ${epsilon}`)
      logger.ready(`Шаг 4a^${k}`)
      logger.box(`Ответ: k = ${k}, r^${k} = ${r}, x* = (${xAns.x1}, ${xAns.x2}), f(x*) = ${f(x)}`)
      return
    }
    else {
      logger.log(`${Math.abs(Px)} > ${epsilon}`)
      logger.ready(`Шаг 4b^${k}`)
      r = r / C
      x = xAns
      k++
      logger.log(`k = ${k}`)
      logger.log(`r^${k} = ${r}`)
      logger.log(`x^${k} = (${xAns.x1}, ${xAns.x2})`)
    }
  }
}
