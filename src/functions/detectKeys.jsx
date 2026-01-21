import { useEffect, useRef } from "react";

export default function detectKeys() {
  // Create new reference with an empty set.
  const KeysRef = useRef(new Set());

  // Set accepted inputs.
  const ControlKeys = [
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    " ",
  ];

  // Key detector:
  useEffect(() => {
    // Detect key press.
    const handleKeyDown = (event) => {
      const Key = event.key.toLowerCase();
      if (ControlKeys.includes(Key)) {
        event.preventDefault();
        KeysRef.current.add(Key);
      }
    };

    // Detect key release.
    const handleKeyUp = (event) => {
      const Key = event.key.toLowerCase();
      KeysRef.current.delete(Key);
    };

    // Add listener events on load.
    document.addEventListener("keydown", handleKeyDown, { passive: false });
    document.addEventListener("keyup", handleKeyUp);

    // Remove listener events on unload.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return KeysRef;
}
