import type { Spot } from './Spot'

import { connachtSpots } from './ireland/connacht'

export const allSpots: Spot[] = [
  ...connachtSpots,
]

export function getSpotById(id: string): Spot | undefined {
  return allSpots.find((s) => s.id === id)
}

export function getSpotsByRegion(region: string): Spot[] {
  return allSpots.filter((s) => s.region === region)
}

export function getSpotsByCountry(country: string): Spot[] {
  return allSpots.filter((s) => s.country === country)
}

export * from "./nearby"

export type { Spot } from './Spot'

