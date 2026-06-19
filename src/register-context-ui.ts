import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@oh-my-pi/pi-coding-agent";
import { openContextInspectorOverlay } from "./overlay/context-inspector";

let registered = false;

/** @internal */
export function __resetContextUiRegistrationForTests(): void {
	registered = false;
}

export function registerContextUiCommand(
	pi: Pick<ExtensionAPI, "registerCommand">,
): void {
	if (registered) return;
	registered = true;

	pi.registerCommand("context-ui", {
		description: "Open interactive context window inspector",
		handler: async (_args, ctx: ExtensionCommandContext) => {
			if (!ctx.hasUI) {
				return;
			}
			try {
				await openContextInspectorOverlay(ctx);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(message, "error");
			}
		},
	});
}
