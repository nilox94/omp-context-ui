import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent";
import { registerContextUiCommand } from "./register-context-ui";

export default function ompContextUi(pi: ExtensionAPI): void {
	// Register at extension load time so OMP's slash-command autocomplete
	// snapshot (taken before session_start) includes /context-ui.
	registerContextUiCommand(pi);
}
