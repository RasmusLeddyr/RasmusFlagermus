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
  const GameTime = 120;
  const WingStep = 0.125;
  const WingPause = 0.25;

  // Split map ratio to two number.
  const MapRatioSplit = MapRatio.split("/").map(Number);

  // START VALUES [
  const [Scans, setScans] = useState([]);
  const [ViewSize, setViewSize] = useState({ W: 0, H: 0 });
  const [BatPos, setBatPos] = useState({ X: 0.5, Y: 0.5 });
  const [BugPos, setBugPos] = useState({ X: 0.5, Y: 0.75 });
  const [Points, setPoints] = useState(0);
  const [TimeLeft, setTimeLeft] = useState(GameTime);
  const [WingFrame, setWingFrame] = useState(0);
  const [HeadDir, setHeadDir] = useState(0);
  const RemainingCooldown = useRef(0);
  const ViewportRef = useRef(null);
  const BatPosRef = useRef(BatPos);
  const BugPosRef = useRef(BugPos);
  const hasTouched = useRef(false);
  const hasEnded = useRef(false);
  const TimeLeftRef = useRef(GameTime + 1);
  const LastSecondRef = useRef(GameTime);
  const WingFrameRef = useRef(0);
  const WingDirRef = useRef(1);
  const WingTimerRef = useRef(WingPause);
  const HeadDirRef = useRef(0);
  const KeysRef = detectKeys();
  const Nav = useNavigate();
  // ] START VALUES

  // Sync refs with states.
  useEffect(() => {
    BatPosRef.current = BatPos;
  }, [BatPos]);
  useEffect(() => {
    BugPosRef.current = BugPos;
  }, [BugPos]);
  useEffect(() => {
    WingFrameRef.current = WingFrame;
  }, [WingFrame]);
  useEffect(() => {
    HeadDirRef.current = HeadDir;
  }, [HeadDir]);

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

  const getHeadDirection = (DX, DY) => {
    if (DX === 0 && DY === 0) return 0;
    if (DX === 0 && DY < 0) return 1; // up
    if (DX === 0 && DY > 0) return 2; // down
    if (DX < 0 && DY === 0) return 3; // left
    if (DX > 0 && DY === 0) return 4; // right
    if (DX < 0 && DY < 0) return 5; // up-left
    if (DX > 0 && DY < 0) return 6; // up-right
    if (DX < 0 && DY > 0) return 7; // down-left
    if (DX > 0 && DY > 0) return 8; // down-right
    return 0;
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
      let DirX = 0;
      let DirY = 0;

      // Get movement direction from held keys.
      if (Keys.has("w") || Keys.has("arrowup")) DirY -= 1;
      if (Keys.has("s") || Keys.has("arrowdown")) DirY += 1;
      if (Keys.has("a") || Keys.has("arrowleft")) DirX -= 1;
      if (Keys.has("d") || Keys.has("arrowright")) DirX += 1;

      // Get head direction from movement direction.
      const NewHeadDir = getHeadDirection(DirX, DirY);
      if (NewHeadDir !== HeadDirRef.current) {
        setHeadDir(NewHeadDir);
      }

      // If player is moving, and world data exists:
      if ((DirX !== 0 || DirY !== 0) && ViewSize.H && MapSize.W && MapSize.H) {
        // Get magnitude to prevent diagonal speed increase.
        const Magnitude = Math.hypot(DirX, DirY);
        // Get correct distance based on all data.
        const DistX =
          ((DirX / Magnitude) * BatHeightPerSec * Delta) / MapRatioSplit[0];
        const DistY =
          ((DirY / Magnitude) * BatHeightPerSec * Delta) / MapRatioSplit[1];
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

      // WING ANIMATION [
      WingTimerRef.current -= Delta;
      if (WingTimerRef.current <= 0) {
        const Frame = WingFrameRef.current;
        let NextFrame = Frame + WingDirRef.current;
        if (NextFrame >= 2) {
          NextFrame = 2;
          WingDirRef.current = -1;
          WingTimerRef.current = WingPause;
        } else if (NextFrame <= 0) {
          NextFrame = 0;
          WingDirRef.current = 1;
          WingTimerRef.current = WingPause;
        } else {
          WingTimerRef.current = WingStep;
        }
        if (NextFrame !== Frame) setWingFrame(NextFrame);
      }
      // ] WING ANIMATION

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

  // Set wing frame class.
  const WingClass =
    WingFrame === 0
      ? "bat-wings-down"
      : WingFrame === 1
        ? "bat-wings-mid"
        : "bat-wings-up";

  // Set head frame class.
  const HeadClassMap = {
    0: "bat-head-neutral",
    1: "bat-head-up",
    2: "bat-head-down",
    3: "bat-head-left",
    4: "bat-head-right",
    5: "bat-head-up-left",
    6: "bat-head-up-right",
    7: "bat-head-down-left",
    8: "bat-head-down-right",
  };
  const HeadClass = HeadClassMap[HeadDir];

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
          >
            <div className={cl(styles, "bat-sprite")}>
              <div className={cl(styles, `${HeadClass}`)} />
              <div className={cl(styles, `${WingClass}`)} />
              <div className={cl(styles, "bat-torso")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
