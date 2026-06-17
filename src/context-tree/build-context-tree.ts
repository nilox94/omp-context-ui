import { estimateMessageTokens } from "./estimate-message-tokens.js";
import { countTokens } from "@oh-my-pi/pi-natives";
import {
  computeContextBreakdown,
  estimateSkillsTokens,
  estimateToolSchemaTokens,
} from "@oh-my-pi/pi-coding-agent/modes/utils/context-usage";
import type { AgentSession } from "@oh-my-pi/pi-coding-agent/session/agent-session";
import type { Skill } from "@oh-my-pi/pi-coding-agent/extensibility/skills";
import { classifyBlocks, type ContextSessionMessage } from "./classify-blocks.js";
import type {
  CategoryId,
  ContextCategoryNode,
  ContextLeafNode,
  ContextMessageNode,
  ContextTree,
} from "./types.js";

const EMPTY_TOOLS: ReadonlyArray<{ name: string; description: string; parameters: unknown }> = [];

interface PromptSection {
  label: string;
  text: string;
}

function itemizePromptSections(text: string): PromptSection[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const tagMatches = [...trimmed.matchAll(/^<([a-zA-Z][\w-]*)>/gm)];
  if (tagMatches.length === 0) {
    return [{ label: "System prompt", text: trimmed }];
  }

  const sections: PromptSection[] = [];
  const firstIndex = tagMatches[0]?.index ?? 0;
  if (firstIndex > 0) {
    const preamble = trimmed.slice(0, firstIndex).trim();
    if (preamble) sections.push({ label: "Preamble", text: preamble });
  }

  for (let index = 0; index < tagMatches.length; index += 1) {
    const start = tagMatches[index]?.index ?? 0;
    const end = index + 1 < tagMatches.length ? (tagMatches[index + 1]?.index ?? trimmed.length) : trimmed.length;
    const body = trimmed.slice(start, end).trim();
    if (!body) continue;
    sections.push({ label: tagMatches[index]?.[1] ?? "section", text: body });
  }

  return sections;
}

function itemizeContextLeaves(parts: readonly string[]): PromptSection[] {
  const leaves: PromptSection[] = [];

  for (const part of parts) {
    let matchedFile = false;
    for (const match of part.matchAll(/<file path="([^"]+)">([\s\S]*?)<\/file>/g)) {
      matchedFile = true;
      const path = match[1] ?? "context file";
      leaves.push({ label: path, text: match[0] ?? "" });
    }
    if (matchedFile) continue;

    const sections = itemizePromptSections(part);
    if (sections.length > 0) {
      leaves.push(...sections);
      continue;
    }

    const trimmed = part.trim();
    if (trimmed) leaves.push({ label: "Context", text: trimmed });
  }

  return leaves;
}

function buildLeafNodes(categoryId: CategoryId, sections: PromptSection[]): ContextLeafNode[] {
  return sections.map((section, index) => ({
    kind: "leaf" as const,
    id: `leaf:${categoryId}:${index}`,
    label: section.label,
    tokens: countTokens([section.text]),
  }));
}

function messageLabel(message: ContextSessionMessage, index: number): string {
  const role = (message as { role?: string }).role;
  if (role === "toolResult") {
    return `tool-result · ${message.toolName ?? "tool"}`;
  }
  if (role === "custom") {
    const customType = (message as { customType?: string }).customType;
    return customType ? `custom · ${customType}` : "custom";
  }
  if (role === "user" || role === "developer" || role === "assistant") {
    return role;
  }
  return role ?? `message ${index + 1}`;
}

function buildMessageNodes(messages: readonly ContextSessionMessage[]): ContextMessageNode[] {
  return messages.map((message, index) => {
    const blocks = classifyBlocks(message, index);
    const tokens = estimateMessageTokens(message);
    return {
      kind: "message" as const,
      id: `msg:${index}`,
      label: messageLabel(message, index),
      tokens,
      blocks,
    };
  });
}

function buildSystemPromptLeaves(systemPromptParts: readonly string[], skills: readonly Skill[]): ContextLeafNode[] {
  const basePrompt = systemPromptParts[0] ?? "";
  const sections = itemizePromptSections(basePrompt);
  const leaves = buildLeafNodes("systemPrompt", sections);

  const skillsTokens = estimateSkillsTokens(skills);
  if (skillsTokens > 0 && leaves.length > 0) {
    const skillsSection = leaves.find((leaf) => leaf.label === "skills");
    if (skillsSection) {
      skillsSection.tokens = Math.max(0, skillsSection.tokens - skillsTokens);
    }
  }

  return leaves.length > 0 ? leaves : [{ kind: "leaf", id: "leaf:systemPrompt:0", label: "System prompt", tokens: 0 }];
}

function buildToolLeaves(tools: ReadonlyArray<{ name: string; description: string; parameters: unknown }>): ContextLeafNode[] {
  return tools.map((tool, index) => ({
    kind: "leaf" as const,
    id: `leaf:systemTools:${index}`,
    label: tool.name,
    tokens: estimateToolSchemaTokens([tool]),
  }));
}

function buildSkillLeaves(skills: readonly Skill[]): ContextLeafNode[] {
  return skills.map((skill, index) => ({
    kind: "leaf" as const,
    id: `leaf:skills:${index}`,
    label: skill.name,
    tokens: countTokens([skill.name, skill.description]),
  }));
}

export function buildContextTree(session: AgentSession): ContextTree {
  const breakdown = computeContextBreakdown(session);
  const systemPromptParts = session.systemPrompt ?? [];
  const tools = session.agent?.state?.tools ?? EMPTY_TOOLS;
  const skills = session.skills ?? [];
  const messages = session.messages ?? [];

  const categoryChildren: Record<Exclude<CategoryId, "messages">, ContextLeafNode[]> = {
    systemPrompt: buildSystemPromptLeaves(systemPromptParts, skills),
    systemContext: buildLeafNodes("systemContext", itemizeContextLeaves(systemPromptParts.slice(1))),
    systemTools: buildToolLeaves(tools),
    skills: buildSkillLeaves(skills),
  };

  const categories: ContextCategoryNode[] = breakdown.categories.map((category) => {
    if (category.id === "messages") {
      return {
        kind: "category",
        id: "messages",
        label: category.label,
        tokens: category.tokens,
        children: buildMessageNodes(messages),
      };
    }

    return {
      kind: "category",
      id: category.id,
      label: category.label,
      tokens: category.tokens,
      children: categoryChildren[category.id],
    };
  });

  return {
    categories,
    usedTokens: breakdown.usedTokens,
    contextWindow: breakdown.contextWindow,
  };
}
