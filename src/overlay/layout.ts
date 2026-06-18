export interface ContextInspectorLayoutLabels {
	title: string;
	treeLabel: string;
	previewLabel: string;
	treeLines: string[];
	previewLines: string[];
	footer: string;
}

const TREE_MIN_WIDTH = 24;
const PREVIEW_MIN_WIDTH = 24;
const SEPARATOR = " │ ";

function truncate(text: string, width: number): string {
	if (width <= 0) return "";
	if (text.length <= width) return text;
	if (width <= 1) return text.slice(0, width);
	return `${text.slice(0, width - 1)}…`;
}

function padColumn(text: string, width: number): string {
	return truncate(text, width).padEnd(width, " ");
}

function pairColumns(
	treeLine: string,
	previewLine: string,
	treeWidth: number,
	previewWidth: number,
	safeWidth: number,
): string {
	return truncate(
		padColumn(treeLine, treeWidth) +
			SEPARATOR +
			padColumn(previewLine, previewWidth),
		safeWidth,
	);
}

export function renderContextInspectorLayout(
	width: number,
	labels: ContextInspectorLayoutLabels,
): string[] {
	const safeWidth = Math.max(1, width);
	const separatorWidth = SEPARATOR.length;
	const available = Math.max(TREE_MIN_WIDTH + PREVIEW_MIN_WIDTH, safeWidth);
	const treeWidth = Math.max(TREE_MIN_WIDTH, Math.floor(available * 0.4));
	const previewWidth = Math.max(
		PREVIEW_MIN_WIDTH,
		available - treeWidth - separatorWidth,
	);

	const headerLine = truncate(labels.title, safeWidth);
	const bodyLine = pairColumns(
		labels.treeLabel,
		labels.previewLabel,
		treeWidth,
		previewWidth,
		safeWidth,
	);
	const rowCount = Math.max(
		labels.treeLines.length,
		labels.previewLines.length,
		1,
	);
	const contentLines = Array.from({ length: rowCount }, (_, index) =>
		pairColumns(
			labels.treeLines[index] ?? "",
			labels.previewLines[index] ?? "",
			treeWidth,
			previewWidth,
			safeWidth,
		),
	);
	const footerLine = truncate(labels.footer, safeWidth);
	const rule = "─".repeat(safeWidth);

	return [headerLine, rule, bodyLine, ...contentLines, rule, footerLine];
}
