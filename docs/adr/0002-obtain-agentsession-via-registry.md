# Obtain context data via `ExtensionCommandContext`, not `AgentRegistry`

## Status

Accepted (revised)

## Context

`ExtensionCommandContext` does not expose `AgentSession`, but tree construction needs system prompt parts, messages, tools/skills metadata, and token breakdown — the same inputs OMP's `/context` uses via `runtime.ctx.session`.

`AgentRegistry` + `sessionId` matching was the first approach (ADR v1). With `omp plugin link .`, static imports of `@oh-my-pi/pi-coding-agent/registry/agent-registry` can still resolve to a **second** `AgentRegistry` class in the plugin's `node_modules`, so `global().list()` stays empty even while `/context` works.

## Decision

Build the inspector snapshot from **`ExtensionCommandContext`**:

- `ctx.getSystemPrompt()` — effective system prompt blocks (same source `/context` uses)
- `ctx.sessionManager.getBranch()` — message entries on the active branch
- `ctx.model` — context window for breakdown

No `AgentRegistry` lookup is required to open `/context-ui`.

## Consequences

- `/context-ui` opens whenever `/context` can show usage (same host session bindings).
- Skill/tool leaf detail may be sparser than a full `AgentSession` until we add optional enrichment; category totals still come from `computeContextBreakdown` on the adapted source.
- `computeContextBreakdown` expects `session.settings`; the adapter supplies a disabled-compaction stub so breakdown works without a real `AgentSession`.
- Footer totals prefer `ctx.getContextUsage()` when available (matches `/context`); tree category estimates may still differ slightly.
- Future shake/commit paths that mutate the session may still need a live `AgentSession`; revisit when implementing shake-ui.

