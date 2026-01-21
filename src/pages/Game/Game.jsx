import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import detectKeys from "../../functions/detectKeys";
import { moveMap } from "../../functions/moveMap";

export default function Game() {
  // Set input variables.
  const ViewportRatio = "1/1";
  const MapRatio = "3/1";
  const HeightPerSec = 0.5;

  // Fetch data from handleKeys.
  const KeysRef = detectKeys();

  // Split map ratio to two number.
  const MapRatioSplit = MapRatio.split("/").map(Number);

  // viewport data control:
  const ViewportRef = useRef(null);
  const [ViewSize, setViewSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    // Define viewport as "Elm".
    const Elm = ViewportRef.current;
    if (!Elm) return;

    // Fetch viewport size.
    const updateViewport = () =>
      setViewSize({ w: Elm.clientWidth, h: Elm.clientHeight });
    updateViewport();

    // Update viewport data when "Elm" is resized.
    const RO = new ResizeObserver(updateViewport);
    RO.observe(Elm);

    // Disconnect RO function upon unload.
    return () => RO.disconnect();
  }, []);

  // Use ViewSize and MapRatio to control map size.
  const MapSize = {
    w: ViewSize.w * MapRatioSplit[0],
    h: ViewSize.h * MapRatioSplit[1],
  };

  // Centre bat on load.
  const [BatPos, setBatPos] = useState({ X: 0.5, Y: 0.5 });

  // Movement control:
  useEffect(() => {
    // Define frame variables.
    let AnimFrame = 0;
    let LastFrame = performance.now();

    // Keep value between 0 and 1. Return biggest number between 0-v, and smallest between 1-v.
    const clampPercent = (v) => Math.max(0, Math.min(1, v));

    // Frame ticker:
    const Tick = (CurrentFrame) => {
      // Get time since last frame, in seconds. (Uses millisecond timestamp provided by frame.)
      const Delta = (CurrentFrame - LastFrame) / 1000;
      LastFrame = CurrentFrame;

      // Define direction values.
      let DireX = 0;
      let DireY = 0;

      // Get direction from held keys.
      const Keys = KeysRef.current;
      if (Keys.has("w") || Keys.has("arrowup")) DireY -= 1;
      if (Keys.has("s") || Keys.has("arrowdown")) DireY += 1;
      if (Keys.has("a") || Keys.has("arrowleft")) DireX -= 1;
      if (Keys.has("d") || Keys.has("arrowright")) DireX += 1;

      // If player is moving, and world data exists:
      if (
        (DireX !== 0 || DireY !== 0) &&
        ViewSize.h &&
        MapSize.w &&
        MapSize.h
      ) {
        // Get magnitude to prevent diagonal speed increase.
        const Magnitude = Math.hypot(DireX, DireY);

        // Get correct distance based on all data.
        const DistX =
          ((DireX / Magnitude) * HeightPerSec * Delta) / MapRatioSplit[0];
        const DistY =
          ((DireY / Magnitude) * HeightPerSec * Delta) / MapRatioSplit[1];

        // Update bat position.
        setBatPos((Pos) => ({
          X: clampPercent(Pos.X + DistX),
          Y: clampPercent(Pos.Y + DistY),
        }));
      }
      AnimFrame = requestAnimationFrame(Tick);
    };
    AnimFrame = requestAnimationFrame(Tick);

    return () => cancelAnimationFrame(AnimFrame);
  }, [KeysRef, ViewSize.h, MapSize.w, MapSize.h, HeightPerSec]);

  // Fetch data from moveMap.
  const { MapPercentX, MapPercentY } = moveMap({
    BatX: BatPos.X,
    BatY: BatPos.Y,
  });

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
            left: `50%`,
            top: `50%`,
            transform: `translate(calc(-50% + ${MapPercentX}%), calc(-50% + ${MapPercentY}%))`,
            width: `${MapRatioSplit[0] * 100}%`,
            height: `${MapRatioSplit[1] * 100}%`,
          }}
        >
          <div className={cl(styles, "bug")} />
          <div
            className={cl(styles, "bat")}
            style={{
              left: `${BatPos.X * 100}%`,
              top: `${BatPos.Y * 100}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
