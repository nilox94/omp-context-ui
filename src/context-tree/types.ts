export type CategoryId =
	| "systemPrompt"
	| "systemContext"
	| "systemTools"
	| "skills"
	| "messages";

export type BlockKind =
	| "thinking"
	| "text"
	| "tool-call"
	| "tool-result"
	| "image"
	| "custom";

export interface ContextBlockNode {
	kind: "block";
	id: string;
	blockType: BlockKind;
	label: string;
	tokens: number;
}

export interface ContextMessageNode {
	kind: "message";
	id: string;
	label: string;
	tokens: number;
	blocks: ContextBlockNode[];
}

export interface ContextLeafNode {
	kind: "leaf";
	id: string;
	label: string;
	tokens: number;
}

export interface ContextCategoryNode {
	kind: "category";
	id: CategoryId;
	label: string;
	tokens: number;
	children: ContextMessageNode[] | ContextLeafNode[];
}

export interface ContextTree {
	categories: ContextCategoryNode[];
	usedTokens: number;
	contextWindow: number;
}

export type ContextTreeNode =
	| ContextCategoryNode
	| ContextMessageNode
	| ContextBlockNode
	| ContextLeafNode;
