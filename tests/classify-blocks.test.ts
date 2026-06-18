import { describe, expect, it, mock } from "bun:test";

mock.module("@oh-my-pi/pi-agent-core", () => ({
	estimateTokens: () => 12,
}));

import { classifyBlocks } from "@/context-tree/classify-blocks";

describe("classifyBlocks", () => {
	it("splits assistant content into typed blocks in transcript order", () => {
		const message = {
			role: "assistant",
			content: [
				{ type: "thinking", thinking: "plan" },
				{ type: "text", text: "hello" },
				{
					type: "toolCall",
					id: "call_1",
					name: "grep",
					arguments: { pattern: "foo" },
				},
			],
		};

		const blocks = classifyBlocks(message, 0);

		expect(blocks.map((block) => block.blockType)).toEqual([
			"thinking",
			"text",
			"tool-call",
		]);
		expect(blocks.map((block) => block.label)).toEqual([
			"thinking",
			"text",
			"tool-call · grep",
		]);
		expect(blocks.every((block) => block.tokens > 0)).toBe(true);
	});

	it("labels tool-result blocks with the tool name", () => {
		const message = {
			role: "toolResult",
			toolCallId: "call_1",
			toolName: "grep",
			content: [{ type: "text", text: "matches" }],
			isError: false,
			timestamp: 2,
		};

		const blocks = classifyBlocks(message, 1);

		expect(blocks).toHaveLength(1);
		expect(blocks[0]?.blockType).toBe("tool-result");
		expect(blocks[0]?.label).toBe("tool-result · grep");
	});

	it("keeps tool-call and tool-result as separate blocks across messages", () => {
		const assistant = {
			role: "assistant",
			content: [
				{
					type: "toolCall",
					id: "call_1",
					name: "read",
					arguments: { path: "a.ts" },
				},
			],
		};
		const toolResult = {
			role: "toolResult",
			toolCallId: "call_1",
			toolName: "read",
			content: [{ type: "text", text: "file body" }],
		};

		expect(classifyBlocks(assistant, 0)[0]?.blockType).toBe("tool-call");
		expect(classifyBlocks(toolResult, 1)[0]?.blockType).toBe("tool-result");
	});

	it("classifies user string content as a single text block", () => {
		const message = { role: "user", content: "inspect context" };
		const blocks = classifyBlocks(message, 2);

		expect(blocks).toEqual([
			expect.objectContaining({ blockType: "text", label: "text" }),
		]);
	});
});
