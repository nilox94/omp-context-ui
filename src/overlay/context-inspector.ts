import type { ExtensionCommandContext } from "@oh-my-pi/pi-coding-agent/extensibility/extensions/types";
import type { Theme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
import type { Component } from "@oh-my-pi/pi-tui/tui";
import { renderContextInspectorLayout } from "./layout.js";

interface OverlayKeybindings {
  matches(data: string, keybinding: string): boolean;
}

export function createContextInspectorOverlay(
  theme: Theme,
  keybindings: OverlayKeybindings,
  done: (result: undefined) => void,
): Component {
  return {
    handleInput(data: string) {
      if (keybindings.matches(data, "app.interrupt")) {
        done(undefined);
      }
    },

    render(width: number): readonly string[] {
      return renderContextInspectorLayout(width, {
        title: theme.fg("accent", theme.bold("Context Inspector")),
        treeLabel: theme.fg("muted", "Tree"),
        previewLabel: theme.fg("muted", "Preview"),
        treeBody: theme.fg("dim", "(no rows yet)"),
        previewBody: theme.fg("dim", "(select a row)"),
        footer: theme.fg("muted", "↑/↓ move · ←/→ expand · Esc close"),
      });
    },
  };
}

export async function openContextInspectorOverlay(ctx: ExtensionCommandContext): Promise<void> {
  await ctx.ui.custom<undefined>(
    (_tui, theme, keybindings, done) => createContextInspectorOverlay(theme, keybindings, done),
    { overlay: true },
  );
}
