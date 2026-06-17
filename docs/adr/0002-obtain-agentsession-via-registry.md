# Obtain `AgentSession` via the global `AgentRegistry`

`ExtensionCommandContext` does not expose the `AgentSession`, but the breakdown helpers (`computeContextBreakdown` and full system-category itemization, imported from `@oh-my-pi/pi-coding-agent` subpaths) require one. The plugin obtains it from the process-global `AgentRegistry`, matching the session whose id equals `ctx.sessionManager.getSessionId()`.

## Considered Options

- **`sessionManager`-only reconstruction** — avoids internals but cannot faithfully itemize system-prompt sections; rejected (undershoots the itemized-system-categories requirement).
- **`AgentRegistry` + sessionId match** — chosen. Same mechanism OMP itself uses when it needs a session without an explicit reference; survives multi-session hosts (ACP/cmux).
- **`AgentRegistry.get("Main")`** — simpler but breaks when the main id differs or multiple mains exist.

## Consequences

- Couples the plugin to an undocumented registry shape and subpath exports; mitigated by a minor-locked peer range (`@oh-my-pi/pi-coding-agent` `>=16.0.0 <17.0.0`) plus runtime probes that fail loudly on a missing session or import.
- If the matched registry entry has no live `session` (e.g. parked), the command shows a clear error rather than proceeding.
