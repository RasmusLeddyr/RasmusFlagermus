import { useNavigate } from "react-router-dom";
import { cl } from "../../functions/setStyles.jsx";
import styles from "./Button.module.css";

const Button = ({ content, func, link, ms, gs }) => {
  // Define navigate.
  const navigate = useNavigate();

  const clickEvent = () => {
    // If a valid function was given; run it.
    if (typeof func === "function") {
      func();
    }

    // Check if link was given.
    if (link) {
      // If link starts with "/"; navigate to link.
      if (link[0] == "/") {
        navigate(link);
      }
      // Else; open link in new window.
      else {
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
