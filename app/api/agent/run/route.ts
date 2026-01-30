import { NextResponse } from "next/server"
import { createSurfNotifyAgent } from "@/lib/agent/surfAgent"
import { HumanMessage } from "@langchain/core/messages"
import type { AgentTraceStep } from "@/types/agent/AgentTrace"

function looksLikeStructuredDecision(content: string): boolean {
  try {
    const o = JSON.parse(content) as Record<string, unknown>
    return typeof o.notify === "boolean" && typeof o.reason === "string" && typeof o.nextCheckAt === "string"
  } catch {
    return false
  }
}

function buildTrace(messages: unknown[]): AgentTraceStep[] {
  const steps: AgentTraceStep[] = []
  const pendingCalls: { name: string; args: Record<string, unknown> }[] = []
  const truncate = (s: string, max: number) =>
    typeof s !== "string" ? "" : s.length <= max ? s : s.slice(0, max) + "…"
  for (const msg of messages) {
    const m = msg as { getType?: () => string; type?: string; tool_calls?: Array<{ name: string; args?: Record<string, unknown> }>; content?: string; name?: string }
    const type = m.getType?.() ?? m.type ?? ""
    if (type === "ai") {
      if (typeof m.content === "string" && m.content.trim() && !looksLikeStructuredDecision(m.content)) {
        steps.push({ kind: "reasoning", content: truncate(m.content, 500) })
      }
      if (Array.isArray(m.tool_calls)) {
        for (const tc of m.tool_calls) {
          pendingCalls.push({ name: tc.name ?? "tool", args: tc.args ?? {} })
        }
      }
    }
    if (type === "tool") {
      const result = typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "")
      const call = pendingCalls.shift()
      steps.push({
        kind: "tool",
        name: call?.name ?? (m as { name?: string }).name ?? "tool",
        args: call?.args ?? {},
        result, // full result so UI "Show full result" has data to show
      })
    }
  }
  return steps
}

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const userId = (body.userId as string) ?? "test-user-1"

    const now = new Date()
    const currentTimeIso = now.toISOString()
    const currentTimeLocal = now.toLocaleString("en-IE", { timeZone: "Europe/Dublin", dateStyle: "short", timeStyle: "short" })
    const agent = createSurfNotifyAgent()
    const result = await agent.invoke(
      {
        messages: [
          new HumanMessage(
            `Should we notify this user about surf? User ID: ${userId}. Current time: ${currentTimeIso} (Ireland: ${currentTimeLocal}). Use this to avoid suggesting surf windows that have already passed (e.g. do not suggest "6pm today" if it is already after 6pm). Use tools to get their preferences, nearby spots, and conditions, then decide and return the structured response.`
          ),
        ],
      },
      { context: { userId }, recursionLimit: 75 }
    )

    const decision = result.structuredResponse
    if (!decision) {
      return NextResponse.json(
        { error: "Agent did not return a structured decision", messages: result.messages?.length },
        { status: 502 }
      )
    }

    const trace = buildTrace(result.messages ?? [])
    return NextResponse.json({ decision, trace })
  } catch (err) {
    console.error("Agent run error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Agent run failed" },
      { status: 500 }
    )
  }
}
