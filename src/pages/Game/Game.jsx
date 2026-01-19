import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import handleKeys from "../../functions/handleKeys";

export default function Game() {
  // Input variables.
  const viewport_ratio = "1/1";
  const map_ratio = "3/1";
  const height_per_sec = 0.5;

  const map_ratio_split = map_ratio.split("/").map(Number);

  const [MapOffset, setMapOffset] = useState({ x: 0, y: 0 });

  const viewportRef = useRef(null);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      setViewSize({ w: el.clientWidth, h: el.clientHeight });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const keys_ref = handleKeys();

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;

      const keys = keys_ref.current;

      // Direction from keys (updates every frame)
      let dx = 0;
      let dy = 0;

      if (keys.has("w") || keys.has("arrowup")) dy -= 1;
      if (keys.has("s") || keys.has("arrowdown")) dy += 1;
      if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
      if (keys.has("d") || keys.has("arrowright")) dx += 1;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        // Speed: percentage of viewport height per second (converted to px/sec)
        // Example: 0.6 means "60% of viewport height per second"
        const px_per_sec = viewSize.h * height_per_sec;

        // Move MAP opposite to intended player direction
        setMapOffset((p) => ({
          x: p.x - dx * px_per_sec * dt,
          y: p.y - dy * px_per_sec * dt,
        }));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [keys_ref, viewSize.h]);

  return (
    <div className={cl(styles, "background")}>
      <div
        ref={viewportRef}
        className={cl(styles, "viewport", "setCentre")}
        style={{ aspectRatio: viewport_ratio }}
      >
        <div
          className={cl(styles, "map")}
          style={{
            transform: `translate(calc(-50% + ${MapOffset.x}px), calc(-50% + ${MapOffset.y}px))`,
            width: `${map_ratio_split[0] * 100}%`,
            height: `${map_ratio_split[1] * 100}%`,
          }}
        >
          <div className={cl(styles, "bug")} />
        </div>

        <div className={cl(styles, "bat", "setCentre")} />
      </div>
    </div>
  );
}
