import { Method, newtonMethod } from '~/math/two-dimentional-optimization'
import { type Interval, type Vec2, getGradient, isValidFunction } from '~/math/core'
import { type ExerciseVariant, variants } from '~/math/variants/two-dimentional-optimiazation-variants'

export function useMethodParams(method: Ref<string>) {
  const fString = ref(variants[0].f)
  const f = useFunction(fString)

  const x1Interval = ref<Interval<number>>({ start: -2, end: 2 })
  const x2Interval = ref<Interval<number>>({ start: -2, end: 2 })

  const x0 = ref<Vec2>({ x1: 0, x2: 0.5 })
  const epsilon1 = ref(0.15)
  const epsilon2 = ref(0.2)
  const M = ref(10)
  const l = ref(0.5)

  function setExerciseVariant(variant: ExerciseVariant) {
    fString.value = variant.f
    x0.value = {
      x1: variant.x0[0],
      x2: variant.x0[1],
    }
    epsilon1.value = variant.epsilon1
    epsilon2.value = variant.epsilon2
    M.value = variant.M
  }

  const result = computed(() => {
    if (!f.value || !isValidFunction(f.value, { x1: x0.value.x1, x2: x0.value.x2 }))
      return null
    const gradf = (x: Vec2) => getGradient(fString.value, { x1: x.x1, x2: x.x2 })!

    switch (method.value) {
      case Method.newton:
      {
        const res = newtonMethod(f.value, gradf, x0.value, epsilon1.value, epsilon2.value, M.value)
        // logger.info(res)
        return res
      }
      default: throw new Error('no method')
    }
  })

  return {
    fString,
    f,
    x1Interval,
    x2Interval,
    x0,
    epsilon1,
    epsilon2,
    M,
    l,
    setExerciseVariant,
    result,
  }
}
