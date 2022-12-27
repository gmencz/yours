// E.g. 0.500 becomes 0.50; 7 stays as 7.
export function formatDecimal(n: number) {
  return n % 1 !== 0 ? n.toFixed(2) : n.toString();
}
