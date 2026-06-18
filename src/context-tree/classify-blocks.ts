import { estimateMessageTokens } from "./estimate-message-tokens";
import type { BlockKind, ContextBlockNode } from "./types";

export type ContextSessionMessage = {
	role: string;
	content?: unknown;
	customType?: string;
	toolName?: string;
};

interface ContentBlock {
	type: string;
	text?: string;
	thinking?: string;
	name?: string;
}

function estimateBlockTokens(
	message: ContextSessionMessage,
	blockIndex: number,
): number {
	const role = message.role;
	if (role === "assistant") {
		const content = message.content as ContentBlock[] | undefined;
		const block = content?.[blockIndex];
		if (!block) return 0;
		return estimateMessageTokens({ ...message, content: [block] });
	}

	if (role === "toolResult") {
		const content = message.content as ContentBlock[] | undefined;
		const block = content?.[blockIndex];
		if (!block) return 0;
		return estimateMessageTokens({ ...message, content: [block] });
	}

	if (role === "user" || role === "developer") {
		const content = message.content;
		if (typeof content === "string") {
			return blockIndex === 0 ? estimateMessageTokens(message) : 0;
		}
		const block = (content as ContentBlock[] | undefined)?.[blockIndex];
		if (!block) return 0;
		return estimateMessageTokens({ ...message, content: [block] });
	}

	return blockIndex === 0 ? estimateMessageTokens(message) : 0;
}

function blockLabel(blockType: BlockKind, toolName?: string): string {
	if (blockType === "tool-call" && toolName) return `tool-call · ${toolName}`;
	if (blockType === "tool-result" && toolName)
		return `tool-result · ${toolName}`;
	return blockType;
}

function toBlockNode(
	message: ContextSessionMessage,
	messageIndex: number,
	blockIndex: number,
	blockType: BlockKind,
	toolName?: string,
): ContextBlockNode {
	return {
		kind: "block",
		id: `block:${messageIndex}:${blockIndex}`,
		blockType,
		label: blockLabel(blockType, toolName),
		tokens: estimateBlockTokens(message, blockIndex),
	};
}

function classifyAssistantBlocks(
	message: ContextSessionMessage,
	messageIndex: number,
): ContextBlockNode[] {
	const content = (message.content ?? []) as ContentBlock[];
	return content.map((block, blockIndex) => {
		switch (block.type) {
			case "thinking":
				return toBlockNode(message, messageIndex, blockIndex, "thinking");
			case "text":
				return toBlockNode(message, messageIndex, blockIndex, "text");
			case "toolCall":
				return toBlockNode(
					message,
					messageIndex,
					blockIndex,
					"tool-call",
					block.name,
				);
			default:
				return toBlockNode(message, messageIndex, blockIndex, "custom");
		}
	});
}

function classifyUserLikeBlocks(
	message: ContextSessionMessage,
	messageIndex: number,
): ContextBlockNode[] {
	const content = message.content;
	if (typeof content === "string") {
		return [toBlockNode(message, messageIndex, 0, "text")];
	}

	return ((content ?? []) as ContentBlock[]).map((block, blockIndex) => {
		if (block.type === "image") {
			return toBlockNode(message, messageIndex, blockIndex, "image");
		}
		return toBlockNode(message, messageIndex, blockIndex, "text");
	});
}

export function classifyBlocks(
	message: ContextSessionMessage,
	messageIndex: number,
): ContextBlockNode[] {
	const role = message.role;

	if (role === "assistant") {
		return classifyAssistantBlocks(message, messageIndex);
	}

	if (role === "toolResult") {
		const content = (message.content ?? []) as ContentBlock[];
		if (content.length === 0) {
			return [
				toBlockNode(message, messageIndex, 0, "tool-result", message.toolName),
			];
		}
		return content.map((block, blockIndex) =>
			block.type === "image"
				? toBlockNode(message, messageIndex, blockIndex, "image")
				: toBlockNode(
						message,
						messageIndex,
						blockIndex,
						"tool-result",
						message.toolName,
					),
		);
	}

	if (role === "user" || role === "developer") {
		return classifyUserLikeBlocks(message, messageIndex);
	}

	return [toBlockNode(message, messageIndex, 0, "custom")];
}
