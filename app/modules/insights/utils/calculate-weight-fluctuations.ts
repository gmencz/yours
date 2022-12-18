/**
 * Calculates the weight fluctuations. this algorithm accounts for the influence of weight values over a
 * pretty long time scale, while placing more weight on more recent values, however it doesn't overreact to short-term fluctuations
 * in weight but it also isn't be slow to pick up on real trends as they develop.
 * @param weights The weights to calculate the trend from
 * @returns The weight fluctuations
 */
export function calculateWeightFluctuations(weights: number[]) {
  // This will store the calculated averages for each time period.
  const averages = [];

  // Loop through the array of weights and calculate the average for each time period. To do this, we use a sliding window approach,
  // where you take a certain number of consecutive weights and calculate the average for that time period.
  // In this case, the time period we are using is every 7 days (weekly). This is a reasonable window To ensure that the algorithm doesn't overreact
  // to short-term fluctuations in weight because weight can change on daily basis due to many reasons like glycogen stores being depleted,
  // way too much sodium consumption on previous day, etc...
  // This window also ensures that the algorithm isn't slow to pick up on real trends as they develop.
  for (let i = 0; i < weights.length - 6; i++) {
    const average =
      (weights[i] +
        weights[i + 1] +
        weights[i + 2] +
        weights[i + 3] +
        weights[i + 4] +
        weights[i + 5] +
        weights[i + 6]) /
      7;

    averages.push(average);
  }

  return averages;
}
