import { type Interval, getFunction } from '~/math/core'

export function useFunction(s: Ref<string>) {
  return computed(() => getFunction(s.value))
}

export function useSequence(interval: Ref<Interval<number>>, length: MaybeRef<number>) {
  const diff = computed(() => interval.value.end - interval.value.start)

  const sequence = computed(() => isRef(length)
    ? Array.from({ length: length.value }).map((_, i) => interval.value.start + i * diff.value / (length.value - 1))
    : Array.from({ length }).map((_, i) => interval.value.start + i * diff.value / (length - 1)))

  return sequence
}
