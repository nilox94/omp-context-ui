# Selective shake lives in the plugin, not in `@oh-my-pi`

We will not modify any `@oh-my-pi` package. Selective `/shake-ui` is composed entirely in plugin code from public-ish exports: `collectShakeRegions` / `applyShakeRegions` (`@oh-my-pi/pi-agent-core/compaction`), `countTokens` (`@oh-my-pi/pi-natives`), and the session's `saveArtifact`. The persistence tail that built-in `/shake` runs privately (`rewriteEntries` → replay) is reproduced in the plugin by casting the read-only `sessionManager` to call `rewriteEntries()` and then calling `ctx.reload()`.

## Considered Options

- **Add `session.shakeRegions(regions)` upstream** — cleanest contract, but requires an `@oh-my-pi` change; rejected by the no-lib-changes constraint.
- **Userland mutate + cast + reload** — chosen. Keeps the plugin self-contained and shippable as a standalone npm package.

## Consequences

- Depends on an undocumented `rewriteEntries` on the runtime session object. A startup runtime probe (`typeof sm.rewriteEntries === "function"`) guards it with a clear error.
- Token counts shown are estimates (`~Nk`), never presented as exact post-shake window state, because estimates diverge from provider usage.
- Shake remains recoverable via `artifact://`; we deliberately do not implement Compact or Prune from the overlay.
