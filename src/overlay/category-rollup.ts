import type { ContextBreakdown } from "@oh-my-pi/pi-coding-agent/modes/utils/context-usage";

export interface CategoryRow {
	label: string;
	tokens: number;
}

export function formatApproxTokens(tokens: number): string {
	if (tokens < 1000) return `~${tokens}`;
	const thousands = tokens / 1000;
	if (tokens < 10_000) {
		const rounded = thousands.toFixed(1).replace(/\.0$/, "");
		return `~${rounded}k`;
	}
	return `~${Math.round(thousands)}k`;
}

export function formatCategoryRow(row: CategoryRow): string {
	return `${row.label}  ${formatApproxTokens(row.tokens)}`;
}

export function computeContextUsagePercent(
	usedTokens: number,
	contextWindow: number,
): number | null {
	if (contextWindow <= 0) return null;
	return Math.round((usedTokens / contextWindow) * 100);
}

export function formatContextFooter(
	usedTokens: number,
	contextWindow: number,
): string {
	const percent = computeContextUsagePercent(usedTokens, contextWindow);
	if (percent === null) return "Context: unavailable";
	return `Context: ${percent}% · ${formatApproxTokens(usedTokens)} / ${contextWindow}`;
}

export function buildCategoryRowsFromBreakdown(
	breakdown: Pick<ContextBreakdown, "categories">,
): CategoryRow[] {
	return breakdown.categories.map((category) => ({
		label: category.label,
		tokens: category.tokens,
	}));
}
