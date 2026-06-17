import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  __resetContextUiRegistrationForTests,
  registerContextUiCommand,
} from "../src/register-context-ui.js";

describe("registerContextUiCommand", () => {
  beforeEach(() => {
    __resetContextUiRegistrationForTests();
  });

  it("registers /context-ui only when hasUI is true", () => {
    const registerCommand = vi.fn();
    const pi = { registerCommand, on: vi.fn() } as never;

    registerContextUiCommand(pi, { hasUI: false });
    expect(registerCommand).not.toHaveBeenCalled();

    registerContextUiCommand(pi, { hasUI: true });
    expect(registerCommand).toHaveBeenCalledOnce();
    expect(registerCommand).toHaveBeenCalledWith(
      "context-ui",
      expect.objectContaining({
        description: expect.any(String),
        handler: expect.any(Function),
      }),
    );
  });

  it("does not register twice when called repeatedly with hasUI", () => {
    const registerCommand = vi.fn();
    const pi = { registerCommand, on: vi.fn() } as never;

    registerContextUiCommand(pi, { hasUI: true });
    registerContextUiCommand(pi, { hasUI: true });

    expect(registerCommand).toHaveBeenCalledOnce();
  });
});
