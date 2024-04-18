import * as core from '~/math/core'

export function useFunction(s: Ref<string>) {
  return computed(() => core.getFunction(s.value))
}
