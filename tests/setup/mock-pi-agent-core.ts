import { mock } from "bun:test";

mock.module("@oh-my-pi/pi-agent-core", () => ({
	estimateTokens: () => 12,
}));
