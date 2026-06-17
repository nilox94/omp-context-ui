# Contributing to `omp-context-ui`

Thanks for helping improve the context inspector plugin for [oh-my-pi (OMP)](https://github.com/nilox94/oh-my-pi).

This package is an OMP extension — not a standalone app. Local development means linking the repo into your OMP installation and exercising it from an interactive OMP session.

## Project layout

| Path | Contents |
|------|----------|
| `src/context-tree/` | Pure logic: building/classifying the context tree and estimating tokens |
| `src/overlay/` | TUI rendering for the inspector overlay |
| `src/` (root) | Entry point, command registration, and session resolution |
| `tests/` | Bun unit tests mirroring the pure-logic modules |
| `docs/prd/`, `docs/adr/` | Product requirements and architecture decision records |

When making changes, follow these module boundaries: keep pure, testable logic in `context-tree/` and runtime/TUI concerns in `overlay/`.

## Prerequisites

- **Bun** `>=1.3.14` (matches OMP's runtime)
- **OMP v16.x** installed and on your `PATH` — this plugin targets `@oh-my-pi/pi-coding-agent` `>=16.0.0 <17.0.0`, so `omp --version` should report `16.x`

## Local development setup

Clone the repo and install dependencies:

```bash
git clone https://github.com/nilox94/omp-context-ui.git
cd omp-context-ui
bun install
```

Link the local checkout into OMP's plugin directory:

```bash
omp plugin link .
```

This creates a symlink at `~/.omp/plugins/node_modules/omp-context-ui` pointing at your working tree.

Verify the link:

```bash
omp plugin doctor
omp plugin list
```

You should see `omp-context-ui@<version>` listed and healthy.

## Running the plugin

Start OMP in **interactive TUI mode** from any project directory:

```bash
cd /path/to/some/project
omp
```

Then use the slash commands registered by the plugin:

| Command | Description |
|---------|-------------|
| `/context-ui` | Read-only context window inspector |

### Picking up code changes

Restart your OMP session after editing plugin code. There is no hot-reload for linked plugins in v1.

To refresh the link after pulling or switching branches:

```bash
omp plugin link .
```

## Development commands

```bash
# Run unit tests once
bun test

# Run tests in watch mode
bun run test:watch

# Typecheck
bun run check:types
```

## Code style

There is no separate linter or formatter; `tsc --noEmit` (`bun run check:types`) is the only static gate. Match the conventions of the surrounding code:

- Follow the existing module boundaries (`context-tree/` vs `overlay/`) and file-per-concern naming.

### Import paths use explicit `.js` extensions

Relative imports must include a `.js` extension even though the file on disk is `.ts`:

```ts
// correct — points at the emitted .js, the source is register-context-ui.ts
import { registerContextUiCommand } from "./register-context-ui.js";

// wrong — extensionless and ".ts" both fail under NodeNext resolution
import { registerContextUiCommand } from "./register-context-ui";
import { registerContextUiCommand } from "./register-context-ui.ts";
```

Why this is required here:

- `package.json` declares `"type": "module"`, so the package is **native ESM**, not CommonJS. Node's ESM loader does **not** do extension guessing — unlike CommonJS `require`, it will not try `.js`, `/index.js`, etc. The import specifier must name a real file, extension included.
- `tsconfig.json` uses `"module": "NodeNext"` / `"moduleResolution": "NodeNext"`, which enforces exactly these Node ESM rules at typecheck time. TypeScript deliberately does **not** rewrite import paths, so you write the path that will exist *after* compilation — i.e. the `.js` the `.ts` compiles to. (See the TypeScript [ESM/NodeNext docs](https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-nodenext).)
- `"verbatimModuleSyntax": true` and `"isolatedModules": true` mean each file is transpiled in isolation with its import/export syntax left as-written, so there is no whole-program pass that could fix up extensions for you.

Practical rules:

- New relative import → append `.js` to the path of the `.ts` (or `.tsx`) source you're importing.
- Importing a directory's `index.ts` → write `"./some-dir/index.js"`, not `"./some-dir"`.
- This applies only to **relative** (`./`, `../`) imports. Bare package specifiers like `@oh-my-pi/pi-coding-agent` are resolved by the package's own `exports`/`main` and take no extension.
- Type-only imports follow the same rule: `import type { Foo } from "./types.js";`.

If you get a runtime `ERR_MODULE_NOT_FOUND` or a `tsc` error like *"Relative import paths need explicit file extensions"*, a missing or `.ts` extension is almost always the cause.

## What to test where

**Automated:** pure logic is covered by Bun tests (`bun test`). Add or update tests when you change behavior that can be asserted without a live OMP session.

**Manual:** overlay rendering, slash commands, and session mutation must be exercised in an interactive OMP session — they depend on runtime surfaces that unit tests do not cover.

Suggested manual checklist:

1. Link the plugin (`omp plugin link .`)
2. Start `omp` in a project with an active session and some tool output
3. Run `/context-ui` — confirm the category rollup, preview pane, and footer render
4. Navigate with `↑/↓`, collapse/expand with `←/→`, close with `Esc`

## Troubleshooting

**Plugin not loading**

```bash
omp plugin doctor
```

Check OMP logs at `~/.omp/logs/` for module resolution errors.

**Commands missing in OMP**

- Confirm you are in interactive TUI mode (not `omp -p`)
- Confirm the plugin is linked: `omp plugin list`
- Restart the OMP session after code changes

**Version mismatch**

If OMP is outside the supported range (`>=16.0.0 <17.0.0`), runtime probes may fail with a clear error. Upgrade or downgrade OMP to a compatible v16 release.

## Scope and issues

Contributions that fit the plugin's purpose — inspecting and reclaiming context-window space — are welcome. Good places to help:

- Bug fixes for the `/context-ui` inspector (rendering, navigation, token estimation)
- The planned `/shake-ui` interactive selective-shake command
- Tests for pure logic in `src/context-tree/`

Before starting non-trivial work, open an issue describing the problem or proposal so we can align on approach. Out of scope: features that summarize or rewrite history (Compact) or automatically drop output (Prune) — this plugin only does recoverable Shake. See [`CONTEXT.md`](./CONTEXT.md) for these distinctions.

## Pull requests

1. Branch from `main`
2. Keep changes focused; follow existing module boundaries
3. Add or update unit tests for pure logic changes
4. Run `bun test` and `bun run check:types`
5. Note any manual testing you performed against a live OMP session

For domain terms (Category, Block, Region, Shake, etc.), see [`CONTEXT.md`](./CONTEXT.md). For product scope and architecture decisions, see [`docs/prd/`](./docs/prd/) and [`docs/adr/`](./docs/adr/).
