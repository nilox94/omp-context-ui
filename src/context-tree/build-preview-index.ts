import type { Skill } from "@oh-my-pi/pi-coding-agent";
import type { ContextSessionSource } from "../context-session-source";
import { type ContextSessionMessage, classifyBlocks } from "./classify-blocks";
import type { ContextTree } from "./types";

interface ContentBlock {
	type: string;
	text?: string;
	thinking?: string;
	name?: string;
	arguments?: unknown;
}

function stringifyValue(value: unknown): string {
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
}

function extractBlockText(
	message: ContextSessionMessage,
	blockIndex: number,
): string {
	const role = message.role;

	if (role === "assistant") {
		const block = (message.content as ContentBlock[] | undefined)?.[blockIndex];
		if (!block) return "";
		switch (block.type) {
			case "thinking":
				return block.thinking ?? "";
			case "text":
				return block.text ?? "";
			case "toolCall":
				return stringifyValue({
					name: block.name,
					arguments: block.arguments,
				});
			default:
				return stringifyValue(block);
		}
	}

	if (role === "toolResult") {
		const content = message.content as ContentBlock[] | undefined;
		if (!content || content.length === 0) return "";
		const block = content[blockIndex];
		if (!block) return "";
		if (block.type === "image") return "[image]";
		return block.text ?? stringifyValue(block);
	}

	if (role === "user" || role === "developer") {
		const content = message.content;
		if (typeof content === "string") {
			return blockIndex === 0 ? content : "";
		}
		const block = (content as ContentBlock[] | undefined)?.[blockIndex];
		if (!block) return "";
		if (block.type === "image") return "[image]";
		return block.text ?? stringifyValue(block);
	}

	return blockIndex === 0 ? stringifyValue(message.content) : "";
}

function extractMessageText(
	message: ContextSessionMessage,
	messageIndex: number,
) {
	const blocks = classifyBlocks(message, messageIndex);
	return blocks
		.map((_, blockIndex) => extractBlockText(message, blockIndex))
		.filter((text) => text.length > 0)
		.join("\n\n");
}

function itemizePromptSections(text: string): string[] {
	const trimmed = text.trim();
	if (!trimmed) return [];

	const tagMatches = [...trimmed.matchAll(/^<([a-zA-Z][\w-]*)>/gm)];
	if (tagMatches.length === 0) return [trimmed];

	const sections: string[] = [];
	const firstIndex = tagMatches[0]?.index ?? 0;
	if (firstIndex > 0) {
		const preamble = trimmed.slice(0, firstIndex).trim();
		if (preamble) sections.push(preamble);
	}

	for (let index = 0; index < tagMatches.length; index += 1) {
		const start = tagMatches[index]?.index ?? 0;
		const end =
			index + 1 < tagMatches.length
				? (tagMatches[index + 1]?.index ?? trimmed.length)
				: trimmed.length;
		const body = trimmed.slice(start, end).trim();
		if (body) sections.push(body);
	}

	return sections;
}

function itemizeContextLeaves(parts: readonly string[]): string[] {
	const leaves: string[] = [];

	for (const part of parts) {
		let matchedFile = false;
		for (const match of part.matchAll(
			/<file path="([^"]+)">([\s\S]*?)<\/file>/g,
		)) {
			matchedFile = true;
			leaves.push(match[0] ?? "");
		}
		if (matchedFile) continue;

		const sections = itemizePromptSections(part);
		if (sections.length > 0) {
			leaves.push(...sections);
			continue;
		}

		const trimmed = part.trim();
		if (trimmed) leaves.push(trimmed);
	}

	return leaves;
}

function buildSystemPromptTexts(
	systemPromptParts: readonly string[],
): string[] {
	const basePrompt = systemPromptParts[0] ?? "";
	const sections = itemizePromptSections(basePrompt);
	return sections.length > 0 ? sections : [""];
}

function buildSkillTexts(skills: readonly Skill[]): string[] {
	return skills.map((skill) => `${skill.name}\n${skill.description}`);
}

function buildToolTexts(
	tools: ReadonlyArray<{
		name: string;
		description: string;
		parameters: unknown;
	}>,
): string[] {
	return tools.map((tool) =>
		stringifyValue({
			name: tool.name,
			description: tool.description,
			parameters: tool.parameters,
		}),
	);
}

function joinNonEmpty(parts: readonly string[], separator = "\n\n"): string {
	return parts.filter((part) => part.length > 0).join(separator);
}

export function buildPreviewIndex(
	session: ContextSessionSource,
	tree: ContextTree,
): ReadonlyMap<string, string> {
	const index = new Map<string, string>();
	const messages = session.messages ?? [];
	const systemPromptParts = session.systemPrompt ?? [];
	const tools = session.tools ?? [];
	const skills = session.skills ?? [];

	const systemPromptTexts = buildSystemPromptTexts(systemPromptParts);
	const contextTexts = itemizeContextLeaves(systemPromptParts.slice(1));
	const toolTexts = buildToolTexts(tools);
	const skillTexts = buildSkillTexts(skills);

	for (const category of tree.categories) {
		if (category.id === "messages") {
			const messageNodes = category.children;
			index.set(
				category.id,
				messageNodes.length === 0
					? "No messages"
					: `${messageNodes.length} messages in transcript`,
			);
			continue;
		}

		let categoryTexts: string[] = [];
		if (category.id === "systemPrompt") categoryTexts = systemPromptTexts;
		if (category.id === "systemContext") categoryTexts = contextTexts;
		if (category.id === "systemTools") categoryTexts = toolTexts;
		if (category.id === "skills") categoryTexts = skillTexts;

		index.set(category.id, joinNonEmpty(categoryTexts));

		for (const [leafIndex, leaf] of category.children.entries()) {
			index.set(leaf.id, categoryTexts[leafIndex] ?? "");
		}
	}

	for (const [messageIndex, message] of messages.entries()) {
		const messageId = `msg:${messageIndex}`;
		index.set(messageId, extractMessageText(message, messageIndex));

		const blocks = classifyBlocks(message, messageIndex);
		for (const [blockIndex] of blocks.entries()) {
			index.set(
				`block:${messageIndex}:${blockIndex}`,
				extractBlockText(message, blockIndex),
			);
		}
	}

	return index;
}
