import { NextResponse } from "next/server"
import { toolsByName } from "@/lib/agent/tools"
import { mockUser } from "@/lib/db/mockUserClient"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const toolName = (body.tool as string)?.trim()
    const args = (body.args as Record<string, unknown>) ?? {}
    const userId = (body.userId as string) ?? mockUser.id

    if (!toolName) {
      return NextResponse.json(
        {
          error: "Missing 'tool' in body",
          available: Object.keys(toolsByName),
        },
        { status: 400 }
      )
    }

    const t = toolsByName[toolName]
    if (!t) {
      return NextResponse.json(
        { error: `Unknown tool: ${toolName}`, available: Object.keys(toolsByName) },
        { status: 400 }
      )
    }

    const result = await t.invoke(args, {
      context: { userId },
    })

    return NextResponse.json({
      tool: toolName,
      args,
      result: typeof result === "string" ? result : JSON.stringify(result),
      parsed: typeof result === "string" ? safeParse(result) : result,
    })
  } catch (err) {
    console.error("Debug tool error:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Tool invocation failed",
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const toolName = searchParams.get("tool")?.trim()
  if (!toolName) {
    return NextResponse.json(
      {
        error: "Missing query param: tool",
        available: Object.keys(toolsByName),
        example: "/api/debug/tool?tool=get_surf_conditions&spotId=5842041f4e65fad6a7708c3c",
      },
      { status: 400 }
    )
  }

  const args: Record<string, unknown> = {}
  for (const [k, v] of searchParams) {
    if (k === "tool") continue
    args[k] = v
  }

  const userId = (searchParams.get("userId") as string) ?? mockUser.id

  try {
    const t = toolsByName[toolName]
    if (!t) {
      return NextResponse.json(
        { error: `Unknown tool: ${toolName}`, available: Object.keys(toolsByName) },
        { status: 400 }
      )
    }

    const result = await t.invoke(args, { context: { userId } })
    return NextResponse.json({
      tool: toolName,
      args,
      result: typeof result === "string" ? result : JSON.stringify(result),
      parsed: typeof result === "string" ? safeParse(result) : result,
    })
  } catch (err) {
    console.error("Debug tool error:", err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Tool invocation failed",
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: 500 }
    )
  }
}

function safeParse(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return s
  }
}
