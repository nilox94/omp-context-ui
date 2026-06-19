import {
	Ellipsis,
	padding,
	truncateToWidth,
	visibleWidth,
} from "@oh-my-pi/pi-tui";

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

export interface ContextInspectorColumnWidths {
	treeWidth: number;
	previewWidth: number;
	safeWidth: number;
}

export function getContextInspectorColumnWidths(
	width: number,
): ContextInspectorColumnWidths {
	const safeWidth = Math.max(1, width);
	const separatorWidth = SEPARATOR.length;
	const available = Math.max(TREE_MIN_WIDTH + PREVIEW_MIN_WIDTH, safeWidth);
	const treeWidth = Math.max(TREE_MIN_WIDTH, Math.floor(available * 0.4));
	const previewWidth = Math.max(
		PREVIEW_MIN_WIDTH,
		available - treeWidth - separatorWidth,
	);
	return { treeWidth, previewWidth, safeWidth };
}

function padColumn(text: string, width: number): string {
	if (width <= 0) return "";
	const visible = visibleWidth(text);
	if (visible >= width) {
		return truncateToWidth(text, width, Ellipsis.Unicode);
	}
	return text + padding(width - visible);
}

function pairColumns(
	treeLine: string,
	previewLine: string,
	treeWidth: number,
	previewWidth: number,
	safeWidth: number,
): string {
	const row =
		padColumn(treeLine, treeWidth) +
		SEPARATOR +
		padColumn(previewLine, previewWidth);
	return truncateToWidth(row, safeWidth, Ellipsis.Omit);
}

export function renderContextInspectorLayout(
	width: number,
	labels: ContextInspectorLayoutLabels,
): string[] {
	const { treeWidth, previewWidth, safeWidth } =
		getContextInspectorColumnWidths(width);

	const headerLine = truncateToWidth(labels.title, safeWidth, Ellipsis.Omit);
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
	const footerLine = truncateToWidth(labels.footer, safeWidth, Ellipsis.Omit);
	const rule = "─".repeat(safeWidth);

	return [headerLine, rule, bodyLine, ...contentLines, rule, footerLine];
}
