import { describe, expect, it, mock } from "bun:test";

mock.module("@oh-my-pi/pi-agent-core", () => ({
	estimateTokens: () => 12,
}));

mock.module("@oh-my-pi/pi-natives", () => ({
	countTokens: (fragments: string[]) => fragments.join("").length,
}));

mock.module("@oh-my-pi/pi-coding-agent/modes/utils/context-usage", () => ({
	computeContextBreakdown: (session: {
		model?: { contextWindow?: number };
	}) => ({
		categories: [
			{
				id: "systemPrompt",
				label: "System prompt",
				tokens: 10,
				color: "accent",
				glyph: "x",
			},
			{
				id: "systemTools",
				label: "System tools",
				tokens: 20,
				color: "warning",
				glyph: "x",
			},
			{
				id: "systemContext",
				label: "System context",
				tokens: 30,
				color: "customMessageLabel",
				glyph: "x",
			},
			{
				id: "skills",
				label: "Skills",
				tokens: 40,
				color: "success",
				glyph: "x",
			},
			{
				id: "messages",
				label: "Messages",
				tokens: 50,
				color: "userMessageText",
				glyph: "x",
			},
		],
		usedTokens: 150,
		contextWindow: session.model?.contextWindow ?? 200_000,
		autoCompactBufferTokens: 0,
		freeTokens: 199_850,
		model: session.model,
	}),
	estimateSkillsTokens: () => 5,
	estimateToolSchemaTokens: () => 8,
}));

import { buildContextTree } from "@/context-tree/build-context-tree";

function makeSession(overrides: {
	systemPrompt?: string[];
	skills?: Array<{
		name: string;
		description: string;
		filePath: string;
		baseDir: string;
		source: string;
	}>;
	tools?: Array<{
		name: string;
		description: string;
		parameters: Record<string, unknown>;
	}>;
	messages?: Array<Record<string, unknown>>;
	contextWindow?: number;
}) {
	return {
		systemPrompt: overrides.systemPrompt ?? [
			"<system-conventions>rules</system-conventions>\n\nBase prompt",
		],
		skills: overrides.skills ?? [
			{
				name: "tdd",
				description: "test first",
				filePath: "a",
				baseDir: "b",
				source: "c",
			},
		],
		agent: {
			state: {
				tools: overrides.tools ?? [
					{
						name: "grep",
						description: "search files",
						parameters: { type: "object", properties: {} },
					},
				],
			},
		},
		messages: overrides.messages ?? [],
		model: { contextWindow: overrides.contextWindow ?? 200_000 },
		settings: {
			getGroup: () => ({ enabled: false, strategy: "off" }),
			get: () => "none",
		},
	} as never;
}

describe("buildContextTree", () => {
	it("produces five categories with system leaves and message blocks", () => {
		const messages = [
			{ role: "user", content: "hello", timestamp: 1 },
			{
				role: "assistant",
				content: [
					{
						type: "toolCall",
						id: "call_1",
						name: "grep",
						arguments: { pattern: "x" },
					},
				],
				timestamp: 2,
			},
			{
				role: "toolResult",
				toolCallId: "call_1",
				toolName: "grep",
				content: [{ type: "text", text: "found" }],
				timestamp: 3,
			},
		];

		const tree = buildContextTree(makeSession({ messages }));

		expect(tree.categories.map((category) => category.id)).toEqual([
			"systemPrompt",
			"systemTools",
			"systemContext",
			"skills",
			"messages",
		]);

		const systemPrompt = tree.categories.find(
			(category) => category.id === "systemPrompt",
		);
		expect(systemPrompt?.children.every((child) => child.kind === "leaf")).toBe(
			true,
		);

		const messagesCategory = tree.categories.find(
			(category) => category.id === "messages",
		);
		expect(messagesCategory?.children).toHaveLength(3);
		expect(messagesCategory?.children.map((message) => message.label)).toEqual([
			"user",
			"assistant",
			"tool-result · grep",
		]);

		const assistantMessage = messagesCategory?.children[1];
		expect(
			assistantMessage && assistantMessage.kind === "message"
				? assistantMessage.blocks[0]?.label
				: null,
		).toBe("tool-call · grep");
		const toolMessage = messagesCategory?.children[2];
		expect(
			toolMessage && toolMessage.kind === "message"
				? toolMessage.blocks[0]?.label
				: null,
		).toBe("tool-result · grep");
	});

	it("itemizes context files from project prompt blocks", () => {
		const tree = buildContextTree(
			makeSession({
				systemPrompt: [
					"Base",
					'<context>\n<file path="CONTEXT.md">\n# Context\n</file>\n</context>',
				],
			}),
		);

		const systemContext = tree.categories.find(
			(category) => category.id === "systemContext",
		);
		expect(systemContext?.children.map((leaf) => leaf.label)).toEqual([
			"CONTEXT.md",
		]);
	});
});
