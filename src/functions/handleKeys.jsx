import { useEffect, useRef } from "react";

export default function handleKeys() {
  const KeysRef = useRef(new Set());
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

  // Run once on page load.
  useEffect(() => {
    // Handle key press.
    const handleKeyDown = (event) => {
      const Key = event.key.toLowerCase();
      if (ControlKeys.includes(Key)) {
        event.preventDefault();
        KeysRef.current.add(Key);
        console.log(Key);
      }
    };

    // Handle key release.
    const handleKeyUp = (event) => {
      const Key = event.key.toLowerCase();
      KeysRef.current.delete(Key);
    };

    // Add listener events upon load.
    document.addEventListener("keydown", handleKeyDown, { passive: false });
    document.addEventListener("keyup", handleKeyUp);

    // Remove listener events upon exit.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return KeysRef;
}
