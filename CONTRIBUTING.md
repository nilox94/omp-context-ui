# Contributing to `omp-context-ui`

## Project layout

```
docs/
  adr/            Architecture decision records
  prd/            Product requirements
src/
  context-tree/   Pure logic: build/classify the tree, estimate tokens
  overlay/        TUI rendering for the inspector overlay
  *.ts            Entry point, command registration, session resolution
tests/            Unit tests mirroring the pure-logic modules
```

Keep pure, testable logic in `context-tree/` and runtime/TUI concerns in `overlay/`.

## Setup

```bash
git clone https://github.com/nilox94/omp-context-ui.git
cd omp-context-ui
bun install
omp plugin link .   # symlinks the checkout into ~/.omp/plugins/node_modules
omp plugin doctor   # verify the link is healthy
```

There is no hot-reload: restart your OMP session after editing plugin code, and re-run `omp plugin link .` after switching branches.

## Commands

```bash
bun run check         # lint + format + typecheck (CI gate)
bun test              # run unit tests
bun run test:watch    # tests in watch mode
bun run fix           # auto-fix lint/format issues
```

## Code style

Match the surrounding code; follow the `context-tree/` vs `overlay/` boundaries and file-per-concern naming.

Use **relative `./` imports** within the same folder; use **`@/`** for cross-module imports (configured in `package.json` `imports` and `tsconfig.json` `paths`):

```ts
// same folder (context-tree/)
import { classifyBlocks } from "./classify-blocks";

// cross-module (overlay → context-tree)
import { buildContextTree } from "@/context-tree/build-context-tree";
```

Prefer **package-root imports** from `@oh-my-pi/*` when types are re-exported there; use subpaths only when needed (e.g. `registry/agent-registry`, `modes/utils/context-usage`):

```ts
import type { AgentSession, ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import type { Component } from "@oh-my-pi/pi-tui";
```

Formatting is **Biome** (`biome.json`): tabs, double quotes, semicolons always.
Run `bun run fmt` or `bun run fix` before committing.

**Zed:** `.zed/settings.json` routes format-on-save through `bun x biome format`, matching `bun fmt`.
If formatting still looks wrong, check user-level Zed settings for a TypeScript formatter override.

**VS Code / Cursor:** install the Biome extension; `.vscode/settings.json` sets it as the default formatter.

## Testing

Pure logic is covered by unit tests — add or update them for any behavior assertable without a live session.
Overlay rendering, slash commands, and session mutation depend on runtime surfaces unit tests don't cover, so verify them manually:

1. Link the plugin and start `omp` in a project with an active session and some tool output
2. Run `/context-ui` — confirm the category rollup, preview pane, and footer render
3. Navigate with `↑/↓`, collapse/expand with `←/→`, close with `Esc`

## Scope

This plugin only does recoverable **Shake** (eliding content with a recovery artifact).
Summarizing/rewriting history (Compact) and auto-dropping output (Prune) are out of scope.
See [`CONTEXT.md`](./CONTEXT.md) for these terms.

Before non-trivial work, open an issue to align on approach.

## Pull requests

1. Branch from `main`; keep changes focused and within existing module boundaries
2. Add or update unit tests for pure-logic changes
3. Run `bun run check` and `bun test`
4. Note any manual testing performed against a live OMP session

For domain terms see [`CONTEXT.md`](./CONTEXT.md); for architecture decisions see [`docs/adr/`](./docs/adr/).
