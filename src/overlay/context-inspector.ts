import type { ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";
import type { Theme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
import type { AgentSession } from "@oh-my-pi/pi-coding-agent/session/agent-session";
import type { Component } from "@oh-my-pi/pi-tui/tui";
import { buildContextTree } from "../context-tree/build-context-tree.js";
import { formatVisibleTreeRow } from "../context-tree/format-tree-row.js";
import { TreeNavigator } from "../context-tree/tree-navigator.js";
import type { ContextTree } from "../context-tree/types.js";
import { formatContextFooter } from "./category-rollup.js";
import { renderContextInspectorLayout } from "./layout.js";
import { resolveMainSession } from "../resolve-main-session.js";

function matchesArrow(data: string, direction: "left" | "right"): boolean {
  return data === (direction === "left" ? "\x1b[D" : "\x1b[C")
    || data === (direction === "left" ? "\x1b[OD" : "\x1b[OC");
}

interface OverlayKeybindings {
  matches(data: string, keybinding: string): boolean;
}

export interface ContextInspectorSnapshot {
  tree: ContextTree;
  usedTokens: number;
  contextWindow: number;
}

export function buildContextInspectorSnapshot(session: AgentSession): ContextInspectorSnapshot {
  const tree = buildContextTree(session);
  return {
    tree,
    usedTokens: tree.usedTokens,
    contextWindow: tree.contextWindow,
  };
}

export function createContextInspectorOverlay(
  theme: Theme,
  keybindings: OverlayKeybindings,
  done: (result: undefined) => void,
  snapshot: ContextInspectorSnapshot,
): Component {
  const navigator = new TreeNavigator(snapshot.tree);

  const buildPreviewLines = (treeLineCount: number): string[] => {
    const selected = navigator.getVisibleRows().find((row) => row.id === navigator.selectedId);
    return Array.from({ length: treeLineCount }, (_, index) => {
      if (index !== 0) return "";
      if (!selected) return theme.fg("dim", "(select a row)");
      return theme.fg("dim", `${selected.label} · ${selected.tokens} tokens`);
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
      const rows = navigator.getVisibleRows();
      const treeLines = rows.map((row) =>
        theme.fg("text", formatVisibleTreeRow(row, row.id === navigator.selectedId)),
      );
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
