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
