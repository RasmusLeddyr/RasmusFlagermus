import styles from "./Game.module.css";
import { cl } from "../../functions/setStyles";
import handleKeys from "../../functions/handleKeys";

export default function Game() {
  // Input variables.
  const ViewportRatio = "1/1";
  const MapRatio = "3/1";

  const MapOffset = { x: 0, y: 0 };
  const MapRatioSplit = MapRatio.split("/");

  handleKeys((info) => {
    console.log(info);
  })

  return (
    <div className={cl(styles, "background")}>
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
        </div>

        <div className={cl(styles, "bat", "setCentre")} />
      </div>
    </div>
  );
}
