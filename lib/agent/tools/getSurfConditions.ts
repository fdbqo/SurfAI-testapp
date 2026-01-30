import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getConditionsForSpot } from "@/lib/db/services/spotConditionsService"
import { getSpotById } from "@/lib/shared/spots"

export const getSurfConditions = tool(
  async ({ spotId }) => {
    if (!getSpotById(spotId)) return JSON.stringify({ error: "Spot not found", spotId })
    try {
      const conditions = await getConditionsForSpot(spotId)
      if (conditions) return JSON.stringify(conditions)
      return JSON.stringify({ error: "No live conditions for this spot", spotId })
    } catch (e) {
      console.error("getConditionsForSpot error:", e)
      return JSON.stringify({ error: "Failed to fetch conditions", spotId })
    }
  },
  {
    name: "get_surf_conditions",
    description: "Get current surf conditions for a spot (wave height, period, wind) from live hourly data. Call with spotId from get_spots_near_user or get_spots_in_region. Returns error if no data.",
    schema: z.object({ spotId: z.string().describe("Spot ID") }),
  }
)
