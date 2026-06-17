import { computeContextBreakdown } from "@oh-my-pi/pi-coding-agent/modes/utils/context-usage";
import type { ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";
import type { Theme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
import type { Component } from "@oh-my-pi/pi-tui/tui";
import {
  buildCategoryRowsFromBreakdown,
  formatCategoryRow,
  formatContextFooter,
  type CategoryRow,
} from "./category-rollup.js";
import { renderContextInspectorLayout } from "./layout.js";
import { resolveMainSession } from "../resolve-main-session.js";

interface OverlayKeybindings {
  matches(data: string, keybinding: string): boolean;
}

export interface ContextInspectorSnapshot {
  categoryRows: CategoryRow[];
  usedTokens: number;
  contextWindow: number;
}

export function buildContextInspectorSnapshot(session: Parameters<typeof computeContextBreakdown>[0]): ContextInspectorSnapshot {
  const breakdown = computeContextBreakdown(session);
  return {
    categoryRows: buildCategoryRowsFromBreakdown(breakdown),
    usedTokens: breakdown.usedTokens,
    contextWindow: breakdown.contextWindow,
  };
}

export function createContextInspectorOverlay(
  theme: Theme,
  keybindings: OverlayKeybindings,
  done: (result: undefined) => void,
  snapshot: ContextInspectorSnapshot,
): Component {
  return {
    handleInput(data: string) {
      if (keybindings.matches(data, "app.interrupt")) {
        done(undefined);
      }
    },

    render(width: number): readonly string[] {
      const treeLines = snapshot.categoryRows.map((row) => theme.fg("text", formatCategoryRow(row)));
      const previewLines = snapshot.categoryRows.map((_row, index) =>
        index === 0 ? theme.fg("dim", "(select a row)") : "",
      );

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

export async function openContextInspectorOverlay(ctx: ExtensionCommandContext): Promise<void> {
  let snapshot: ContextInspectorSnapshot;
  try {
    const session = resolveMainSession(ctx);
    snapshot = buildContextInspectorSnapshot(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ctx.ui.notify(message, "error");
    return;
  }

  await ctx.ui.custom<undefined>(
    (_tui, theme, keybindings, done) => createContextInspectorOverlay(theme, keybindings, done, snapshot),
    { overlay: true },
  );
}
