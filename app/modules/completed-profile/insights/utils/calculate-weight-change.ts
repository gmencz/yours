/**
 * Calculates how much the weight changed, it doesn't overreact to sudden weight changes by using a smoothing approach
 * but it also isn't slow to pick up on real weight changes.
 * @param weights The list of weights
 * @returns The weight change
 */
export function calculateWeightChange(weights: number[]) {
  // Initialize variables to store the starting weight and total weight change
  let startWeight = weights[0];
  let totalWeightChange = 0;

  // Loop through the weights and calculate the weight change for each weight
  for (let i = 1; i < weights.length; i++) {
    let currentWeight = weights[i];
    let weightChange = currentWeight - startWeight;

    // Smooth the weight change by taking the average of the current weight change and the previous weight change
    totalWeightChange = (totalWeightChange + weightChange) / 2;
  }

  return totalWeightChange;
}
