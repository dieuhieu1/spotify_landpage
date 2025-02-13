export function adjustBrightness(color, brightnessFactor) {
  const [r, g, b] = color.split(",").map(Number);

  // Điều chỉnh từng kênh màu với hệ số brightnessFactor
  const newR = Math.min(255, Math.max(0, Math.floor(r * brightnessFactor)));
  const newG = Math.min(255, Math.max(0, Math.floor(g * brightnessFactor)));
  const newB = Math.min(255, Math.max(0, Math.floor(b * brightnessFactor)));

  return `${newR},${newG},${newB}`;
}
