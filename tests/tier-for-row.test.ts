import { describe, expect, it } from "bun:test";
import { tierForRow, tierThemeColor } from "@/context-tree/tier-for-row";
import type { CategoryId } from "@/context-tree/types";

const categories: CategoryId[] = [
	"systemPrompt",
	"systemContext",
	"systemTools",
	"skills",
	"messages",
];

function boundaries(category: CategoryId): {
	normal: number;
	warning: number;
	purple: number;
	error: number;
} {
	switch (category) {
		case "systemPrompt":
			return { normal: 1_499, warning: 1_500, purple: 4_000, error: 8_000 };
		case "systemContext":
			return { normal: 499, warning: 500, purple: 2_000, error: 4_000 };
		case "systemTools":
			return { normal: 9_999, warning: 10_000, purple: 20_000, error: 40_000 };
		case "skills":
			return { normal: 1_999, warning: 2_000, purple: 6_000, error: 12_000 };
		case "messages":
			return { normal: 3_999, warning: 4_000, purple: 12_000, error: 24_000 };
	}
}

describe("tierForRow", () => {
	for (const category of categories) {
		const { normal, warning, purple, error } = boundaries(category);

		it(`classifies ${category} at normal/warning/purple/error boundaries`, () => {
			expect(tierForRow(category, normal)).toBe("normal");
			expect(tierForRow(category, warning)).toBe("warning");
			expect(tierForRow(category, purple)).toBe("purple");
			expect(tierForRow(category, error)).toBe("error");
			expect(tierForRow(category, error + 1)).toBe("error");
		});
	}

	it("maps 8k differently across tool schemas vs messages vs context files", () => {
		expect(tierForRow("systemTools", 8_000)).toBe("normal");
		expect(tierForRow("messages", 8_000)).toBe("warning");
		expect(tierForRow("systemContext", 8_000)).toBe("error");
	});

	it("treats zero and negative token counts as normal", () => {
		for (const category of categories) {
			expect(tierForRow(category, 0)).toBe("normal");
			expect(tierForRow(category, -1)).toBe("normal");
		}
	});
});

describe("tierThemeColor", () => {
	it("maps tiers to OMP theme color tokens", () => {
		expect(tierThemeColor("normal")).toBe("text");
		expect(tierThemeColor("warning")).toBe("warning");
		expect(tierThemeColor("purple")).toBe("customMessageLabel");
		expect(tierThemeColor("error")).toBe("error");
	});
});
