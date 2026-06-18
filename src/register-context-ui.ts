import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@oh-my-pi/pi-coding-agent";

export interface RegisterContextUiOptions {
	hasUI: boolean;
}

let registered = false;

/** @internal */
export function __resetContextUiRegistrationForTests(): void {
	registered = false;
}

export function registerContextUiCommand(
	pi: Pick<ExtensionAPI, "registerCommand">,
	options: RegisterContextUiOptions,
): void {
	if (!options.hasUI || registered) return;
	registered = true;

	pi.registerCommand("context-ui", {
		description: "Open interactive context window inspector",
		handler: async (_args, ctx: ExtensionCommandContext) => {
			const { openContextInspectorOverlay } = await import(
				"@/overlay/context-inspector"
			);
			await openContextInspectorOverlay(ctx);
		},
	});
}
