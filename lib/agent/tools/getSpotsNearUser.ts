import { tool } from "@langchain/core/tools"
import { z } from "zod"
import type { ToolRuntime } from "@langchain/core/tools"
import { getMockUser } from "@/lib/db/mockUserClient"
import { distanceScore } from "@/lib/shared/distanceScore"
import { allSpots } from "@/lib/shared/spots"
import { getAllSpotsWithDistance } from "@/lib/shared/spots/nearby"
import type { AgentContext } from "./types"

export const getSpotsNearUser = tool(
  async (_input, runtime: ToolRuntime<unknown, AgentContext>) => {
    const userId = runtime.context?.userId
    if (!userId) return JSON.stringify({ error: "No userId in context" })
    const user = getMockUser(userId)
    if (!user) return JSON.stringify({ error: "User not found", userId })
    const loc = user.lastLocation ?? { lat: 54.27, lon: -8.6, source: "gps" as const, confidence: "low" as const, updatedAt: new Date() }
    const strictness = user.preferences?.notifyStrictness ?? "lenient"
    const withDistance = getAllSpotsWithDistance(allSpots, { lat: loc.lat, lon: loc.lon })
    const withScore = withDistance.map((s) => ({
      id: s.id,
      name: s.name,
      region: s.region,
      type: s.type,
      distanceKm: Math.round(s.distanceKm * 10) / 10,
      distanceScore: Math.round(distanceScore(s.distanceKm, strictness) * 100) / 100,
    }))
    return JSON.stringify(withScore.slice(0, 15))
  },
  {
    name: "get_spots_near_user",
    description: "Get surf spots with distance from user's location. Use when the user has lastLocation. Returns top 15 spots with distanceKm and distanceScore (0–1, exponential penalty). Do not also call get_spots_in_region when you have location—this list is sufficient.",
    schema: z.object({}),
  }
)
