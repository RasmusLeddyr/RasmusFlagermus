import Button from "../../components/Button/Button";
import { cl } from "../../functions/setStyles";
import styles from "./Menu.module.css";

const Menu = () => {
  return (
    <>
      <div className={cl(styles, "menu", "center fitAspect")}>
        <Button content={"Play"} link={"/game"} />
      </div>
    </>
  );
};

export default Menu;
