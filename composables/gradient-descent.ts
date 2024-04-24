import { Method, gradientDescentWithConstantStep } from '~/math/gradient-descent'
import { type Interval, type Vec2, isValidFunction } from '~/math/core'
import { type ExerciseVariant, variants } from '~/math/variants/gradient-descent-variants'

export function useMethodParams(method: Ref<string>) {
  const fString = ref(variants[14].f)
  const f = useFunction(fString)

  const x1Interval = ref<Interval<number>>({ start: -1, end: 1 })
  const x2Interval = ref<Interval<number>>({ start: -1, end: 1 })

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
    if (!f.value || !isValidFunction(f.value, { x1: 1, x2: 1 }))
      return null

    switch (method.value) {
      case Method.gradientDescentWithConstantStep:
        return gradientDescentWithConstantStep(fString.value, x0.value, epsilon1.value, epsilon2.value, M.value, l.value)
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
