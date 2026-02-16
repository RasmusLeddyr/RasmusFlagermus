//Game.jsx

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import detectKeys from "../../functions/detectKeys";
import { moveMap } from "../../functions/moveMap";
import { makeScan } from "../../functions/makeScan";
import { getRandomPos, testTouch } from "../../functions/BugFunctions";
import { addScore } from "../../functions/Scores";

export default function Game() {
  // Set input variables.
  const ViewportRatio = "1/1";
  const MapRatio = "2/1.5";
  const BatHeightPerSec = 0.5;
  const ScanHeightPerSec = 1;
  const ScanCooldown = 2;
  const BatScale = 3;
  const BugScale = 2;
  const GameTime = 10;

  // Split map ratio to two number.
  const MapRatioSplit = MapRatio.split("/").map(Number);

  // START VALUES [
  const [Scans, setScans] = useState([]);
  const [ViewSize, setViewSize] = useState({ W: 0, H: 0 });
  const [BatPos, setBatPos] = useState({ X: 0.5, Y: 0.5 });
  const [BugPos, setBugPos] = useState({ X: 0.5, Y: 0.75 });
  const [Points, setPoints] = useState(0);
  const [TimeLeft, setTimeLeft] = useState(GameTime);
  const RemainingCooldown = useRef(0);
  const ViewportRef = useRef(null);
  const BatPosRef = useRef(BatPos);
  const BugPosRef = useRef(BugPos);
  const hasTouched = useRef(false);
  const hasEnded = useRef(false);
  const TimeLeftRef = useRef(GameTime + 1);
  const LastSecondRef = useRef(GameTime);
  const Nav = useNavigate();
  const KeysRef = detectKeys();
  // ] START VALUES

  // Create references for bat and bug positions.
  useEffect(() => {
    BatPosRef.current = BatPos;
  }, [BatPos]);
  useEffect(() => {
    BugPosRef.current = BugPos;
  }, [BugPos]);

  // Set bug position on first page load.
  useEffect(() => {
    const Pos = getRandomPos(BugScale);
    BugPosRef.current = Pos;
    setBugPos(Pos);
  }, []);

  // VIEWPORT VALUE SYNC [
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
  // ] VIEWPORT VALUE SYNC

  // Use ViewSize and MapRatio to control map size.
  const MapSize = {
    W: ViewSize.W * MapRatioSplit[0],
    H: ViewSize.H * MapRatioSplit[1],
  };

  // ON PAGE UPDATE [
  useEffect(() => {
    // Set empty start variables.
    let AnimFrame = 0;
    let LastFrame = performance.now();

    // SCAN UPDATER [
    const updateScans = (OldScans, Delta) => {
      // By default, say that scan list hasn't changed.
      let hasChanged = false;

      // Go through each object in OldScans.
      const NewScans = OldScans.map((ScanObj) => {
        // Take time from GrowLeft.
        const GrowLeft = Math.max(0, ScanObj.GrowLeft - Delta);

        // If GrowLeft is 0; take time from LifeLeft. Else; keep LifeLeft unchanged.
        const LifeLeft =
          GrowLeft === 0
            ? Math.max(0, ScanObj.LifeLeft - Delta)
            : ScanObj.LifeLeft;

        const Radius =
          ScanObj.GrowLeft > 0
            ? ScanObj.Radius + ScanObj.GrowSpeed * Delta
            : ScanObj.Radius;

        // If GrowLeft, LifeLeft, or Radius have changed:
        if (
          GrowLeft !== ScanObj.GrowLeft ||
          LifeLeft !== ScanObj.LifeLeft ||
          Radius !== ScanObj.Radius
        ) {
          // Say that scan list has changed.
          hasChanged = true;
        }

        // Save objects to NewScans.
        return { ...ScanObj, GrowLeft, LifeLeft, Radius };
      }).filter((ScanObj) => {
        // Keep only objects with more than 0 LifeLeft.
        return ScanObj.LifeLeft > 0;
      });

      // If amount of objects is different; say that scan list has changed.
      if (NewScans.length !== OldScans.length) hasChanged = true;

      // If hasChanged is true; return NewScans. Else; return OldScans.
      return hasChanged ? NewScans : OldScans;
    };
    // ] SCAN UPDATER

    // Keep input number between 0 and 1. Return biggest number between 0-v, and smallest between 1-v.
    const clampPercent = (Num) => Math.max(0, Math.min(1, Num));

    // FRAME TICKER [
    const Tick = (CurrentFrame) => {
      // Get time since last frame, in seconds. (Uses millisecond timestamp provided by frame.)
      const Delta = (CurrentFrame - LastFrame) / 1000;
      LastFrame = CurrentFrame;

      // Subtract time from countdown.
      TimeLeftRef.current = Math.max(0, TimeLeftRef.current - Delta);

      // Get seconds left.
      const TimeFloored = Math.floor(TimeLeftRef.current);
      console.log(TimeFloored);

      // If seconds is less than last second:
      if (TimeFloored < LastSecondRef.current) {
        // Set last second to current second.
        LastSecondRef.current = TimeFloored;

        // Set time left to seconds.
        setTimeLeft(TimeFloored);
      }

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
          ((DireX / Magnitude) * BatHeightPerSec * Delta) / MapRatioSplit[0];
        const DistY =
          ((DireY / Magnitude) * BatHeightPerSec * Delta) / MapRatioSplit[1];
        // Update bat position.
        setBatPos((Pos) => ({
          X: clampPercent(Pos.X + DistX),
          Y: clampPercent(Pos.Y + DistY),
        }));
      }
      //

      // Set shouldScan to false by default.
      let shouldScan = false;

      // SCAN COOLDOWN [
      // If scan cooldown is above 0:
      if (RemainingCooldown.current > 0) {
        // Subtract with time passed since last frame. (With minimum value of 0.)
        RemainingCooldown.current = Math.max(
          0,
          RemainingCooldown.current - Delta,
        );
      }
      // Else, if space is being held:
      else if (Keys.has(" ")) {
        // Request new scan and reset cooldown.
        shouldScan = true;
        RemainingCooldown.current = ScanCooldown;
      }
      // ]

      // SCAN UPDATES [
      setScans((OldScans) => {
        // Update old scans.
        let NewScans = updateScans(OldScans, Delta);

        // If shouldScan is true:
        if (shouldScan) {
          // Make new scan at current position.
          const Scan = makeScan({
            BatPos: BatPosRef.current,
            BugPos: BugPosRef.current,
            ScanHeightPerSec,
            MapRatioSplit,
          });

          // Attach new scan to NewScans.
          NewScans = [...NewScans, Scan];
        }

        // Return NewScans as Scans inside setScans.
        return NewScans;
      });
      // ]

      // BAT-BUG COLLISION [
      // Check if bat and bug are touching.
      const isTouching = testTouch(
        BatPosRef.current,
        BatScale,
        BugPosRef.current,
        BugScale,
      );
      // If they are touching, and have not touched recently:
      if (isTouching && !hasTouched.current) {
        // Set hasTouched to true.
        hasTouched.current = true;
        // Randomise bug position.
        const Pos = getRandomPos(BugScale);
        BugPosRef.current = Pos;
        setBugPos(Pos);
        // Give point.
        setPoints((Current) => Current + 1);
      }
      // Else; if they are not touching, but have recently touched:
      else if (!isTouching && hasTouched.current) {
        // Set hasTouched to false.
        hasTouched.current = false;
      }
      // ] BAT-BUG COLLISION

      AnimFrame = requestAnimationFrame(Tick);
    };
    // ] FRAME TICKER

    AnimFrame = requestAnimationFrame(Tick);
    return () => cancelAnimationFrame(AnimFrame);
  }, [ViewSize.H, MapSize.W, MapSize.H, BatHeightPerSec]);
  // ] ON PAGE UPDATE

  // Get data from moveMap.
  const { MapPercentX, MapPercentY } = moveMap({
    BatX: BatPos.X,
    BatY: BatPos.Y,
  });

  // Convert timer to minutes and seconds.
  const Minutes = Math.floor(TimeLeft / 60);
  const Seconds = (TimeLeft % 60).toString().padStart(2, "0");

  // GAME END [
  useEffect(() => {
    // If TimeLeft is below 0, and game hasn't ended:
    if (TimeLeft == 0 && hasEnded.current == false) {
      // End game.
      hasEnded.current = true;
      // Save score.
      addScore(Points);
      // Send user to menu.
      Nav("/end", { replace: true });
    }
  }, [TimeLeft, Points]);
  // ] GAME END

  // Build HTML content.
  return (
    <div className={cl(styles, "background")}>
      <div
        ref={ViewportRef}
        className={cl(styles, "viewport", "setCentre")}
        style={{ aspectRatio: ViewportRatio }}
      >
        <div className={cl(styles, "points")}>Points: {Points}</div>
        <div className={cl(styles, "timer")}>
          {Minutes}:{Seconds}
        </div>

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
                height: `${Scan.Radius * 200}%`,
              }}
            />
          ))}

          <div
            className={cl(styles, "bug")}
            style={{
              left: `${BugPos.X * 100}%`,
              top: `${BugPos.Y * 100}%`,
              height: `${BugScale}%`,
            }}
          />
          <div
            className={cl(styles, "bat")}
            style={{
              left: `${BatPos.X * 100}%`,
              top: `${BatPos.Y * 100}%`,
              height: `${BatScale}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
