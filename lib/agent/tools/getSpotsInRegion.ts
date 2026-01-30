import { tool } from "@langchain/core/tools"
import { z } from "zod"
import { getSpotsByRegion } from "@/lib/shared/spots"

export const getSpotsInRegion = tool(
  async ({ region }) => {
    const spots = getSpotsByRegion(region)
    return JSON.stringify(spots.slice(0, 15).map((s) => ({ id: s.id, name: s.name, region: s.region, type: s.type })))
  },
  {
    name: "get_spots_in_region",
    description: "Get surf spots in a region (e.g. Connacht, Donegal). Use only when the user has no lastLocation (location unknown)—then use their homeRegion or usualRegions. If the user has lastLocation, use get_spots_near_user instead; do not call both.",
    schema: z.object({ region: z.string().describe("Region name") }),
  }
)
