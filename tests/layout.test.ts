import { describe, expect, it } from "bun:test";
import { renderContextInspectorLayout } from "@/overlay/layout";

const labels = {
	title: "Context Inspector",
	treeLabel: "Tree",
	previewLabel: "Preview",
	treeLines: ["System prompt  ~1k", "Messages  ~142k"],
	previewLines: ["(select a row)", ""],
	footer: "Context: 72% · ~144k / 200000 · Esc close",
};

function paneSeparatorColumn(line: string): number {
	return line.indexOf("│");
}

function style(text: string, code: string): string {
	return `\x1b[${code}m${text}\x1b[0m`;
}

describe("renderContextInspectorLayout", () => {
	it("renders tree rows, preview column, and footer", () => {
		const lines = renderContextInspectorLayout(80, labels);
		const text = lines.join("\n");

		expect(text).toContain("Tree");
		expect(text).toContain("Preview");
		expect(text).toContain("System prompt");
		expect(text).toContain("Messages");
		expect(text).toContain("(select a row)");
		expect(text).toContain("Context: 72%");
		expect(text).toContain("Esc");
	});

	it("keeps pane separators aligned when columns contain ANSI styles", () => {
		const styledLabels = {
			...labels,
			treeLabel: style("Tree", "2"),
			previewLabel: style("Preview", "2"),
			treeLines: [
				style("› ▸ System prompt  ~1k", "1;34;48;5;236"),
				"Messages  ~142k",
			],
			previewLines: [style("(select a row)", "2"), ""],
		};

		const lines = renderContextInspectorLayout(80, styledLabels);
		const headerColumn = paneSeparatorColumn(lines[2] ?? "");
		const firstRowColumn = paneSeparatorColumn(lines[3] ?? "");
		const secondRowColumn = paneSeparatorColumn(lines[4] ?? "");

		expect(headerColumn).toBeGreaterThan(0);
		expect(firstRowColumn).toBe(headerColumn);
		expect(secondRowColumn).toBe(headerColumn);
	});
});
