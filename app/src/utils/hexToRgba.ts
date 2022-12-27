export function hexToRgba(hex: string, opacity: number) {
  // Parse the hex string and convert it to an integer
  const int = parseInt(hex.replace("#", ""), 16);

  // Extract the red, green, and blue values from the integer
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;

  // Return the RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
