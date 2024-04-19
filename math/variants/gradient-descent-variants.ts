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

const x0: [number, number] = [0, 0.5]
const epsilon1 = 0.15
const epsilon2 = 0.2
const M = 10

const partialVariants: Pick<ExerciseVariant, 'order' | 'f'>[] = [
  {
    order: 1,
    f: '5*x1^2 + 0.5*x1*x2',
  },
  {
    order: 2,
    f: '6*x2 + 0.6*x1*x2 + x2^2',
  },
  {
    order: 3,
    f: '3*x1^2 + 0.4*x1*x2 + 5*x2^2',
  },
  {
    order: 4,
    f: '3*x1^2 + 0.6*x1*x2 + 3*x2^2',
  },
  {
    order: 5,
    f: '4*x1^2 + 0.2*x1*x2 + 6*x2^2',
  },
  {
    order: 6,
    f: '3*x1^2 + 0.1*x1*x2 + 6*x2^2',
  },
  {
    order: 7,
    f: '6*x1^2 + 0.4*x1*x2 + 5*x2^2',
  },
  {
    order: 8,
    f: '2*x1^2 + 0.1*x1*x2 + 2*x2^2',

  },
  {
    order: 9,
    f: '2*x1^2 + 0.2*x1*x2 + 6*x2^2',
  },
  {
    order: 10,
    f: '4*x1^2 + 0.6*x1*x2 + 4*x2^2',
  },
  {
    order: 11,
    f: '5*x1^2 + 0.6*x1*x2 + 2*x2^2',
  },
  {
    order: 12,
    f: 'x1^2 + 0.6*x1*x2 + 2*x2^2',
  },
  {
    order: 13,
    f: '4*x1^2 + 0.5*x1*x2 + 2*x2^2',
  },
  {
    order: 14,
    f: '6*x1^2 + 0.6*x1*x2 + 3*x2^2',
  },
  {
    order: 15,
    f: 'x1^2 + 0.6*x1*x2 + 6*x2^2',
  },
  {
    order: 16,
    f: '4*x1^2 + 0.5*x1*x2 + 6*x2^2',
  },
  {
    order: 17,
    f: '6*x1^2 + 0.3*x1*x2 + 4*x2^2',
  },

  {
    order: 18,
    f: '2*x1^2 + 0.5*x1*x2 + 2*x2^2',
  },

  {
    order: 19,
    f: 'x1^2 + 0.5*x1*x2 + 5*x2^2',
  },

  {
    order: 20,
    f: 'x1^2 + 0.6*x1*x2 + x2^2',
  },
  {
    order: 21,
    f: '3*x1^2 + 0.3*x1*x2 + 5*x2^2',
  },
  {
    order: 22,
    f: '6*x1^2 + 0.5*x1*x2 + 2*x2^2',
  },

  {
    order: 23,
    f: '6*x1^2 + 0.6*x1*x2 + 2*x2^2',
  },
  {
    order: 24,
    f: '3*x1^2 + 0.2*x1*x2 + 3*x2^2',
  },
  {
    order: 25,
    f: '4*x1^2 + 0.1*x1*x2 + 3*x2^2',
  },
  {
    order: 26,
    f: '3*x1^2 + 0.3*x1*x2 + 4*x2^2',
  },
  {
    order: 27,
    f: '5*x1^2 + 3*x1*x2 + 5*x2^2',
  },

  {
    order: 28,
    f: '3*x1^2 + 0.4*x1*x2 + 4*x2^2',
  },

  {
    order: 29,
    f: 'x1^2 + 0.4*x1*x2 + x2^2',
  },

  {
    order: 30,
    f: '2*x1^2 + 0.5*x1*x2 + 6*x2^2',
  },

]

export const variants: ExerciseVariant[] = partialVariants.map(v => ({ ...v, x0, epsilon1, epsilon2, M }))
