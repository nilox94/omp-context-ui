import { describe, expect, it } from "vitest";
import { renderContextInspectorLayout } from "../src/overlay/layout.js";

const labels = {
  title: "Context Inspector",
  treeLabel: "Tree",
  previewLabel: "Preview",
  treeBody: "(no rows yet)",
  previewBody: "(select a row)",
  footer: "↑/↓ move · ←/→ expand · Esc close",
};

describe("renderContextInspectorLayout", () => {
  it("renders empty tree, preview, and footer regions", () => {
    const lines = renderContextInspectorLayout(80, labels);
    const text = lines.join("\n");

    expect(text).toContain("Tree");
    expect(text).toContain("Preview");
    expect(text).toContain("Esc");
    expect(text).toContain("(no rows yet)");
    expect(text).toContain("(select a row)");
  });
});
