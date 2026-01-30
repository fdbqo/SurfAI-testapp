export type AgentTraceStep =
  | { kind: "reasoning"; content: string }
  | { kind: "tool"; name: string; args: Record<string, unknown>; result: string }
