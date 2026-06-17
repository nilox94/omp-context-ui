import { describe, expect, it } from "vitest";
import type { ContextTree } from "../src/context-tree/types.js";
import { TreeNavigator } from "../src/context-tree/tree-navigator.js";

const sampleTree: ContextTree = {
  usedTokens: 100,
  contextWindow: 200,
  categories: [
    {
      kind: "category",
      id: "systemPrompt",
      label: "System prompt",
      tokens: 10,
      children: [{ kind: "leaf", id: "leaf:systemPrompt:0", label: "Preamble", tokens: 10 }],
    },
    {
      kind: "category",
      id: "messages",
      label: "Messages",
      tokens: 90,
      children: [
        {
          kind: "message",
          id: "msg:0",
          label: "user",
          tokens: 40,
          blocks: [{ kind: "block", id: "block:0:0", blockType: "text", label: "text", tokens: 40 }],
        },
      ],
    },
  ],
};

describe("TreeNavigator", () => {
  it("opens with categories expanded and deeper tiers collapsed", () => {
    const navigator = new TreeNavigator(sampleTree);
    const rows = navigator.getVisibleRows();

    expect(rows.map((row) => row.label)).toEqual(["System prompt", "Preamble", "Messages"]);
    expect(rows.every((row) => row.depth <= 1)).toBe(true);
  });

  it("moves selection and expands messages on right", () => {
    const navigator = new TreeNavigator(sampleTree);
    navigator.moveSelection(2);
    expect(navigator.selectedId).toBe("messages");
    navigator.expandSelected();
    const rows = navigator.getVisibleRows();
    expect(rows.some((row) => row.label === "user")).toBe(true);
    expect(rows.some((row) => row.label === "text")).toBe(false);
    navigator.moveSelection(1);
    navigator.expandSelected();
    expect(navigator.getVisibleRows().some((row) => row.label === "text")).toBe(true);
  });
});
