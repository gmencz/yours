interface SmoothingOptions {
  // We can pad the array to keep the size of the returning array the same as the original one, useful for
  // graphs.
  pad: boolean;
}

export function smoothOutWeights(
  weights: number[],
  options?: Partial<SmoothingOptions>
) {
  // Set the size of the rolling average window to 7 days.
  const windowSize = 7;

  // Initialize an array to hold the smoothed weights
  const smoothedWeights = [];

  if (options?.pad) {
    // Calculate the number of padding values to add at the beginning and end of the array
    const paddingSize = Math.floor(windowSize / 2);

    // Add padding values at the beginning and end of the array using the first and last weights in the original array
    const paddedWeights = [...Array(paddingSize).fill(weights[0])]
      .concat(weights)
      .concat([...Array(paddingSize).fill(weights[weights.length - 1])]);

    // Calculate the rolling average for each set of weights in the window
    for (let i = 0; i < weights.length; i++) {
      // Calculate the sum of the weights in the window
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += paddedWeights[i + j];
      }

      // Calculate the average weight and add it to the array of smoothed weights
      const avg = sum / windowSize;
      smoothedWeights.push(avg);
    }

    // Return the array of smoothed weights
    return smoothedWeights;
  } else {
    // Calculate the rolling average for each set of weights in the window
    for (let i = 0; i < weights.length - windowSize + 1; i++) {
      // Calculate the sum of the weights in the window
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += weights[i + j];
      }

      // Calculate the average weight and add it to the array of smoothed weights
      const avg = sum / windowSize;
      smoothedWeights.push(avg);
    }

    // Return the array of smoothed weights
    return smoothedWeights;
  }
}
