import type { User } from "./User"

export type EngineUserContext = {
  skill: "beginner" | "intermediate" | "advanced"
  maxComfortableWave: number
  riskTolerance: "low" | "medium" | "high"
  avoidReefs?: boolean
  homeRegion?: string
  usualRegions?: string[]
  notificationsEnabled: boolean
}

export function toEngineUserContext(user: User): EngineUserContext {
  return {
    skill: user.skill,
    maxComfortableWave: user.preferences.maxComfortableWave,
    riskTolerance: user.preferences.riskTolerance,
    avoidReefs: user.preferences.avoidReefs,
    homeRegion: user.homeRegion,
    usualRegions: user.usualRegions,
    notificationsEnabled: user.notificationSettings.enabled
  }
}
