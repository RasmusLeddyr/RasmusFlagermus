import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";

export default function Game() {
  const ViewportRatio = "1/1";
  const MapRatio = "3/1";

  const MapRatioSplit = MapRatio.split("/");
  const MapOffset = { x: 0, y: 0 };

  return (
    <div className={cl(styles, "stage")}>
      <div
        className={cl(styles, "viewport", "setCentre")}
        style={{
          aspectRatio: ViewportRatio,
        }}
      >
        <div
          className={cl(styles, "map")}
          style={{
            transform: `translate(calc(-50% + ${MapOffset.x}px), calc(-50% + ${MapOffset.y}px))`,
            width: `${MapRatioSplit[0]}00%`,
            height: `${MapRatioSplit[1]}00%`,
          }}
        >
          <div className={cl(styles, "bug")} />

          <div className={cl(styles, "bat", "setCentre")} />
        </div>
      </div>
    </div>
  );
}
