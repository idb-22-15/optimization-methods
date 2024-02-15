export function roundToFixed(num: number, accuracy: number): number {
  const factor = 10 ** accuracy
  return Math.round(num * factor) / factor
}

export const toRounded = (x: number) => roundToFixed(x, 3)
