import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
	__resetContextUiRegistrationForTests,
	registerContextUiCommand,
} from "../src/register-context-ui";

describe("registerContextUiCommand", () => {
	beforeEach(() => {
		__resetContextUiRegistrationForTests();
	});

	it("registers /context-ui only when hasUI is true", () => {
		const registerCommand = mock();
		const pi = { registerCommand, on: mock() } as never;

		registerContextUiCommand(pi, { hasUI: false });
		expect(registerCommand).not.toHaveBeenCalled();

		registerContextUiCommand(pi, { hasUI: true });
		expect(registerCommand).toHaveBeenCalledTimes(1);
		expect(registerCommand).toHaveBeenCalledWith(
			"context-ui",
			expect.objectContaining({
				description: expect.any(String),
				handler: expect.any(Function),
			}),
		);
	});

	it("does not register twice when called repeatedly with hasUI", () => {
		const registerCommand = mock();
		const pi = { registerCommand, on: mock() } as never;

		registerContextUiCommand(pi, { hasUI: true });
		registerContextUiCommand(pi, { hasUI: true });

		expect(registerCommand).toHaveBeenCalledTimes(1);
	});
});
