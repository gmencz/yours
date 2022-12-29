/**
 * Checks if a number is close to another number.
 * @param num1 the first number to compare
 * @param num2 the second number to compare
 * @param tolerance the maximum difference between the two numbers for them to be considered close
 * @returns `boolean`
 */
export function isClose(num1: number, num2: number, tolerance: number) {
  const difference = Math.abs(num1 - num2);
  if (difference <= tolerance) {
    return true;
  }

  return false;
}
