import { describe, expect, it } from "bun:test";
import {
	buildCategoryRowsFromBreakdown,
	computeContextUsagePercent,
	formatApproxTokens,
	formatCategoryRow,
	formatContextFooter,
} from "@/overlay/category-rollup";

describe("formatApproxTokens", () => {
	it("prefixes counts with tilde", () => {
		expect(formatApproxTokens(42)).toBe("~42");
		expect(formatApproxTokens(1500)).toBe("~1.5k");
		expect(formatApproxTokens(12000)).toBe("~12k");
	});
});

describe("formatCategoryRow", () => {
	it("renders label and approximate token total", () => {
		expect(formatCategoryRow({ label: "Messages", tokens: 142_000 })).toBe(
			"Messages  ~142k",
		);
	});
});

describe("computeContextUsagePercent", () => {
	it("returns rounded percent when window is known", () => {
		expect(computeContextUsagePercent(50_000, 200_000)).toBe(25);
	});

	it("returns null when context window is zero", () => {
		expect(computeContextUsagePercent(100, 0)).toBeNull();
	});
});

describe("formatContextFooter", () => {
	it("shows percent and approximate totals", () => {
		expect(formatContextFooter(50_000, 200_000)).toBe(
			"Context: 25% · ~50k / 200000",
		);
	});

	it("handles unavailable context window", () => {
		expect(formatContextFooter(0, 0)).toBe("Context: unavailable");
	});
});

describe("buildCategoryRowsFromBreakdown", () => {
	it("maps all five breakdown categories in order", () => {
		const rows = buildCategoryRowsFromBreakdown({
			categories: [
				{
					id: "systemPrompt",
					label: "System prompt",
					tokens: 1000,
					color: "accent",
					glyph: "x",
				},
				{
					id: "systemTools",
					label: "System tools",
					tokens: 2000,
					color: "warning",
					glyph: "x",
				},
				{
					id: "systemContext",
					label: "System context",
					tokens: 3000,
					color: "customMessageLabel",
					glyph: "x",
				},
				{
					id: "skills",
					label: "Skills",
					tokens: 4000,
					color: "success",
					glyph: "x",
				},
				{
					id: "messages",
					label: "Messages",
					tokens: 5000,
					color: "userMessageText",
					glyph: "x",
				},
			],
		});

		expect(rows).toHaveLength(5);
		expect(rows.map((row) => row.label)).toEqual([
			"System prompt",
			"System tools",
			"System context",
			"Skills",
			"Messages",
		]);
		expect(rows.map((row) => row.tokens)).toEqual([
			1000, 2000, 3000, 4000, 5000,
		]);
	});
});
