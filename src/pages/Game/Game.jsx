import { useEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import { clampPosition } from "../../functions/clampPosition";

const controlKeys = [
  "w",
  "a",
  "s",
  "d",
  "arrowup",
  "arrowleft",
  "arrowdown",
  "arrowright",
];

export default function Game() {
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  const mapWidth = viewSize.w * 2;
  const mapHeight = viewSize.h * 1;
  const base = Math.min(viewSize.w, viewSize.h);
  const pixPerSec = base * 0.5;

  const [plrPos, setPlrPos] = useState({ x: mapWidth / 2, y: mapHeight / 2 });

  useEffect(() => {
    if (mapWidth === 0 || mapHeight === 0) return;
    setPlrPos({ x: mapWidth / 2, y: mapHeight / 2 });
  }, [mapWidth, mapHeight]);

  useEffect(() => {
    const update = () =>
      setViewSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const halfW = viewSize.w / 2;
  const halfH = viewSize.h / 2;
  const camPos = {
    x: Math.max(halfW, Math.min(mapWidth - halfW, plrPos.x)),
    y: Math.max(halfH, Math.min(mapHeight - halfH, plrPos.y)),
  };

  const viewportRef = useRef(null);
  const keysRef = useRef(new Set());

  useEffect(() => {
    // Detect and store key presses.
    const onDown = (input) => {
      const key = input.key.toLowerCase();

      if (controlKeys.includes(key)) {
        input.preventDefault();
        keysRef.current.add(key);
        console.log("Pressed: " + key);
      }
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

  useEffect(() => {
    let animFrame = 0;
    let timeLast = performance.now();

    const tick = (timeNow) => {
      const timePassed = (timeNow - timeLast) / 1000;
      timeLast = timeNow;

      const keys = keysRef.current;

      let dx = 0;
      let dy = 0;

      if (keys.has("w") || keys.has("arrowup")) dy -= 1;
      if (keys.has("s") || keys.has("arrowdown")) dy += 1;
      if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
      if (keys.has("d") || keys.has("arrowright")) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const dirRoot = Math.hypot(dx, dy);
        dx /= dirRoot;
        dy /= dirRoot;

        setPlrPos((pos) => {
          const nextPos = {
            x: pos.x + dx * pixPerSec * timePassed,
            y: pos.y + dy * pixPerSec * timePassed,
          };

          return clampPosition(nextPos, { maxX: mapWidth, maxY: mapHeight });
        });
      }

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [pixPerSec, mapWidth, mapHeight]);

  // Styles.
  const worldStyle = {
    width: `${mapWidth}px`,
    height: `${mapHeight}px`,
    transform: `translate(${halfW - camPos.x}px, ${halfH - camPos.y}px)`,
  };
  const playerStyle = {
    left: `${halfW + (plrPos.x - camPos.x)}px`,
    top: `${halfH + (plrPos.y - camPos.y)}px`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div className={cl(styles, "viewport")} ref={viewportRef}>
      <div className={cl(styles, "debug")}>
        x: {plrPos.x.toFixed(0)} y: {plrPos.y.toFixed(0)}
      </div>
      <div className={cl(styles, "world")} style={worldStyle}>
        <div
          className={cl(styles, "bug")}
          style={{ left: mapWidth * 0.9, top: mapHeight * 0.3 }}
        />
      </div>

      <div className={cl(styles, "player")} style={playerStyle} />
    </div>
  );
}
