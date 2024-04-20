import type { Interval } from '~/math/core'
import type { Dot, InitialXRange } from '~/math/one-dimensional-optimization'
import { type ExerciseVariant, variants } from '~/math/variants/one-dimensional-optimization-variants'

export function useMethodParams() {
  const fString = ref(variants[14].f)
  const _f = useFunction(fString)
  const f = computed(() => (x: number) => _f.value?.({ x }) || x)

  const epsilon = ref(0.2)

  const range = ref<InitialXRange>({ a: -10, b: 10 })
  const range2d = computed<Interval<Dot>>(() => ({
    start: {
      x: range.value.a,
      fx: f.value(range.value.a),
    },
    end: {
      x: range.value.b,
      fx: f.value(range.value.b),
    },

  }))

  function setExerciseVariant(variant: ExerciseVariant) {
    fString.value = variant.f
    range.value.a = variant.range[0]
    range.value.b = variant.range[1]
    epsilon.value = variant.epsilon
  }

  return {
    f,
    fString,
    range1d: range,
    range2d,
    epsilon,
    setExerciseVariant,
  }
}
