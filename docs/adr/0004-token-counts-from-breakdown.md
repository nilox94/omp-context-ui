# Token counts come from the breakdown and `estimateTokens`, not a fresh `countTokens` pass

Category and system-category leaf counts are taken from `computeContextBreakdown` (already computed by OMP). Message and Block counts are computed with `estimateTokens`. We do not run an exact `countTokens` pass anywhere — including the `/shake-ui` footer total and confirm dialog.

## Why

The tree is built as a snapshot at overlay open (see surfaces design) and must stay responsive on long sessions. `estimateTokens` is the fast heuristic OMP itself uses for live context math; an exact tokenizer pass over every block of a 200k-token session would lag the open. All counts are presented as approximate (`~Nk`) throughout — preview header, footer running total, and the post-shake toast — so estimate-level accuracy is honest and sufficient. Reusing the breakdown's category numbers also keeps `/context-ui` totals consistent with the data OMP already trusts.

## Consequences

- The footer selection total and confirm one-liner are estimates; the actual freed tokens reported by the shake commit may differ slightly. This is the same `~` contract `/shake` already presents.
- One number source per tree level (breakdown for categories, `estimateTokens` for messages/blocks) — no reconciliation between two tokenizers.
