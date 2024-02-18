export interface ExerciseVariant {
  order: number
  f: string
  range: [number, number]
  epsilon: number
}
export const exerciseVariants: ExerciseVariant[] = [{
  order: 1,
  f: '2x^3-3x^2-12x-5',
  range: [0, 6],
  epsilon: 0.4,
}, {
  order: 2,
  f: 'x^3-3x^2-24x-3',
  range: [2, 6],
  epsilon: 0.3,
}, {
  order: 3,
  f: 'x^3-3x^2+3',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 4,
  f: 'x^3-12x+6',
  range: [0, 4],
  epsilon: 0.3,
}, {
  order: 5,
  f: 'x^3+3x^2-24x-10',
  range: [0, 4],
  epsilon: 0.3,
}, {
  order: 6,
  f: '2x^3-3x^2-12x+10',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 7,
  f: '2x^3-3x^2-24x-10',
  range: [-1, 3],
  epsilon: 0.3,
}, {
  order: 8,
  f: 'x^3-3x^2+2.5',
  range: [1, 3],
  epsilon: 0.2,

}, {
  order: 9,
  f: 'x^3+3x^2-2',
  range: [-1, 1],
  epsilon: 0.2,
}, {
  order: 10,
  f: 'x^3+3x^2-3.5',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 11,
  f: 'x^3+3x^2-24x+10',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 12,
  f: 'x^3-3x^2-24x-8',
  range: [2, 6],
  epsilon: 0.3,
}, {
  order: 13,
  f: '2x^3+9x^2-10',
  range: [-1, 1],
  epsilon: 0.2,
}, {
  order: 14,
  f: 'x^3-12x+10',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 15,
  f: 'x^3+3x^2-3',
  range: [-1, 1],
  epsilon: 0.2,
}, {
  order: 16,
  f: '2x^3-3x^3-12x+1',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 17,
  f: 'x^3-3x^3-24x-5',
  range: [2, 6],
  epsilon: 0.3,
}, {
  order: 18,
  f: 'x^3-4x^2+2',
  range: [2, 4],
  epsilon: 0.2,
}, {
  order: 19,
  f: 'x^3-12x-5',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 20,
  f: 'x^3+3x^2-24x+1',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 21,
  f: '2x^3-3x^2-12x+12',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 22,
  f: '2x^3+9x^2-6',
  range: [-1, 1],
  epsilon: 0.2,
}, {
  order: 23,
  f: 'x^3-3x^2+1.5',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 24,
  f: 'x^3-3x^2-24x-3',
  range: [3, 5],
  epsilon: 0.2,
}, {
  order: 25,
  f: 'x^3+3x^2-24x-3',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 26,
  f: 'x^3-12x-10',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 27,
  f: '2x^3+9x^2-4',
  range: [1, 3],
  epsilon: 0.2,
}, {
  order: 28,
  f: '2x^3-3x^2-12x+8',
  range: [2, 4],
  epsilon: 0.2,
}, {
  order: 29,
  f: 'x^3+3x^2+3.5',
  range: [-1, 3],
  epsilon: 0.3,
}, {
  order: 30,
  f: 'x^3-3x^2+3.5',
  range: [1, 3],
  epsilon: 0.3,
}]
