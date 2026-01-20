import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import handleKeys from "../../functions/handleKeys";

export default function Game() {
  // Set input variables
  const ViewportRatio = "1/1";
  const MapRatio = "3/1";
  const HeightPerSec = 0.5;

  // Fetch data from handleKeys
  const KeysRef = handleKeys();

  // Split map ratio to two number
  const MapRatioSplit = MapRatio.split("/").map(Number);

  // VIEWPORT DATA CONTROL
  const ViewportRef = useRef(null);
  const [ViewSize, setViewSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    // Define viewport as "Elm"
    const Elm = ViewportRef.current;
    if (!Elm) return;

    // Fetch viewport size
    const update = () =>
      setViewSize({ w: Elm.clientWidth, h: Elm.clientHeight });
    update();

    // Update data when "Elm" is resized
    const RO = new ResizeObserver(update);
    RO.observe(Elm);

    // Disconnect RO function upon unload
    return () => RO.disconnect();
  }, []);

  // Use ViewSize and MapRatio to control map size
  const MapSize = {
    w: ViewSize.w * MapRatioSplit[0],
    h: ViewSize.h * MapRatioSplit[1],
  };

  // BAT POSITION CONTROL
  const [BatPos, setBatPos] = useState({ x: 0.5, y: 0.5 });
  useEffect(() => {
    let AnimFrame = 0;
    let LastFrame = performance.now();

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const tick = (CurrentFrame) => {
      const dt = (CurrentFrame - LastFrame) / 1000;
      LastFrame = CurrentFrame;

      const keys = KeysRef.current;

      let dx = 0;
      let dy = 0;

      if (keys.has("w") || keys.has("arrowup")) dy -= 1;
      if (keys.has("s") || keys.has("arrowdown")) dy += 1;
      if (keys.has("a") || keys.has("arrowleft")) dx -= 1;
      if (keys.has("d") || keys.has("arrowright")) dx += 1;

      if ((dx !== 0 || dy !== 0) && ViewSize.h && MapSize.w && MapSize.h) {
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;

        const dNormX = (dx * HeightPerSec * dt) / MapRatioSplit[0];
        const dNormY = (dy * HeightPerSec * dt) / MapRatioSplit[1];

        setBatPos((p) => ({
          x: clamp01(p.x + dNormX),
          y: clamp01(p.y + dNormY),
        }));
      }
      AnimFrame = requestAnimationFrame(tick);
    };
    AnimFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(AnimFrame);
  }, [KeysRef, ViewSize.h, MapSize.w, MapSize.h, HeightPerSec]);

  return (
    <div className={cl(styles, "background")}>
      <div
        ref={ViewportRef}
        className={cl(styles, "viewport", "setCentre")}
        style={{ aspectRatio: ViewportRatio }}
      >
        <div
          className={cl(styles, "map")}
          style={{
            transform: `translate(-50%, -50%)`,
            width: `${MapRatioSplit[0] * 100}%`,
            height: `${MapRatioSplit[1] * 100}%`,
          }}
        >
          <div className={cl(styles, "bug")} />
          <div
            className={cl(styles, "bat")}
            style={{
              left: `${BatPos.x * 100}%`,
              top: `${BatPos.y * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
