[src/context-tree/classify-blocks.ts#5F61]
1:import { estimateMessageTokens } from "./estimate-message-tokens";
2:import type { BlockKind, ContextBlockNode } from "./types";
3:
4:export type ContextSessionMessage = {
5:  role: string;
6:  content?: unknown;
7:  customType?: string;
8:  toolName?: string;
9:};
10:
11:interface ContentBlock {
12:  type: string;
13:  text?: string;
14:  thinking?: string;
15:  name?: string;
16:}
17:
18:function estimateBlockTokens(message: ContextSessionMessage, blockIndex: number): number {
19:  const role = message.role;
20-25:  if (role === "assistant") { .. }
26:
27-32:  if (role === "toolResult") { .. }
33:
34-42:  if (role === "user" || role === "developer") { .. }
43:
44:  return blockIndex === 0 ? estimateMessageTokens(message) : 0;
45:}
46:
47-51:function blockLabel(blockType: BlockKind, toolName?: string): string { .. }
52:
53:function toBlockNode(
54:  message: ContextSessionMessage,
55:  messageIndex: number,
56:  blockIndex: number,
57:  blockType: BlockKind,
58:  toolName?: string,
59-67:): ContextBlockNode { .. }
68:
69-83:function classifyAssistantBlocks(message: ContextSessionMessage, messageIndex: number): ContextBlockNode[] { .. }
84:
85-97:function classifyUserLikeBlocks(message: ContextSessionMessage, messageIndex: number): ContextBlockNode[] { .. }
98:
99-123:export function classifyBlocks(message: ContextSessionMessage, messageIndex: number): ContextBlockNode[] { .. }

[72 lines elided; re-read needed ranges, e.g. /Users/nano/Projects/omp-context-ui/src/context-tree/classify-blocks.ts:20-25,27-32]