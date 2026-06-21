# Context Inspector

`omp-context-ui` is an oh-my-pi (OMP) plugin that lets a human inspect what occupies the model's context window — high level (where the budget goes) and low level (which exact piece is the hog) — and selectively reclaim space.

## Language

**Context window**:
The token budget sent to the model on the next request. The thing the inspector measures and the user tries to keep from overflowing.
_Avoid_: prompt size, buffer

**Category**:
A top-level division of the context window: System prompt, Context files, Tool schemas, Skills, Messages. The "high level" view.
_Avoid_: section, group

**Message**:
One entry in the conversation branch (user, assistant, or tool turn). The middle tier of the tree, under the Messages category.

**Block**:
A content-typed part of a Message — one of `thinking`, `text`, `tool-call`, `tool-result`, `image`, `custom` — each with its own token count. The "low level" leaf the user inspects and selects.
_Avoid_: chunk, segment, part

**Region**:
A span of message content that Shake can elide, represented as a `ShakeRegion` (a whole tool-result, or a fenced/XML span inside a text block). Produced by `collectShakeRegions`. A Block may map to one Region at commit time.
_Avoid_: range, selection

**Shake**:
Replacing a Region's content with a recoverable placeholder (`[shaken ~Nk tokens — recover: artifact://…]`) to reclaim context, without rewriting history via summarization. Distinct from Compact (LLM summary, lossy) and Prune (automatic drop of stale tool output).
_Avoid_: trim, compress, prune

**Force-shake**:
Shaking a Block the automatic detector (`collectShakeRegions`) did *not* return. The user opts in by checking it; a synthetic Region is built at commit. No eligibility guards.

**Preselection**:
The set of Regions checked when `/shake-ui` opens — the same Regions manual `/shake` would take (`AGGRESSIVE_SHAKE_CONFIG`).

**Tier**:
A token-weight band (normal / warning / purple / error) used to color a row. Thresholds are absolute and differ per Category.

## Relationships

- A **Category** contains zero or more **Messages** (Messages category) or itemized leaves (system categories).
- A **Message** contains one or more **Blocks**.
- A **Block** may correspond to one shakeable **Region**; **Force-shake** synthesizes a Region for a Block the detector skipped.
- A **Shake** elides one or more **Regions** and writes a recovery artifact.
- A **Tier** colors any row (Category, Message, Block, or leaf) by its token weight.

## Surfaces

- **`/context-ui`** — read-only explorer over the full tree (high + low level).
- **`/shake-ui`** — same tree, interactive selection of Regions/Blocks to Shake.
- Both coexist with the built-in **`/context`** (static glance) and **`/shake`** (instant elide-all).

## Example dialogue

> **Dev:** "When I open `/shake-ui` and check a 3k assistant **text** block the detector ignored, what gets removed?"
> **Domain expert:** "That's a **Force-shake**. We synthesize a **Region** covering that **Block** at commit and elide it like any other — no eligibility guard. It's recoverable from the **Shake** artifact, same as a preselected one."

## Flagged ambiguities

- "shake" vs "compact" vs "prune" — all reduce context, but only **Shake** is recoverable via artifact; **Compact** is an LLM summary; **Prune** is automatic. The plugin does only **Shake**.
- "block" vs "region" — a **Block** is a UI/tree concept (content-typed part of a Message); a **Region** is the shake-engine concept (`ShakeRegion`). They overlap but aren't identical: not every Block is shakeable, and a text Block may contain a sub-span Region.
- Block↔Region mapping at commit: a checked `text` Block elides as **one whole-span `BlockShakeRegion`** (prose + any fences, no sub-splitting); a checked `tool-result` Block elides as a whole-content `ToolResultShakeRegion`; preselected fenced/XML **Regions** from `collectShakeRegions` are their own leaf rows, not the `text` Block row.

