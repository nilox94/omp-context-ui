import { formatApproxTokens, formatCategoryRow } from "../overlay/category-rollup.js";
import type { VisibleTreeRow } from "./tree-navigator.js";

const INDENT = "  ";

export function formatVisibleTreeRow(row: VisibleTreeRow, selected: boolean): string {
  const prefix = row.hasChildren ? (row.expanded ? "▾ " : "▸ ") : "  ";
  const indent = INDENT.repeat(row.depth);
  const marker = selected ? "› " : "";
  const label = `${indent}${marker}${prefix}${row.label}`;
  return `${label}  ${formatApproxTokens(row.tokens)}`;
}

export function formatCategoryHeader(label: string, tokens: number): string {
  return formatCategoryRow({ label, tokens });
}
