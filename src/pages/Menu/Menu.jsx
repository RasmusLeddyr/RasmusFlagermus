import Button from "../../components/Button/Button";
import { cl } from "../../functions/setStyles";
import styles from "./Menu.module.css";

export default function Menu() {
  return (
    <>
      <div className={cl(styles, "menu", "setCentre fitAspect")}>
        <Button content={"Play"} link={"/game"} />
      </div>
    </>
  );
}
