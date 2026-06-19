import { beforeEach, describe, expect, it, mock } from "bun:test";
import {
	__resetContextUiRegistrationForTests,
	registerContextUiCommand,
} from "@/register-context-ui";

describe("registerContextUiCommand", () => {
	beforeEach(() => {
		__resetContextUiRegistrationForTests();
	});

	it("registers /context-ui when the extension factory runs", () => {
		const registerCommand = mock();
		const pi = { registerCommand, on: mock() } as never;

		registerContextUiCommand(pi);

		expect(registerCommand).toHaveBeenCalledTimes(1);
		expect(registerCommand).toHaveBeenCalledWith(
			"context-ui",
			expect.objectContaining({
				description: expect.any(String),
				handler: expect.any(Function),
			}),
		);
	});

	it("does not register twice when called repeatedly", () => {
		const registerCommand = mock();
		const pi = { registerCommand, on: mock() } as never;

		registerContextUiCommand(pi);
		registerContextUiCommand(pi);

		expect(registerCommand).toHaveBeenCalledTimes(1);
	});

	it("no-ops in headless mode", async () => {
		const registerCommand = mock((_, options) => options);
		const pi = { registerCommand, on: mock() } as never;

		registerContextUiCommand(pi);
		const registered = registerCommand.mock.calls[0]?.[1] as {
			handler: (args: string, ctx: { hasUI: boolean }) => Promise<void>;
		};

		await registered.handler("", { hasUI: false });
	});
});
