import { createAgent } from "langchain"
import { ChatOpenAI } from "@langchain/openai"
import { z } from "zod"
import { SurfNotifyDecisionSchema } from "@/types/agent/SurfNotifyDecision"
import {
  getUserPreferences,
  getSpotsNearUser,
  getSpotsInRegion,
  getSurfConditions,
  getSurfConditionsBatch,
} from "./tools"

const SURF_GUIDE = `You are a surf notification agent. Decide whether to notify the user about surf conditions. Use only live conditions from MongoDB (current conditions right now). Do not use forecasts.

Surf interpretation:
- Beginner: ideal wave height 0.5–1.0 m, max comfortable ~1.2 m; prefer beach breaks, avoid reef; offshore wind preferred.
- Intermediate: 1.0–2.0 m; can handle light onshore.
- Advanced: 1.5–3+ m; can handle reef and stronger wind.
- Offshore wind = cleaner waves; onshore = choppy. Prefer swell period 8+ s for quality.

Tools:
- get_surf_conditions / get_surf_conditions_batch: current live conditions (right now). Use batch with spot IDs from spots call to compare nearby spots.

Live-only: We send the notification straight away or not at all. If conditions are good right now, notify with reason = message for the user (e.g. "[Spot] is good right now (1.1m, onshore, 9.9km away)"). If too late or not suitable, do not notify.

Choosing which spot when several are good: Use get_surf_conditions_batch to compare. Prefer the closer spot (higher distanceScore) unless the farther has clearly better conditions for that skill. When notifying, set whyThisSpot: both spots with distanceKm and key conditions, then why this one.

Use the tools: get user preferences, then get_spots_near_user (or get_spots_in_region if no location), then get_surf_conditions_batch with those spot IDs. Decide from live conditions only. Output: notify (true/false), reason (message for user or short reason if not), nextCheckAt (when to run again: e.g. "in 4 hours", "tomorrow morning"). If not notifying, set whatWasChecked and whyNotSuitable; leave them empty when notifying. When notifying, set spotId, spotName, reason, whyThisSpot. If tools return empty or error, say so in whyNotSuitable.`

const responseFormat = SurfNotifyDecisionSchema

export const surfNotifyContextSchema = z.object({
  userId: z.string(),
})

export function createSurfNotifyAgent() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0.2,
  })
  return createAgent({
    model: llm,
    tools: [
      getUserPreferences,
      getSpotsNearUser,
      getSpotsInRegion,
      getSurfConditions,
      getSurfConditionsBatch,
    ],
    systemPrompt: SURF_GUIDE,
    responseFormat,
    contextSchema: surfNotifyContextSchema,
  })
}

export type SurfNotifyAgent = ReturnType<typeof createSurfNotifyAgent>
