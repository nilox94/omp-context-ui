import type { AgentMessage } from "@oh-my-pi/pi-agent-core";
import type { Model } from "@oh-my-pi/pi-ai";
import type { ExtensionCommandContext, Skill } from "@oh-my-pi/pi-coding-agent";
import type { SessionEntry } from "@oh-my-pi/pi-coding-agent/session/session-entries";

const EMPTY_TOOLS: ReadonlyArray<{
	name: string;
	description: string;
	parameters: unknown;
}> = [];

/** Minimal session shape used to build the context tree. */
export interface ContextSessionSource {
	model?: Model;
	systemPrompt: readonly string[];
	skills: readonly Skill[];
	tools: ReadonlyArray<{
		name: string;
		description: string;
		parameters: unknown;
	}>;
	messages: readonly AgentMessage[];
}

function messagesFromBranch(branch: readonly SessionEntry[]): AgentMessage[] {
	const messages: AgentMessage[] = [];
	for (const entry of branch) {
		if (entry.type === "message") {
			messages.push(entry.message);
		}
	}
	return messages;
}

/**
 * Build a context snapshot source from the extension command context.
 *
 * Extension commands do not receive `AgentSession` (built-in `/context` does via
 * `runtime.ctx.session`). This uses the same underlying data: `getSystemPrompt`,
 * `sessionManager.getBranch()`, and `model`.
 */
export function createContextSessionSource(
	ctx: ExtensionCommandContext,
): ContextSessionSource {
	return {
		model: ctx.model,
		systemPrompt: ctx.getSystemPrompt(),
		skills: [],
		tools: EMPTY_TOOLS,
		messages: messagesFromBranch(ctx.sessionManager.getBranch()),
	};
}
