import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";

export default function Game() {
  const VIEWPORT_RATIO = "1/1";
  const MAP_RATIO = "2/1";

  const mapOffset = { x: 0, y: 0 };

  return (
    <div className={cl(styles, "stage")}>
      <div
        className={cl(styles, "viewport", "fitAspect centre")}
        style={{
          "--fa_ratio": VIEWPORT_RATIO,
          "--fa_maxFill": 1,
          "--fa_maxFillW": 1,
          "--fa_maxFillH": 1,

          "--map_ratio": MAP_RATIO,
        }}
      >
        <div
          className={cl(styles, "map")}
          style={{
            transform: `translate(calc(-50% + ${mapOffset.x}px), calc(-50% + ${mapOffset.y}px))`,
          }}
        >
          <div className={cl(styles, "bug")} />
        </div>

        <div className={cl(styles, "bat", "centre")} />
      </div>
    </div>
  );
}
