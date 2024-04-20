import type { Interval, Vec2 } from '~/math/core'
import { type ExerciseVariant, variants } from '~/math/variants/gradient-descent-variants'

export function useMethodParams() {
  const fString = ref(variants[14].f)
  const f = useFunction(fString)

  const x1Interval = ref<Interval<number>>({ start: -5, end: 5 })
  const x2Interval = ref<Interval<number>>({ start: -5, end: 5 })

  const x0 = ref<Vec2>({ x1: 0, x2: 0.5 })
  const epsilon1 = ref(0.15)
  const epsilon2 = ref(0.2)
  const M = ref(10)

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

  return {
    fString,
    f,
    x1Interval,
    x2Interval,
    x0,
    epsilon1,
    epsilon2,
    M,
    setExerciseVariant,
  }
}
