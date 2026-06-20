import type { CategoryId } from "./types";

export type Tier = "normal" | "warning" | "purple" | "error";

/** Absolute token thresholds per category (inclusive lower bound for each band). */
const TIER_THRESHOLDS: Record<
	CategoryId,
	{ warning: number; purple: number; error: number }
> = {
	systemPrompt: { warning: 1_500, purple: 4_000, error: 8_000 },
	systemContext: { warning: 500, purple: 2_000, error: 4_000 },
	systemTools: { warning: 10_000, purple: 20_000, error: 40_000 },
	skills: { warning: 2_000, purple: 6_000, error: 12_000 },
	messages: { warning: 4_000, purple: 12_000, error: 24_000 },
};

export function tierForRow(category: CategoryId, tokens: number): Tier {
	if (!Number.isFinite(tokens) || tokens <= 0) return "normal";
	const thresholds = TIER_THRESHOLDS[category];
	if (tokens >= thresholds.error) return "error";
	if (tokens >= thresholds.purple) return "purple";
	if (tokens >= thresholds.warning) return "warning";
	return "normal";
}

/** Maps a tier band to an OMP TUI theme foreground color token. */
export type TierThemeColor =
	| "text"
	| "warning"
	| "customMessageLabel"
	| "error";

export function tierThemeColor(tier: Tier): TierThemeColor {
	switch (tier) {
		case "warning":
			return "warning";
		case "purple":
			return "customMessageLabel";
		case "error":
			return "error";
		default:
			return "text";
	}
}
