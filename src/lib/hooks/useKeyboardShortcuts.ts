import { useEffect } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * useKeyboardShortcuts
 * Bind keyboard shortcuts (Ctrl+key, Cmd+key, etc.)
 *
 * Usage:
 * useKeyboardShortcuts({
 *   "ctrl+enter": handleRunCode,
 *   "cmd+s": handleExport,
 * });
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Build modifier string
      const modifiers: string[] = [];
      if (event.ctrlKey) modifiers.push("ctrl");
      if (event.metaKey) modifiers.push("cmd");
      if (event.altKey) modifiers.push("alt");
      if (event.shiftKey) modifiers.push("shift");

      const key = event.key.toLowerCase();
      const shortcutKey = modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;

      if (shortcuts[shortcutKey]) {
        event.preventDefault();
        shortcuts[shortcutKey]();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}
