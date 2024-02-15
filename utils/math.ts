export function roundToFixed(num: number, accuracy: number): number {
  const factor = 10 ** accuracy
  return Math.round(num * factor) / factor
}
