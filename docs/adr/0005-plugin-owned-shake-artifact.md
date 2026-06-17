# `/shake-ui` uses a plugin-owned recovery artifact, not `/shake`'s format

`applyShakeRegions` from `@oh-my-pi/pi-agent-core/compaction` is a pure
in-place mutation that takes a caller-supplied `replacement` string and
returns `void`. Artifact offload, placeholder text, and persistence live in
`AgentSession.shake`'s private orchestration, which the plugin cannot import
(ADR-0001: no `@oh-my-pi` changes).

We therefore define a plugin-owned recovery contract rather than mimicking
`/shake` byte-for-byte:

- Placeholder text: `[shaken ~Nk tokens · omp-context-ui]`
- Artifact: a plugin-owned doc holding each shaken Region's `originalText`,
  recoverable by opening the artifact directly.

We deliberately do NOT replicate `/shake`'s `(region N)` indexing or its
placeholder byte-format.

## Considered Options

- **Mimic `/shake`**: reverse-engineer its placeholder + artifact shape for
  indistinguishable recovery. Rejected — brittle to upstream format changes,
  and the format is private/unexported.
- **Own structured format**: richer plugin doc (per-region metadata). Heavier
  than needed; `originalText` is all recovery requires.
- **Minimal, `originalText`-backed** (chosen): simplest recoverable contract.

## Consequences

- Recovery from a `/shake-ui` elision will not look identical to a `/shake`
  elision — a reader who expects parity will be surprised. This is intentional.
- If OMP ever exports a public selective-shake API, revisit and prefer it.
