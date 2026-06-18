[src/context-tree/tree-navigator.ts#D4ED]
1:import type { ContextCategoryNode, ContextMessageNode, ContextTree } from "./types";
2:
3:export interface VisibleTreeRow {
4:  id: string;
5:  depth: number;
6:  label: string;
7:  tokens: number;
8:  hasChildren: boolean;
9:  expanded: boolean;
10:  parentId: string | null;
11:}
12:
13:export interface TreeNavigatorOptions {
14:  /** Category ids expanded on open. Defaults to every category except Messages. */
15:  expandCategoryIds?: string[];
16:}
17:
18:export class TreeNavigator {
19:  readonly #tree: ContextTree;
20:  readonly #expanded = new Set<string>();
21:  #selectedId: string | null;
22:
23-30:  constructor(tree: ContextTree, options: TreeNavigatorOptions = {}) { .. }
31:
32:  get selectedId(): string | null {
33:    return this.#selectedId;
34:  }
35:
36-71:  getVisibleRows(): VisibleTreeRow[] { .. }
72:
73:  #appendMessageRows(
74:    messages: readonly ContextMessageNode[],
75:    parentId: string,
76:    depth: number,
77:    rows: VisibleTreeRow[],
78-104:  ): void { .. }
105:
106-117:  moveSelection(delta: number): void { .. }
118:
119-123:  expandSelected(): void { .. }
124:
125-128:  collapseSelected(): void { .. }
129:
130-137:  back(): "parent" | "close" { .. }
138:}

[86 lines elided; re-read needed ranges, e.g. /Users/nano/Projects/omp-context-ui/src/context-tree/tree-navigator.ts:23-30,36-71]