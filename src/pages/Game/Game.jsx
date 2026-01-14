import { useEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";

export default function Game() {
  const [plrPos, setPlrPos] = useState({ x: 0, y: 0 });

  const viewportRef = useRef(null);
  const keysRef = useRef(new Set());

  console.log("test!");

  useEffect(() => {
    // Detect and store key presses.
    const onDown = (input) => {
      input.preventDefault();
      const key = input.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowleft",
          "arrowdown",
          "arrowright",
        ].includes(key)
      ) {
        keysRef.current.add(key);
      }
      console.log("Pressed: " + key);
    };

    // Detect and delete key releases.
    const onUp = (input) => {
      const key = input.key.toLowerCase();
      keysRef.current.delete(key);
      console.log("Released: " + key);
    };

    // Add events on startup.
    window.addEventListener("keydown", onDown, { passive: false });
    window.addEventListener("keyup", onUp);

    return () => {
      // Disconnect events on cleanup.
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return (
    <div className={cl(styles, "viewport")} ref={viewportRef}>
      <div className={cl(styles, "world")}>
        <div className={cl(styles, "bug")} style={{ left: 900, top: 300 }} />
      </div>

      <div className={cl(styles, "player")} />

      <div className={styles.debug}>
        x: {plrPos.x.toFixed(0)} y: {plrPos.y.toFixed(0)}
      </div>
    </div>
  );
}
