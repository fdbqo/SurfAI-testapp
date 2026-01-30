export type User = {
  id: string

  skill: "beginner" | "intermediate" | "advanced"

  preferences: {
    maxComfortableWave: number
    riskTolerance: "low" | "medium" | "high"
    avoidReefs?: boolean
    notifyStrictness?: "harsh" | "lenient"
  }

  notificationSettings: {
    enabled: boolean
  }

  lastLocation?: {
    lat: number
    lon: number
    source: "gps" | "ip" | "manual"
    confidence: "high" | "low"
    updatedAt: Date
  }

  homeRegion?: string
  usualRegions?: string[]

  createdAt: Date
  updatedAt: Date
}
