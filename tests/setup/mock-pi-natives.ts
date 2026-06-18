import { mock } from "bun:test";

mock.module("@oh-my-pi/pi-natives", () => ({
	countTokens: (fragments: string[]) => fragments.join("").length,
}));
