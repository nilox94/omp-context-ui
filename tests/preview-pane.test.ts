import { describe, expect, it } from "bun:test";
import {
	formatPreviewHeader,
	truncatePreviewBody,
} from "@/overlay/preview-pane";

describe("formatPreviewHeader", () => {
	it("formats tokens, char count, and label with separators", () => {
		expect(
			formatPreviewHeader({
				label: "tool-result · grep",
				tokens: 48_231,
				chars: 142_890,
			}),
		).toBe("48,231 tokens · 142,890 chars · tool-result · grep");
	});
});

describe("truncatePreviewBody", () => {
	it("returns small content unchanged", () => {
		expect(truncatePreviewBody("hello", 12)).toBe("hello");
	});

	it("truncates large content with a remaining-token suffix", () => {
		const text = "x".repeat(10_000);
		const body = truncatePreviewBody(text, 10_000, 4_000);

		expect(body.startsWith("x".repeat(4_000))).toBe(true);
		expect(body).toContain("… [");
		expect(body).toContain("more tokens]");
		expect(body.length).toBeLessThan(text.length);
	});
});

import { buildPreviewContentLines } from "@/overlay/preview-pane";

describe("buildPreviewContentLines", () => {
	it("places header on the first line and body on following lines", () => {
		const lines = buildPreviewContentLines(
			{
				label: "text",
				tokens: 42,
				content: "line one\nline two",
			},
			4,
		);

		expect(lines[0]).toBe("42 tokens · 17 chars · text");
		expect(lines[1]).toBe("line one");
		expect(lines[2]).toBe("line two");
		expect(lines[3]).toBe("");
	});
});
