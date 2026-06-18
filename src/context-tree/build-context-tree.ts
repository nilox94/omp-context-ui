[src/context-tree/build-context-tree.ts#D6C4]
1:import { estimateMessageTokens } from "./estimate-message-tokens";
2:import { countTokens } from "@oh-my-pi/pi-natives";
3:import {
4:  computeContextBreakdown,
5:  estimateSkillsTokens,
6:  estimateToolSchemaTokens,
7:} from "@oh-my-pi/pi-coding-agent/modes/utils/context-usage";
8:import type { AgentSession } from "@oh-my-pi/pi-coding-agent/session/agent-session";
9:import type { Skill } from "@oh-my-pi/pi-coding-agent/extensibility/skills";
10:import { classifyBlocks, type ContextSessionMessage } from "./classify-blocks";
11:import type {
12:  CategoryId,
13:  ContextCategoryNode,
14:  ContextLeafNode,
15:  ContextMessageNode,
16:  ContextTree,
17:} from "./types";
18:
19:const EMPTY_TOOLS: ReadonlyArray<{ name: string; description: string; parameters: unknown }> = [];
20:
21:interface PromptSection {
22:  label: string;
23:  text: string;
24:}
25:
26-51:function itemizePromptSections(text: string): PromptSection[] { .. }
52:
53-76:function itemizeContextLeaves(parts: readonly string[]): PromptSection[] { .. }
77:
78-85:function buildLeafNodes(categoryId: CategoryId, sections: PromptSection[]): ContextLeafNode[] { .. }
86:
87-100:function messageLabel(message: ContextSessionMessage, index: number): string { .. }
101:
102-114:function buildMessageNodes(messages: readonly ContextSessionMessage[]): ContextMessageNode[] { .. }
115:
116-130:function buildSystemPromptLeaves(systemPromptParts: readonly string[], skills: readonly Skill[]): ContextLeafNode[] { .. }
131:
132-139:function buildToolLeaves(tools: ReadonlyArray<{ name: string; description: string; parameters: unknown }>): ContextLeafNode[] { .. }
140:
141-148:function buildSkillLeaves(skills: readonly Skill[]): ContextLeafNode[] { .. }
149:
150-189:export function buildContextTree(session: AgentSession): ContextTree { .. }

[138 lines elided; re-read needed ranges, e.g. /Users/nano/Projects/omp-context-ui/src/context-tree/build-context-tree.ts:26-51,53-76]