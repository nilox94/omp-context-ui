export interface PreviewHeaderInput {
	label: string;
	tokens: number;
	chars: number;
}

const DEFAULT_HEAD_CHARS = 4_000;

function formatCount(value: number): string {
	return value.toLocaleString("en-US");
}

function formatRemainingTokens(tokens: number): string {
	if (tokens < 1000) return formatCount(tokens);
	const thousands = tokens / 1000;
	if (tokens < 10_000) {
		const rounded = thousands.toFixed(1).replace(/\.0$/, "");
		return `~${rounded}k`;
	}
	return `~${Math.round(thousands)}k`;
}

export function formatPreviewHeader(input: PreviewHeaderInput): string {
	return `${formatCount(input.tokens)} tokens · ${formatCount(input.chars)} chars · ${input.label}`;
}

export function truncatePreviewBody(
	text: string,
	tokens: number,
	maxHeadChars = DEFAULT_HEAD_CHARS,
): string {
	if (text.length <= maxHeadChars) return text;

	const head = text.slice(0, maxHeadChars);
	const remainingChars = text.length - maxHeadChars;
	const remainingTokens = Math.max(
		0,
		Math.round(tokens * (remainingChars / text.length)),
	);
	return `${head}\n… [${formatRemainingTokens(remainingTokens)} more tokens]`;
}

export interface PreviewSelection {
	label: string;
	tokens: number;
	content: string;
}

export function buildPreviewContentLines(
	selection: PreviewSelection | null,
	treeLineCount: number,
): string[] {
	const lineCount = Math.max(treeLineCount, 1);
	if (!selection) {
		return Array.from({ length: lineCount }, (_, index) =>
			index === 0 ? "(select a row)" : "",
		);
	}

	const header = formatPreviewHeader({
		label: selection.label,
		tokens: selection.tokens,
		chars: selection.content.length,
	});
	const body = truncatePreviewBody(selection.content, selection.tokens);
	const lines = [header, ...body.split("\n")];

	while (lines.length < lineCount) lines.push("");
	if (lines.length > lineCount) lines.length = lineCount;
	return lines;
}
