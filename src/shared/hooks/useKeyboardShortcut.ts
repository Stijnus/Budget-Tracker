import { useEffect, useCallback, useRef } from "react";

type KeyHandler = (event: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

interface KeyboardShortcutOptions {
  preventDefault?: boolean;
  stopPropagation?: boolean;
  keyevent?: "keydown" | "keyup" | "keypress";
  disabled?: boolean;
}

/**
 * Hook for handling keyboard shortcuts
 */
export function useKeyboardShortcut(
  keyMap: KeyMap,
  options: KeyboardShortcutOptions = {}
) {
  const {
    preventDefault = true,
    stopPropagation = true,
    keyevent = "keydown",
    disabled = false,
  } = options;

  // Use a ref to store the keyMap to avoid unnecessary effect triggers
  const keyMapRef = useRef<KeyMap>(keyMap);
  keyMapRef.current = keyMap;

  const handleKey = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Skip if the event target is an input, textarea, or select
      if (
        event.target instanceof HTMLElement &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.tagName === "SELECT" ||
          event.target.isContentEditable)
      ) {
        return;
      }

      // Create a key string that includes modifiers
      const modifiers = [];
      if (event.ctrlKey) modifiers.push("ctrl");
      if (event.altKey) modifiers.push("alt");
      if (event.shiftKey) modifiers.push("shift");
      if (event.metaKey) modifiers.push("meta");

      const key = event.key.toLowerCase();
      const keyString = [...modifiers, key].join("+");

      // Check if the key combination is in our map
      const handler = keyMapRef.current[keyString];
      if (handler) {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        handler(event);
      }
    },
    [disabled, preventDefault, stopPropagation]
  );

  useEffect(() => {
    window.addEventListener(keyevent, handleKey);
    return () => {
      window.removeEventListener(keyevent, handleKey);
    };
  }, [keyevent, handleKey]);
}
