import type { BaseVariant } from '.'

export interface ExerciseVariant extends BaseVariant {
  order: number
  f: string
  x0: [number, number]
  epsilon1: number
  epsilon2: number
  M: number
}
export type ExerciseVariantKey = keyof ExerciseVariant

const x0: [number, number] = [1.5, 0.5]
const epsilon1 = 0.15
const epsilon2 = 0.2
const M = 10

const partialVariants: Pick<ExerciseVariant, 'order' | 'f'>[] = [
  {
    order: 1,
    f: 'x1^2 + 0.6*x1*x2 + 6*x2^2',
  },
]

export const variants: ExerciseVariant[] = partialVariants.map(v => ({ ...v, x0, epsilon1, epsilon2, M }))
