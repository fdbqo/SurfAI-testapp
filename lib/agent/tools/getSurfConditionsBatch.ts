import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getConditionsForSpots } from "@/lib/db/services/spotConditionsService"
import { getSpotById } from "@/lib/shared/spots"

export const getSurfConditionsBatch = tool(
  async ({ spotIds }) => {
    const valid = spotIds.filter((id) => getSpotById(id))
    if (valid.length === 0) return JSON.stringify({ error: "No valid spot IDs", spotIds })
    try {
      const results = await getConditionsForSpots(valid)
      return JSON.stringify(
        results.map((r) => ({
          spotId: r.spotId,
          conditions: r.conditions,
          error: r.conditions ? undefined : "No live conditions",
        }))
      )
    } catch (e) {
      console.error("getConditionsForSpots error:", e)
      return JSON.stringify({ error: "Failed to fetch conditions for spots", spotIds })
    }
  },
  {
    name: "get_surf_conditions_batch",
    description:
      "Get current surf conditions for multiple spots at once (wave height, period, wind). Pass spot IDs from get_spots_near_user or get_spots_in_region. Use this to compare all nearby spots and pick the best—avoids missing a better spot. Returns one entry per spot with conditions or error.",
    schema: z.object({
      spotIds: z.array(z.string()).describe("Array of spot IDs (e.g. from get_spots_near_user)"),
    }),
  }
)
