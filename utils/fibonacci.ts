function fibonacci(n: number): number[] {
  const fibSequence = [0, 1]
  while (fibSequence.length < n) {
    const nextNumber = fibSequence[fibSequence.length - 1] + fibSequence[fibSequence.length - 2]
    fibSequence.push(nextNumber)
  }
  return fibSequence
}

const NUMBER_OF_FIBNUMBERS = 200

export const fibNumbers = fibonacci(NUMBER_OF_FIBNUMBERS)
