import Button from "../../components/Button/Button";
import { getScores } from "../../functions/Scores";
import { cl } from "../../functions/setStyles";
import styles from "./Menu.module.css";

export default function Menu() {
  const Scores = getScores();
  return (
    <>
      <div className={cl(styles, "menu", "setCentre fitAspect")}>
        <Button content={"Play"} link={"/game"} />
        <ol>
          {Scores.map((Score, Index) => (
            <li key={Index}>
              {Score.points} : {Score.date}
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
