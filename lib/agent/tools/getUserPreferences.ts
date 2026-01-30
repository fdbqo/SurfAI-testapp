import { tool } from "@langchain/core/tools"
import { z } from "zod"
import type { ToolRuntime } from "@langchain/core/tools"
import { getMockUser } from "@/lib/db/mockUserClient"
import type { AgentContext } from "./types"

export const getUserPreferences = tool(
  async (_input, runtime: ToolRuntime<unknown, AgentContext>) => {
    const userId = runtime.context?.userId
    if (!userId) return JSON.stringify({ error: "No userId in context" })
    const user = getMockUser(userId)
    if (!user) return JSON.stringify({ error: "User not found", userId })
    return JSON.stringify({
      id: user.id,
      skill: user.skill,
      preferences: user.preferences,
      homeRegion: user.homeRegion,
      usualRegions: user.usualRegions,
      lastLocation: user.lastLocation,
    })
  },
  {
    name: "get_user_preferences",
    description: "Get surf preferences and location for the user. Call this first to know their skill, max wave height, risk tolerance, and region.",
    schema: z.object({}),
  }
)
