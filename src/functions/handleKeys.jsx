import { useEffect, useRef } from "react";

export default function handleKeys() {
  const keys_ref = useRef(new Set());
  const control_keys = [
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
    const keys = keys_ref.current;

    // Handle key press.
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      if (control_keys.includes(key)) {
        event.preventDefault();
        keys_ref.current.add(key);
        console.log(key);
      }
    };

    // Handle key release.
    const handleKeyUp = (event) => {
      const key = event.key.toLowerCase();
      keys_ref.current.delete(key);
    };

    let dx = 0;
    let dy = 0;
    if (keys.has("w") || keys.has("arrowup")) dy -= 1;
    if (keys.has("s") || keys.has("arrowdown")) dy += 1;
    if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
    if (keys.has("d") || keys.has("arrowright")) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const dir_root = Math.hypot(dx, dy);
      dx /= dir_root;
      dy /= dir_root;
    }

    // Add listener events upon load.
    document.addEventListener("keydown", handleKeyDown, { passive: false });
    document.addEventListener("keyup", handleKeyUp);

    // Remove listener events upon exit.
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys_ref;
}
