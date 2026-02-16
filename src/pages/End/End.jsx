import Button from "../../components/Button/Button";
import { getScores } from "../../functions/Scores";
import { cl } from "../../functions/setStyles";
import styles from "./End.module.css";

export default function End() {
  const Scores = getScores();
  return (
    <div className={cl(styles, "main", "setCentre")}>
      <div>YOUR SCORE: {Scores[0].points}</div>
      <Button content={"Return"} link={"/"} />
    </div>
  );
}
