//Game.jsx

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import detectKeys from "../../functions/detectKeys";
import { moveMap } from "../../functions/moveMap";
import { doScan } from "../../functions/doScan";

export default function Game() {
  // Set input variables.
  const ViewportRatio = "1/1";
  const MapRatio = "3/1";
  const HeightPerSec = 0.5;
  const ScanCooldown = 3;

  // Split map ratio to two number.
  const MapRatioSplit = MapRatio.split("/").map(Number);

  // Start values:
  const KeysRef = detectKeys();
  const RemainingCooldown = useRef(0);
  const [Scans, setScans] = useState([]);
  const ViewportRef = useRef(null);
  const [ViewSize, setViewSize] = useState({ W: 0, H: 0 });
  const [BatPos, setBatPos] = useState({ X: 0.5, Y: 0.5 });
  const [BugPos, setBugPos] = useState({ X: 0.5, Y: 0.75 });
  //

  useEffect(() => {
    console.log("Scans updated:", Scans);
  }, [Scans]);

  // viewport data control:
  useLayoutEffect(() => {
    // Get viewport. Check if it exists.
    const Elm = ViewportRef.current;
    if (!Elm) return;

    // Fetch viewport size.
    const updateViewport = () =>
      setViewSize({ W: Elm.clientWidth, H: Elm.clientHeight });
    updateViewport();

    // Update viewport data when "Elm" is resized.
    const RO = new ResizeObserver(updateViewport);
    RO.observe(Elm);

    // Disconnect RO function upon unload.
    return () => RO.disconnect();
  }, []);
  //

  // Use ViewSize and MapRatio to control map size.
  const MapSize = {
    W: ViewSize.W * MapRatioSplit[0],
    H: ViewSize.H * MapRatioSplit[1],
  };

  // When page updates:
  useEffect(() => {
    // Update scan objects:
    const updateScans = (OldScans, Delta) => {
      let hasChanged = false;

      // Create new scan objects.
      const NewScans = OldScans.map((ScanObj) => {
        // Subtract time from GrowLeft.
        const GrowLeft = Math.max(0, ScanObj.GrowLeft - Delta);

        // Subtract LifeLeft only if GrowLeft is 0.
        const LifeLeft =
          GrowLeft === 0
            ? Math.max(0, ScanObj.LifeLeft - Delta)
            : ScanObj.LifeLeft;

        // Detect if the new GrowLeft or LifeLeft are different from the old.
        if (GrowLeft !== ScanObj.GrowLeft || LifeLeft !== ScanObj.LifeLeft) {
          hasChanged = true;
        }

        // Return new scan.
        return { ...ScanObj, GrowLeft, LifeLeft };

        // Filter out scan objects that have 0 LifeLeft.
      }).filter((ScanObj) => {
        // Check if LifeLeft is greater than 0.
        return ScanObj.LifeLeft > 0;
      });

      // Safety check: If NewScans is not same length as OldScans, hasChanged becomes true.
      if (NewScans.length !== OldScans.length) hasChanged = true;

      // If hasChanged is true; return NewScans. Else; return OldScans.
      return hasChanged ? NewScans : OldScans;
    };
    //

    // Set empty start variables.
    let AnimFrame = 0;
    let LastFrame = performance.now();

    // Keep value between 0 and 1. Return biggest number between 0-v, and smallest between 1-v.
    const clampPercent = (v) => Math.max(0, Math.min(1, v));

    // Frame ticker:
    const Tick = (CurrentFrame) => {
      // Get time since last frame, in seconds. (Uses millisecond timestamp provided by frame.)
      const Delta = (CurrentFrame - LastFrame) / 1000;
      LastFrame = CurrentFrame;

      // Fetch pressed keys.
      const Keys = KeysRef.current;

      // Define direction values.
      let DireX = 0;
      let DireY = 0;

      // Get direction from held keys.
      if (Keys.has("w") || Keys.has("arrowup")) DireY -= 1;
      if (Keys.has("s") || Keys.has("arrowdown")) DireY += 1;
      if (Keys.has("a") || Keys.has("arrowleft")) DireX -= 1;
      if (Keys.has("d") || Keys.has("arrowright")) DireX += 1;

      // If player is moving, and world data exists:
      if (
        (DireX !== 0 || DireY !== 0) &&
        ViewSize.H &&
        MapSize.W &&
        MapSize.H
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
      //

      let hasScanned = false;
      // If scan cooldown is above 0:
      if (RemainingCooldown.current > 0) {
        // Subtract with time passed since last frame.
        RemainingCooldown.current -= Delta;
      }
      //
      // Else, if cooldown is 0 or less:
      else if (Keys.has(" ")) {
        // Run doScan and reset cooldown.
        const Scan = doScan({ BatPos, BugPos });
        setScans((Prev) => [...Prev, Scan]);
        RemainingCooldown.current = ScanCooldown;
        hasScanned = true;
      }
      //

      if (!hasScanned) setScans((Prev) => updateScans(Prev, Delta));
      AnimFrame = requestAnimationFrame(Tick);
    };
    AnimFrame = requestAnimationFrame(Tick);

    return () => cancelAnimationFrame(AnimFrame);
  }, [KeysRef, ViewSize.H, MapSize.W, MapSize.H, HeightPerSec]);
  //

  // Get data from moveMap.
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
          {Scans.map((Scan) => (
            <div
              key={Scan.ID}
              className={cl(styles, "scan")}
              style={{
                left: `${Scan.X * 100}%`,
                top: `${Scan.Y * 100}%`,
              }}
            />
          ))}

          <div
            className={cl(styles, "bug")}
            style={{
              left: `${BugPos.X * 100}%`,
              top: `${BugPos.Y * 100}%`,
            }}
          />
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
