[/Users/nano/Projects/omp-context-ui/CONTEXT.md#C87D]
1:# Context Inspector
2:
3:`omp-context-ui` is an oh-my-pi (OMP) plugin that lets a human inspect what occupies the model's context window — high level (where the budget goes) and low level (which exact piece is the hog) — and selectively reclaim space.
4:
5:## Language
6:
7:**Context window**:
8:The token budget sent to the model on the next request. The thing the inspector measures and the user tries to keep from overflowing.
9:_Avoid_: prompt size, buffer
10:
11:**Category**:
12:A top-level division of the context window: System prompt, Context files, Tool schemas, Skills, Messages. The "high level" view.
13:_Avoid_: section, group
14:
15:**Message**:
16:One entry in the conversation branch (user, assistant, or tool turn). The middle tier of the tree, under the Messages category.
17:
18:**Block**:
19:A content-typed part of a Message — one of `thinking`, `text`, `tool-call`, `tool-result`, `image`, `custom` — each with its own token count. The "low level" leaf the user inspects and selects.
20:_Avoid_: chunk, segment, part
21:
22:**Region**:
23:A span of message content that Shake can elide, represented as a `ShakeRegion` (a whole tool-result, or a fenced/XML span inside a text block). Produced by `collectShakeRegions`. A Block may map to one Region at commit time.
24:_Avoid_: range, selection
25:
26:**Shake**:
27:Replacing a Region's content with a recoverable placeholder (`[shaken ~Nk tokens — recover: artifact://…]`) to reclaim context, without rewriting history via summarization. Distinct from Compact (LLM summary, lossy) and Prune (automatic drop of stale tool output).
28:_Avoid_: trim, compress, prune
29:
30:**Force-shake**:
31:Shaking a Block the automatic detector (`collectShakeRegions`) did *not* return. The user opts in by checking it; a synthetic Region is built at commit. No eligibility guards.
32:
33:**Preselection**:
34:The set of Regions checked when `/shake-ui` opens — the same Regions manual `/shake` would take (`AGGRESSIVE_SHAKE_CONFIG`).
35:
36:**Tier**:
37:A token-weight band (normal / warning / purple / error) used to color a row. Thresholds are absolute and differ per Category.
38:
39:## Relationships
40:
41:- A **Category** contains zero or more **Messages** (Messages category) or itemized leaves (system categories).
42:- A **Message** contains one or more **Blocks**.
43:- A **Block** may correspond to one shakeable **Region**; **Force-shake** synthesizes a Region for a Block the detector skipped.
44:- A **Shake** elides one or more **Regions** and writes a recovery artifact.
45:- A **Tier** colors any row (Category, Message, Block, or leaf) by its token weight.
46:
47:## Surfaces
48:
49:- **`/context-ui`** — read-only explorer over the full tree (high + low level).
50:- **`/shake-ui`** — same tree, interactive selection of Regions/Blocks to Shake.
51:- Both coexist with the built-in **`/context`** (static glance) and **`/shake`** (instant elide-all).
52:
53:## Example dialogue
54:
55:> **Dev:** "When I open `/shake-ui` and check a 3k assistant **text** block the detector ignored, what gets removed?"
56:> **Domain expert:** "That's a **Force-shake**. We synthesize a **Region** covering that **Block** at commit and elide it like any other — no eligibility guard. It's recoverable from the **Shake** artifact, same as a preselected one."
57:
58:## Flagged ambiguities
59:
60:- "shake" vs "compact" vs "prune" — all reduce context, but only **Shake** is recoverable via artifact; **Compact** is an LLM summary; **Prune** is automatic. The plugin does only **Shake**.
61:- "block" vs "region" — a **Block** is a UI/tree concept (content-typed part of a Message); a **Region** is the shake-engine concept (`ShakeRegion`). They overlap but aren't identical: not every Block is shakeable, and a text Block may contain a sub-span Region.
- Block↔Region mapping at commit: a checked `text` Block elides as **one whole-span `BlockShakeRegion`** (prose + any fences, no sub-splitting); a checked `tool-result` Block elides as a whole-content `ToolResultShakeRegion`; preselected fenced/XML **Regions** from `collectShakeRegions` are their own leaf rows, not the `text` Block row.
62: