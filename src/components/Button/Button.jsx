import { useNavigate } from "react-router-dom";
import { cl } from "../../functions/setStyles.jsx";
import styles from "./Button.module.css";

const Button = ({ content, func, link, ms, gs }) => {
  const navigate = useNavigate();
  const clickEvent = () => {
    // If a valid function was given, run it.
    if (typeof func === "function") {
      func();
    }

    // If link was given, use navigate if link starts with "/", otherwise open new window.
    if (link) {
      if (link[0] == "/") {
        navigate(link);
      } else {
        window.open(link, "_blank");
      }
    }
  };

  return (
    <button className={cl(styles, `${ms} button`, gs)} onClick={clickEvent}>
      {content}
    </button>
  );
};

export default Button;
