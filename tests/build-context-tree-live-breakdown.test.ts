import { describe, expect, it } from "bun:test";
import type { ContextSessionSource } from "@/context-session-source";
import { buildContextTree } from "@/context-tree/build-context-tree";

describe("buildContextTree (live breakdown)", () => {
	it("calls computeContextBreakdown without AgentSession.settings", () => {
		const source = {
			systemPrompt: ["Base system prompt"],
			skills: [],
			tools: [],
			messages: [
				{
					role: "user",
					content: [{ type: "text", text: "hello" }],
				},
			],
			model: { contextWindow: 128_000 },
		} as unknown as ContextSessionSource;

		const tree = buildContextTree(source);

		expect(tree.categories).toHaveLength(5);
		expect(tree.contextWindow).toBe(128_000);
		expect(tree.usedTokens).toBeGreaterThan(0);
	});
});
