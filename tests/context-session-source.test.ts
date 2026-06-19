import { describe, expect, it } from "bun:test";
import { createContextSessionSource } from "@/context-session-source";

describe("createContextSessionSource", () => {
	it("reads system prompt, branch messages, and model from extension command context", () => {
		const source = createContextSessionSource({
			model: { contextWindow: 128_000 } as never,
			getSystemPrompt: () => ["system block"],
			sessionManager: {
				getBranch: () => [
					{
						type: "message",
						message: { role: "user", content: [{ type: "text", text: "hi" }] },
					},
				],
			},
		} as never);

		expect(source.systemPrompt).toEqual(["system block"]);
		expect(source.messages).toHaveLength(1);
		expect(source.messages[0]?.role).toBe("user");
		expect(source.model?.contextWindow).toBe(128_000);
	});
});
