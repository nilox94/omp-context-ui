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
			{ id: "systemPrompt", label: "System prompt", tokens: 10 },
			{ id: "systemContext", label: "Context files", tokens: 0 },
			{ id: "systemTools", label: "Tool schemas", tokens: 0 },
			{ id: "skills", label: "Skills", tokens: 0 },
			{ id: "messages", label: "Messages", tokens: 24 },
		],
		usedTokens: 34,
		contextWindow: session.model?.contextWindow ?? 200_000,
		autoCompactBufferTokens: 0,
		freeTokens: 199_966,
		model: session.model,
	}),
	estimateSkillsTokens: () => 0,
	estimateToolSchemaTokens: () => 0,
}));

import type { ContextSessionSource } from "@/context-session-source";
import { buildContextTree } from "@/context-tree/build-context-tree";
import { buildPreviewIndex } from "@/context-tree/build-preview-index";

function makeSession(messages: Array<Record<string, unknown>>) {
	return {
		model: { contextWindow: 200_000 },
		systemPrompt: ["<system>base prompt</system>"],
		skills: [],
		tools: [],
		messages,
	} as unknown as ContextSessionSource;
}

describe("buildPreviewIndex", () => {
	it("maps block rows to plain text content", () => {
		const session = makeSession([
			{
				role: "toolResult",
				toolName: "grep",
				content: [{ type: "text", text: "match one\nmatch two" }],
			},
		]);
		const tree = buildContextTree(session);
		const index = buildPreviewIndex(session, tree);

		expect(index.get("block:0:0")).toBe("match one\nmatch two");
	});

	it("maps system prompt leaves to section text", () => {
		const session = makeSession([]);
		const tree = buildContextTree(session);
		const index = buildPreviewIndex(session, tree);

		expect(index.get("leaf:systemPrompt:0")).toContain("<system>");
	});
});
