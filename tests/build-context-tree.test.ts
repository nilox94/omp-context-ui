[tests/build-context-tree.test.ts#39FE]
1:import { describe, expect, it, mock } from "bun:test";
2:
3:mock.module("@oh-my-pi/pi-agent-core/compaction", () => ({
4:  estimateTokens: () => 12,
5:}));
6:
7:mock.module("@oh-my-pi/pi-natives", () => ({
8:  countTokens: (fragments: string[]) => fragments.join("").length,
9:}));
10:
11:mock.module("@oh-my-pi/pi-coding-agent/modes/utils/context-usage", () => ({
12:  computeContextBreakdown: (session: {
13:    model?: { contextWindow?: number };
14:  }) => ({
15-21:    categories: [ .. ],
22:    usedTokens: 150,
23:    contextWindow: session.model?.contextWindow ?? 200_000,
24:    autoCompactBufferTokens: 0,
25:    freeTokens: 199_850,
26:    model: session.model,
27:  }),
28:  estimateSkillsTokens: () => 5,
29:  estimateToolSchemaTokens: () => 8,
30:}));
31:
32:import { buildContextTree } from "../src/context-tree/build-context-tree";
33:
34:function makeSession(overrides: {
35:  systemPrompt?: string[];
36:  skills?: Array<{ name: string; description: string; filePath: string; baseDir: string; source: string }>;
37:  tools?: Array<{ name: string; description: string; parameters: Record<string, unknown> }>;
38:  messages?: Array<Record<string, unknown>>;
39:  contextWindow?: number;
40:}) {
41:  return {
42:    systemPrompt: overrides.systemPrompt ?? ["<system-conventions>rules</system-conventions>\n\nBase prompt"],
43:    skills: overrides.skills ?? [{ name: "tdd", description: "test first", filePath: "a", baseDir: "b", source: "c" }],
44-48:    agent: { .. },
49:    messages: overrides.messages ?? [],
50:    model: { contextWindow: overrides.contextWindow ?? 200_000 },
51-54:    settings: { .. },
55:  } as never;
56:}
57:
58:describe("buildContextTree", () => {
59-105:  it("produces five categories with system leaves and message blocks", () => { .. });
106:
107-119:  it("itemizes context files from project prompt blocks", () => { .. });
120:});

[66 lines elided; re-read needed ranges, e.g. /Users/nano/Projects/omp-context-ui/tests/build-context-tree.test.ts:15-21,44-48]