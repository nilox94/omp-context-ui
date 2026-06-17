import { describe, expect, it } from "vitest";
import { renderContextInspectorLayout } from "../src/overlay/layout.js";

const labels = {
  title: "Context Inspector",
  treeLabel: "Tree",
  previewLabel: "Preview",
  treeLines: ["System prompt  ~1k", "Messages  ~142k"],
  previewLines: ["(select a row)", ""],
  footer: "Context: 72% · ~144k / 200000 · Esc close",
};

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
});
