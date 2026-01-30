/**
 * Exponential distance score (0–1). No hard cap; farther = lower score.
 * Harsh = steeper decay; lenient = gentler decay.
 */
export function distanceScore(
  distanceKm: number,
  strictness: "harsh" | "lenient"
): number {
  const k = strictness === "harsh" ? 0.06 : 0.02
  return Math.exp(-k * distanceKm)
}
