import type { ExtensionCommandContext, Theme } from "@oh-my-pi/pi-coding-agent";
import { applyBackgroundToLine, type Component } from "@oh-my-pi/pi-tui";
import { createContextSessionSource } from "../context-session-source";
import { buildContextTree } from "../context-tree/build-context-tree";
import { buildPreviewIndex } from "../context-tree/build-preview-index";
import { formatVisibleTreeRow } from "../context-tree/format-tree-row";
import {
	type Tier,
	tierForRow,
	tierThemeColor,
} from "../context-tree/tier-for-row";
import { TreeNavigator } from "../context-tree/tree-navigator";
import type { ContextTree } from "../context-tree/types";
import { formatContextFooter } from "./category-rollup";
import {
	getContextInspectorColumnWidths,
	renderContextInspectorLayout,
} from "./layout";
import { buildPreviewContentLines } from "./preview-pane";

function matchesArrow(data: string, direction: "left" | "right"): boolean {
	return (
		data === (direction === "left" ? "\x1b[D" : "\x1b[C") ||
		data === (direction === "left" ? "\x1b[OD" : "\x1b[OC")
	);
}

interface OverlayKeybindings {
	matches(data: string, keybinding: string): boolean;
}

export interface ContextInspectorSnapshot {
	tree: ContextTree;
	previewIndex: ReadonlyMap<string, string>;
	usedTokens: number;
	contextWindow: number;
}

export function buildContextInspectorSnapshot(
	ctx: ExtensionCommandContext,
): ContextInspectorSnapshot {
	const source = createContextSessionSource(ctx);
	const tree = buildContextTree(source);
	const previewIndex = buildPreviewIndex(source, tree);
	const usage = ctx.getContextUsage();

	return {
		tree,
		previewIndex,
		usedTokens: usage?.tokens ?? tree.usedTokens,
		contextWindow: usage?.contextWindow ?? tree.contextWindow,
	};
}

function styleTreeRow(
	theme: Theme,
	line: string,
	tier: Tier,
	selected: boolean,
	treeWidth: number,
): string {
	const color = tierThemeColor(tier);
	const styled = selected
		? theme.bold(theme.fg(color, line))
		: theme.fg(color, line);
	if (!selected) return styled;
	return applyBackgroundToLine(styled, treeWidth, (text) =>
		theme.bg("selectedBg", text),
	);
}

export function createContextInspectorOverlay(
	theme: Theme,
	keybindings: OverlayKeybindings,
	done: (result: undefined) => void,
	snapshot: ContextInspectorSnapshot,
): Component {
	const navigator = new TreeNavigator(snapshot.tree);

	const buildPreviewLines = (treeLineCount: number): string[] => {
		const selected = navigator
			.getVisibleRows()
			.find((row) => row.id === navigator.selectedId);
		const selection = selected
			? {
					label: selected.label,
					tokens: selected.tokens,
					content: snapshot.previewIndex.get(selected.id) ?? "",
				}
			: null;
		const plainLines = buildPreviewContentLines(selection, treeLineCount);

		return plainLines.map((line, index) => {
			if (!line) return "";
			if (!selected) return theme.fg("dim", line);
			const tier = tierForRow(selected.categoryId, selected.tokens);
			if (index === 0) return theme.fg(tierThemeColor(tier), line);
			return theme.fg("text", line);
		});
	};

	return {
		handleInput(data: string) {
			if (keybindings.matches(data, "tui.select.up")) {
				navigator.moveSelection(-1);
				return;
			}
			if (keybindings.matches(data, "tui.select.down")) {
				navigator.moveSelection(1);
				return;
			}
			if (matchesArrow(data, "right")) {
				navigator.expandSelected();
				return;
			}
			if (matchesArrow(data, "left")) {
				navigator.collapseSelected();
				return;
			}
			if (keybindings.matches(data, "tui.select.cancel")) {
				if (navigator.back() === "close") done(undefined);
				return;
			}
			if (keybindings.matches(data, "app.interrupt")) {
				done(undefined);
			}
		},

		render(width: number): readonly string[] {
			const { treeWidth } = getContextInspectorColumnWidths(width);
			const rows = navigator.getVisibleRows();
			const treeLines = rows.map((row) => {
				const selected = row.id === navigator.selectedId;
				const line = formatVisibleTreeRow(row, selected);
				const tier = tierForRow(row.categoryId, row.tokens);
				return styleTreeRow(theme, line, tier, selected, treeWidth);
			});
			const previewLines = buildPreviewLines(Math.max(treeLines.length, 1));

			return renderContextInspectorLayout(width, {
				title: theme.fg("accent", theme.bold("Context Inspector")),
				treeLabel: theme.fg("muted", "Tree"),
				previewLabel: theme.fg("muted", "Preview"),
				treeLines,
				previewLines,
				footer: theme.fg(
					"muted",
					`${formatContextFooter(snapshot.usedTokens, snapshot.contextWindow)} · ↑/↓ move · ←/→ expand · Esc close`,
				),
			});
		},
	};
}

export async function openContextInspectorOverlay(
	ctx: ExtensionCommandContext,
): Promise<void> {
	const snapshot = buildContextInspectorSnapshot(ctx);

	await ctx.ui.custom<undefined>(
		(_tui, theme, keybindings, done) =>
			createContextInspectorOverlay(theme, keybindings, done, snapshot),
		{ overlay: true },
	);
}
