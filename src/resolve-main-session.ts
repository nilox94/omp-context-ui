import { AgentRegistry } from "@oh-my-pi/pi-coding-agent/registry/agent-registry";
import type { AgentSession } from "@oh-my-pi/pi-coding-agent/session/agent-session";
import type { ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";

export class MainSessionUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MainSessionUnavailableError";
  }
}

export function resolveMainSession(
  ctx: Pick<ExtensionCommandContext, "sessionManager">,
): AgentSession {
  const sessionId = ctx.sessionManager.getSessionId();

  for (const ref of AgentRegistry.global().list()) {
    const session = ref.session;
    if (!session) continue;
    if (session.sessionManager.getSessionId() !== sessionId) continue;
    return session;
  }

  throw new MainSessionUnavailableError(
    "Cannot open context inspector: main session is unavailable (session may be parked or not registered).",
  );
}
