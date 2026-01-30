import type { User } from "@/types/user/User"

export const mockUser: User = {
  id: "test-user-1",
  skill: "beginner",
  preferences: {
    maxComfortableWave: 1.2,
    riskTolerance: "low",
    avoidReefs: true,
    notifyStrictness: "lenient",
  },
  notificationSettings: {
    enabled: true,
  },
  lastLocation: {
    lat: 54.2713,
    lon: -8.6017,
    source: "gps",
    confidence: "high",
    updatedAt: new Date("2026-01-19T10:30:00.000Z"),
  },
  homeRegion: "Connacht",
  usualRegions: ["Connacht"],
  createdAt: new Date("2026-01-01T09:00:00.000Z"),
  updatedAt: new Date("2026-01-19T10:30:00.000Z"),
}

export const mockUserAdvanced: User = {
  id: "test-user-advanced",
  skill: "advanced",
  preferences: {
    maxComfortableWave: 10.0,
    riskTolerance: "high",
    notifyStrictness: "lenient",
  },
  notificationSettings: {
    enabled: true,
  },
  lastLocation: {
    lat: 54.147127,
    lon: -8.319760,
    source: "gps",
    confidence: "high",
    updatedAt: new Date("2026-01-19T08:45:00.000Z"),
  },
  homeRegion: "Connacht",
  usualRegions: ["Connacht"],
  createdAt: new Date("2025-12-01T12:00:00.000Z"),
  updatedAt: new Date("2026-01-19T08:45:00.000Z"),
}

export const mockUsers = [mockUser, mockUserAdvanced]

export function getMockUser(userId: string): User | null {
  return mockUsers.find((u) => u.id === userId) ?? null
}
