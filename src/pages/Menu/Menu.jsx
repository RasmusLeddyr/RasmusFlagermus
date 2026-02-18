import styles from "./Menu.module.css";
import { cl } from "../../functions/setStyles";
import Button from "../../components/Button/Button";
import { getScores } from "../../functions/Scores";

export default function Menu() {
  const Scores = getScores();

  return (
    <div className={cl(styles, "main")}>
      <h1 className={cl(styles, "title")}>Get Fat, Bat!</h1>
      <p>Move: WASD / Arrow keys</p>
      <p>Echo-locate: Spacebar</p>
      <div className={cl(styles, "menu")}>
        <Button content={"PLAY"} link={"/game"} ms={"play"} />

        <h2 className={cl(styles, "scores")}>Previous Scores</h2>
        <ul className={cl(styles, "list")}>
          {Scores.map((Score, Index) => (
            <li key={Index}>
              Points: {Score.points} <br /> Date: {Score.date}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
