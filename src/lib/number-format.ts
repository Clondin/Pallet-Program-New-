export function roundToDecimals(value: number, decimals: number) {
  const factor = 10 ** decimals
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function formatWeight(value: number) {
  return roundToDecimals(value, 2).toFixed(2)
}
