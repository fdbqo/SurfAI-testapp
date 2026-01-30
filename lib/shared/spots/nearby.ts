import type { Spot } from "./Spot"
import { distanceKm, type LatLon } from "../geo"

export type SpotWithDistance = Spot & { distanceKm: number }

export type NearbySpotsResult = {
  center: LatLon
  radiusKm: number
  within: SpotWithDistance[]
  outside: SpotWithDistance[]
}

export function getNearbySpots(
  spots: Spot[],
  center: LatLon,
  radiusKm: number = 20
): NearbySpotsResult {
  const withDistances: SpotWithDistance[] = spots.map((s) => ({
    ...s,
    distanceKm: distanceKm(center, { lat: s.lat, lon: s.lon }),
  }))

  const within: SpotWithDistance[] = []
  const outside: SpotWithDistance[] = []

  for (const s of withDistances) {
    if (s.distanceKm <= radiusKm) within.push(s)
    else outside.push(s)
  }

  within.sort((a, b) => a.distanceKm - b.distanceKm)
  outside.sort((a, b) => a.distanceKm - b.distanceKm)

  return { center, radiusKm, within, outside }
}

export function getAllSpotsWithDistance(spots: Spot[], center: LatLon): SpotWithDistance[] {
  const withDistances: SpotWithDistance[] = spots.map((s) => ({
    ...s,
    distanceKm: distanceKm(center, { lat: s.lat, lon: s.lon }),
  }))
  withDistances.sort((a, b) => a.distanceKm - b.distanceKm)
  return withDistances
}

