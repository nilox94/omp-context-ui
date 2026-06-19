import {
	formatApproxTokens,
	formatCategoryRow,
} from "../overlay/category-rollup";
import type { VisibleTreeRow } from "./tree-navigator";

const INDENT = "  ";
/** Reserved left column so the selection cursor never shifts row content. */
const CURSOR_SELECTED = "› ";
const CURSOR_BLANK = "  ";

export function formatVisibleTreeRow(
	row: VisibleTreeRow,
	selected: boolean,
): string {
	const cursor = selected ? CURSOR_SELECTED : CURSOR_BLANK;
	const prefix = row.hasChildren ? (row.expanded ? "▾ " : "▸ ") : "  ";
	const indent = INDENT.repeat(row.depth);
	const label = `${cursor}${indent}${prefix}${row.label}`;
	return `${label}  ${formatApproxTokens(row.tokens)}`;
}

export function formatCategoryHeader(label: string, tokens: number): string {
	return formatCategoryRow({ label, tokens });
}
