export function roundToFixed(num: number, figures: number): number {
  const factor = 10 ** figures
  return Math.round(num * factor) / factor
}

export function roundToSignificantFigures(number: number, significantFigures: number) {
  if (number === 0)
    return 0

  const exponent = Math.floor(Math.log10(Math.abs(number))) // Получаем порядок числа
  const magnitude = 10 ** (significantFigures - 1 - exponent) // Получаем множитель для округления

  const roundedNumber = Math.round(number * magnitude) / magnitude // Округляем число до указанного количества значащих цифр

  return roundedNumber
}
