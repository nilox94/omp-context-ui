# Two new commands that coexist with built-in `/context` and `/shake`

The plugin adds `/context-ui` (read-only explorer) and `/shake-ui` (interactive selective shake) rather than replacing or aliasing the built-in `/context` and `/shake`. The built-ins remain the fast, non-interactive paths; the `-ui` variants are the interactive overlays. They are registered only when `ctx.hasUI` is true (skipped entirely in print/RPC/headless modes).

## Considered Options

- **Make `/context` / `/shake` open the overlay** — fewer commands, but changes muscle-memory behavior and removes the quick text/panic paths.
- **Tabbed single command** — one mental model, but conflates inspect and surgery intents.
- **Coexist (chosen)** — explore vs glance, and selective-shake vs panic-shake, stay distinct intents sharing the same underlying machinery.

## Consequences

- Four context-related commands exist; discoverability relies on naming consistency (`-ui` suffix).
- No status-line or keybinding entry points in v1 — slash-only.
