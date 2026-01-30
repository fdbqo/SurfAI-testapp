export * from './types'
export * from './scoring'
export * from './wind-correction'
export * from './geo'

export * from './spots'

import irelandSpotsData from './spots/ireland.json'
export const irelandSpots = irelandSpotsData
export type { SpotLocation } from './types'

