[docs/adr/0002-obtain-agentsession-via-registry.md#0AD1]
1:# Obtain context data via `ExtensionCommandContext`, not `AgentRegistry`
2:
3:## Status
4:
5:Accepted (revised)
6:
7:## Context
8:
9:`ExtensionCommandContext` does not expose `AgentSession`, but tree construction needs system prompt parts, messages, tools/skills metadata, and token breakdown — the same inputs OMP's `/context` uses via `runtime.ctx.session`.
10:
11:`AgentRegistry` + `sessionId` matching was the first approach (ADR v1). With `omp plugin link .`, static imports of `@oh-my-pi/pi-coding-agent/registry/agent-registry` can still resolve to a **second** `AgentRegistry` class in the plugin's `node_modules`, so `global().list()` stays empty even while `/context` works.
12:
13:## Decision
14:
15:Build the inspector snapshot from **`ExtensionCommandContext`**:
16:
17:- `ctx.getSystemPrompt()` — effective system prompt blocks (same source `/context` uses)
18:- `ctx.sessionManager.getBranch()` — message entries on the active branch
19:- `ctx.model` — context window for breakdown
20:
21:No `AgentRegistry` lookup is required to open `/context-ui`.
22:
23:## Consequences
24:
25:- `/context-ui` opens whenever `/context` can show usage (same host session bindings).
26:- Skill/tool leaf detail may be sparser than a full `AgentSession` until we add optional enrichment; category totals still come from `computeContextBreakdown` on the adapted source.
- `computeContextBreakdown` expects `session.settings`; the adapter supplies a disabled-compaction stub so breakdown works without a real `AgentSession`.
- Footer totals prefer `ctx.getContextUsage()` when available (matches `/context`); tree category estimates may still differ slightly.
27:- Future shake/commit paths that mutate the session may still need a live `AgentSession`; revisit when implementing shake-ui.
28: