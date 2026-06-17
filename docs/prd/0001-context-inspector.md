# PRD: Context Inspector (`omp-context-ui`)

## Problem Statement

When I'm working in oh-my-pi (OMP), my context window fills up — sometimes mid-task — and I lose visibility into *why*. The built-in `/context` shows me a flat category rollup ("Messages: 142k") but it's a dead end: I can't drill from a heavy category down to the individual Message or Block that's actually eating the budget. When I want to reclaim space, `/shake` is all-or-nothing — it elides every eligible Region at once, with no way to *see* what it's about to remove or to keep the three tool results I still need. I'm left reading raw `/debug dump-next-request` JSON to understand my own context, and shaking blind.

## Solution

Two interactive TUI commands, backed by one shared tree.

- **`/context-ui`** — a read-only, full-screen overlay that lets me explore my context window top to bottom: Category → Message → Block. Every row is colored by token weight so the hogs jump out, and a preview pane shows what's actually inside any row I select.
- **`/shake-ui`** — the same tree, but interactive. The Regions that `/shake` would take are preselected; I can uncheck what I want to keep, force-check Blocks the detector skipped, see a running token total, confirm, and reclaim space — with recovery artifacts so nothing is truly lost.

Both coexist with the existing `/context` (quick static glance) and `/shake` (instant elide-all). The plugin ships as a standalone npm package (`omp-context-ui`) installed via `omp plugin install omp-context-ui`, and makes **no changes to any `@oh-my-pi` library**.

## User Stories

1. As an OMP user, I want to open an interactive context inspector with `/context-ui`, so that I can understand what occupies my context window without reading raw request dumps.
2. As an OMP user, I want the inspector to show a Category rollup (System prompt, Context files, Tool schemas, Skills, Messages), so that I get the high-level view of where my budget goes.
3. As an OMP user, I want to drill from a Category into individual Messages, so that I can find which turn is heavy.
4. As an OMP user, I want to drill from a Message into its content-typed Blocks (`thinking`, `text`, `tool-call`, `tool-result`, `image`, `custom`), so that I can pinpoint the exact piece that is the hog.
5. As an OMP user, I want each `tool-result` Block labeled with its tool name (e.g. `tool-result · grep`), so that I can identify which call produced a heavy output without manually pairing it.
6. As an OMP user, I want system Categories (System prompt, Context files, Tool schemas, Skills) itemized into their constituent leaves (per file, per tool, per skill, per prompt section), so that I can see, for example, that one MCP tool schema is 8k while another is 400 tokens.
7. As an OMP user, I want every row colored by an absolute token-weight Tier (normal / warning / purple / error), so that heavy items are visually obvious.
8. As an OMP user, I want the Tier thresholds to differ per Category, so that an 8k tool schema reads as normal while an 8k context file reads as alarming.
9. As an OMP user, I want a preview pane showing the selected row's content (truncated) plus a stats header (`tokens · chars · label`), so that I can decide whether a Block matters before acting on it.
10. As an OMP user, I want a persistent footer showing total context usage and key hints, so that I always know my overall position while navigating.
11. As an OMP user, I want to navigate the tree with arrow keys (`↑/↓` move, `←/→` collapse/expand) and close with `Esc`, so that the controls match other OMP overlays.
12. As an OMP user, I want `/context-ui` to open with all Categories expanded (Messages/Blocks collapsed), so that I immediately see the high-level breakdown and itemized system leaves.
13. As an OMP user, I want `/context-ui` to be read-only, so that exploring my context can never accidentally mutate it.
14. As an OMP user, I want to open `/context-ui` even while the agent is streaming, so that I can watch why context is ballooning mid-turn.
15. As an OMP user, I want the tree to be a snapshot taken when the overlay opens, so that numbers stay stable while I browse.
16. As an OMP user, I want a separate `/shake-ui` command for interactive shaking, so that inspection and surgery are distinct intents.
17. As an OMP user, I want `/shake-ui` to preselect exactly the Regions that manual `/shake` would take (aggressive config), so that the default action matches the panic-button behavior I already know.
18. As an OMP user, I want `/shake-ui` to open with the Messages Category expanded and any Message containing preselected Regions auto-expanded, so that I can see what's checked without drilling manually.
19. As an OMP user, I want `/shake-ui` rows sorted by token weight (heaviest first), so that the biggest hogs are at the top where the preselection already has them checked.
20. As an OMP user, I want `/context-ui` rows sorted chronologically, so that exploration follows the flow of the conversation.
21. As an OMP user, I want to toggle a Block's checkbox with `Space` in `/shake-ui`, so that I can refine the selection.
22. As an OMP user, I want to uncheck preselected Regions, so that I can keep tool results I still need.
23. As an OMP user, I want to force-check a `text` or `tool-result` Block the detector did *not* preselect, so that I can reclaim space the automatic heuristic missed.
24. As an OMP user, I want force-shake to apply with no eligibility guards, so that what I check is what gets removed — the UI is the only gate.
25. As an OMP user, I want checking a Message row to cascade its checkbox to all checkable child Blocks (and show an indeterminate state when only some are checked), so that I can keep or drop a whole turn quickly.
26. As an OMP user, I want force-shaking a `text` Block to elide the *entire* Block (prose and any fenced spans), so that the behavior is predictable — checking a Block removes that Block.
27. As an OMP user, I want preselected fenced/XML Regions to appear as their own rows (distinct from the whole-Block force-shake target), so that precise detector spans and whole-Block selections don't get conflated.
28. As an OMP user, I want a running token total of my current selection in the footer, so that I know how much I'll reclaim before committing.
29. As an OMP user, I want a one-line confirm prompt before any shake commits (`Shake N regions (~Xk tokens)? [Enter]/[Esc]`), so that I don't reclaim space by accident given the aggressive defaults.
30. As an OMP user, I want the overlay to close immediately after I confirm a shake, so that the action feels decisive like `/shake`.
31. As an OMP user, I want a post-shake status toast that includes the recovery artifact reference, so that I know how to recover what I removed.
32. As an OMP user, I want shaken content replaced with a recoverable placeholder backed by an artifact holding the original text, so that no shake is truly destructive.
33. As an OMP user, I want `/shake-ui` to refuse to open while the agent is streaming (and to block confirm if a turn starts while it's open), so that shaking never races with an active turn.
34. As an OMP user running in print/RPC/headless mode, I want `/context-ui` and `/shake-ui` to simply not appear, so that I'm not offered commands that require a TUI.
35. As an OMP user, I want the inspector to operate on my main session only, so that the scope is clear and matches the status-line gauge.
36. As an OMP plugin user, I want to install the inspector via `omp plugin install omp-context-ui`, so that I can add it without modifying my OMP installation.
37. As an OMP plugin user, I want a clear error if my OMP version is incompatible, so that I'm not left with a silently broken command.
38. As a developer, I want the plugin to make no changes to any `@oh-my-pi` library, so that it stays a pure userland add-on.
39. As an OMP user, I want token counts on system Categories sourced from the same breakdown OMP already computes, so that the high-level numbers match `/context`.
40. As an OMP user, I want the inspector to handle long sessions without lag on open, so that it stays usable when my context is large.

## Implementation Decisions

**Packaging & distribution**
- Standalone publishable npm package `omp-context-ui`; install via `omp plugin install omp-context-ui`. Manifest declares `omp.extensions`.
- Dependency model: packages OMP already ships (`@oh-my-pi/*`) go in `peerDependencies`; everything else goes in `dependencies`/`devDependencies` as needed. No second copy of OMP packages bundled.
- `peerDependencies` range is minor-locked (`>=16.0.0 <17.0.0`); a new OMP major requires a new plugin release. Runtime probes verify the undocumented surfaces (`rewriteEntries`, subpath imports) on load and emit a clear error if missing.
- No changes to any `@oh-my-pi` library (ADR-0001).

**Surfaces**
- Two slash commands, `/context-ui` (read-only explore) and `/shake-ui` (interactive select + shake), registered only when `ctx.hasUI` is true. They coexist with built-in `/context` and `/shake` (ADR-0003).
- Slash-command entry only — no status-line hooks or default keybindings in v1.
- Both commands operate on the **main session only**.

**Data sourcing**
- The host `AgentSession` is obtained via `AgentRegistry.global()`, matching the ref whose session id equals `ctx.sessionManager.getSessionId()` (ADR-0002). A null session (parked) produces a clear error.
- System Categories and their itemized leaves come from OMP's own breakdown helper imported via package subpaths (Q32); Message and Block token counts use `estimateTokens` (ADR-0004). All counts are presented as approximate (`~`).
- Tree is a **snapshot at open**; no live refresh in v1.

**Tree model**
- Hierarchy: Category → Message → Block. System Categories itemize to leaves but stop there (two-level cap); Messages drill to content-typed Blocks.
- Blocks are content-typed: `thinking`, `text`, `tool-call`, `tool-result`, `image`, `custom`. `tool-call` and `tool-result` stay as separate Blocks in transcript order; `tool-result` rows are annotated with the tool name.
- Tier coloring uses absolute, per-Category thresholds (hardcoded table). `/context-ui` sorts chronologically; `/shake-ui` sorts by token weight.

**Selection & shake (`/shake-ui`)**
- Preselection = Regions from `collectShakeRegions` under `AGGRESSIVE_SHAKE_CONFIG`.
- All `tool-result` and `text` Blocks are checkable; preselected fenced/XML Regions appear as their own rows. Message rows cascade to children with an indeterminate state for partial selection.
- Force-shake has no eligibility guards. A checked `text` Block elides the whole Block; a checked `tool-result` Block elides the whole result. System Categories are view-only.
- At commit, selected Blocks/Regions are mapped to `ShakeRegion`s by block-native synthesis (whole-block `BlockShakeRegion` for text, `ToolResultShakeRegion` for tool results; preselected fenced Regions pass through).

**Commit pipeline**
- For each selected Region: persist its `originalText` to a plugin-owned recovery artifact; build a plugin-owned placeholder (`[shaken ~Nk tokens · omp-context-ui]`); call `applyShakeRegions`; then cast the session manager to invoke `rewriteEntries()` and call `ctx.reload()` to resync the agent/transcript view (ADR-0005, ADR-0002).
- Recovery is plugin-owned and `originalText`-backed; it does not replicate `/shake`'s placeholder byte-format or `(region N)` indexing (ADR-0005).

**Module sketch** (deep modules favored for isolation)
- `buildContextTree(session) → ContextTree` — assembles Categories → Messages → Blocks with token estimates. Deep.
- `classifyBlocks(message) → Block[]` — splits a Message into content-typed, labeled Blocks. Deep, pure.
- `tierForRow(category, tokens) → Tier` — per-Category absolute threshold lookup. Deep, pure.
- `synthesizeRegions(selectedBlocks, preselectedRegions) → ShakeRegion[]` — maps tree selection to `ShakeRegion`s. Deep, pure.
- `SelectionModel` — cascade/indeterminate checkbox state machine over the tree. Deep, pure.
- `commitShake(session, regions) → ShakeOutcome` — artifact + placeholder + `applyShakeRegions` + `rewriteEntries` + `reload`. Thin orchestration over a session double.
- `resolveMainSession(ctx) → AgentSession` — registry sessionId match. Thin.
- Overlay component — renders tree + preview + footer, handles keys. Shallow/integration.

**Overlay layout & controls**
- Three-pane: left tree, right preview (truncated content + stats header), bottom footer (context %, selection total in shake mode, key hints).
- Keys: `↑/↓` move, `←/→` collapse/expand, `Space` toggle (shake mode, checkable rows), `Enter` confirm (shake) / noop (explore), `Esc` back/close.

## Testing Decisions

- **What makes a good test here:** assert *external behavior* of the pure deep modules — given an input session/branch/message, assert the produced tree shape, block classification, tier assignment, synthesized regions, or selection state. Do not assert internal representation or TUI rendering details. Tests should not require a live TUI, a real provider, or a streaming agent.
- **Modules to be tested (the five pure deep modules):**
  - `buildContextTree` — feed a fabricated session/branch; assert Categories, Message/Block nesting, per-row token estimates, and `tool-result` labeling.
  - `classifyBlocks` — feed messages with mixed content; assert each Block's type, label, and token estimate; assert `tool-call`/`tool-result` remain separate and ordered.
  - `tierForRow` — table-driven cases across every Category and every threshold boundary.
  - `synthesizeRegions` — assert whole-block `BlockShakeRegion` for force-checked text, `ToolResultShakeRegion` for tool results, and pass-through of preselected fenced Regions.
  - `SelectionModel` — cascade down on parent toggle, indeterminate on partial children, force-check of non-preselected Blocks.
- **Out of automated testing:** the overlay component, `commitShake`'s session mutation/`rewriteEntries`/`reload`, and `resolveMainSession` are verified by manual/integration testing against a live OMP session, since they depend on undocumented runtime surfaces.
- **Prior art:** mirror the pure-function test style used by OMP's own compaction modules (`collectShakeRegions`/`applyShakeRegions` are pure detection/mutation with isolated tests) — same shape applies to our tree/selection/synthesis logic.

## Out of Scope

- Agent-callable context inspection tool (the inspector is human-TUI only in v1).
- Inspecting or shaking **subagent** context — use Agent Hub / `history://` for those.
- Mutating system Categories (System prompt, Context files, Tool schemas, Skills) — view-only.
- LLM-based **Compact**, automatic **Prune** triggers, and **handoff**-with-selection from the overlay.
- Status-line click/hotkey entry points and default keybindings.
- Jump-to-transcript / copy-reference navigation from `/context-ui`.
- Live/periodic/manual tree refresh while the overlay is open (snapshot only).
- Text fallback for non-interactive (print/RPC/headless) modes — commands simply don't register.
- Byte-for-byte parity with `/shake`'s placeholder and artifact format.
- Syntax highlighting and full (non-truncated) scrolling in the preview pane.
- Bulk selection toggles (select all / none / invert) and tree search/filter.

## Further Notes

- Domain vocabulary (Category, Message, Block, Region, Shake, Force-shake, Preselection, Tier) is defined in `CONTEXT.md` and used throughout.
- Decisions with lasting, surprising, hard-to-reverse trade-offs are recorded as ADRs: 0001 (no `@oh-my-pi` lib changes), 0002 (`AgentSession` via `AgentRegistry`), 0003 (two commands coexist with built-ins), 0004 (token counts from breakdown), 0005 (plugin-owned recovery artifact).
- Key fragility to monitor: the commit pipeline relies on the undocumented `rewriteEntries` and on subpath imports of OMP internals; both are guarded by runtime probes and the minor-locked peer range.
- Natural follow-ups (v1.1+): category-level "shake all eligible," manual prune triggers, compact-to-here, subagent inspection, and a status-line entry point.
