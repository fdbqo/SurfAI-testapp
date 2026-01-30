import { z } from "zod"

export const SurfNotifyDecisionSchema = z.object({
  notify: z.boolean().describe("Whether to send a notification now (we send straight away or not at all)."),
  spotId: z.string().describe("Spot ID if notifying, or empty string"),
  spotName: z.string().describe("Spot name if notifying, or empty string"),
  reason: z.string().describe("Message to show the user: e.g. 'Dunmoran is good right now (1.1m, onshore, 9.9km away)'. If not notifying, short reason why."),
  nextCheckAt: z.string().describe("When to run the agent again: e.g. 'in 4 hours', 'tomorrow morning'. Logical next check time."),
  whatWasChecked: z.string().describe("Log: what you looked at (e.g. 'Live conditions 3 spots'). Empty when not needed."),
  whyNotSuitable: z.string().describe("Log: when not notifying, why (e.g. 'Wind 33 km/h onshore; no spot suitable'). Empty when notifying."),
  whyThisSpot: z.string().describe("When notifying: why this spot over others (e.g. 'Closer 9.9km; conditions similar to Strandhill'). Empty when not notifying."),
})

export type SurfNotifyDecision = z.infer<typeof SurfNotifyDecisionSchema>
