import type { ExtensionAPI } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";
import { registerContextUiCommand } from "./register-context-ui";

export default function ompContextUi(pi: ExtensionAPI): void {
  pi.on("session_start", async (_event, ctx) => {
    registerContextUiCommand(pi, { hasUI: ctx.hasUI });
  });
}
