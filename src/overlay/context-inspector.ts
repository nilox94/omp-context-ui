[src/overlay/context-inspector.ts#4D93]
1:import type { ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";
2:import type { Theme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
3:import type { AgentSession } from "@oh-my-pi/pi-coding-agent/session/agent-session";
4:import type { Component } from "@oh-my-pi/pi-tui/tui";
5:import { buildContextTree } from "../context-tree/build-context-tree";
6:import { formatVisibleTreeRow } from "../context-tree/format-tree-row";
7:import { TreeNavigator } from "../context-tree/tree-navigator";
8:import type { ContextTree } from "../context-tree/types";
9:import { formatContextFooter } from "./category-rollup";
10:import { renderContextInspectorLayout } from "./layout";
11:import { resolveMainSession } from "../resolve-main-session";
12:
13:function matchesArrow(data: string, direction: "left" | "right"): boolean {
14:  return data === (direction === "left" ? "\x1b[D" : "\x1b[C")
15:    || data === (direction === "left" ? "\x1b[OD" : "\x1b[OC");
16:}
17:
18:interface OverlayKeybindings {
19:  matches(data: string, keybinding: string): boolean;
20:}
21:
22:export interface ContextInspectorSnapshot {
23:  tree: ContextTree;
24:  usedTokens: number;
25:  contextWindow: number;
26:}
27:
28:export function buildContextInspectorSnapshot(session: AgentSession): ContextInspectorSnapshot {
29:  const tree = buildContextTree(session);
30-34:  return { .. };
35:}
36:
37:export function createContextInspectorOverlay(
38:  theme: Theme,
39:  keybindings: OverlayKeybindings,
40:  done: (result: undefined) => void,
41:  snapshot: ContextInspectorSnapshot,
42:): Component {
43:  const navigator = new TreeNavigator(snapshot.tree);
44:
45-52:  const buildPreviewLines = (treeLineCount: number): string[] => { .. };
53:
54-100:  return { .. };
101:}
102:
103-118:export async function openContextInspectorOverlay(ctx: ExtensionCommandContext): Promise<void> { .. }

[68 lines elided; re-read needed ranges, e.g. /Users/nano/Projects/omp-context-ui/src/overlay/context-inspector.ts:30-34,45-52]