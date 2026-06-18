import { mock } from "bun:test";

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
