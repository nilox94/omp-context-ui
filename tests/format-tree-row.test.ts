import { describe, expect, it } from "bun:test";
import { formatVisibleTreeRow } from "@/context-tree/format-tree-row";
import type { VisibleTreeRow } from "@/context-tree/tree-navigator";

const baseRow: VisibleTreeRow = {
	id: "cat:systemPrompt",
	depth: 0,
	label: "System prompt",
	tokens: 42,
	hasChildren: true,
	expanded: true,
	parentId: null,
};

describe("formatVisibleTreeRow", () => {
	it("reserves a fixed left cursor column so selection does not shift content", () => {
		const unselected = formatVisibleTreeRow(baseRow, false);
		const selected = formatVisibleTreeRow(baseRow, true);

		expect(unselected.startsWith("  ▾ System prompt")).toBe(true);
		expect(selected.startsWith("› ▾ System prompt")).toBe(true);
		expect(unselected.slice(2)).toBe(selected.slice(2));
	});

	it("indents nested rows after the cursor column", () => {
		const nested: VisibleTreeRow = {
			...baseRow,
			id: "leaf:0",
			depth: 1,
			label: "Preamble",
			hasChildren: false,
			expanded: false,
		};

		const unselected = formatVisibleTreeRow(nested, false);
		const selected = formatVisibleTreeRow(nested, true);

		expect(unselected.startsWith("      Preamble")).toBe(true);
		expect(selected.startsWith("›     Preamble")).toBe(true);
		expect(unselected.slice(2)).toBe(selected.slice(2));
	});
});
