import { Outlet, useNavigate } from "react-router";
import { FiHome } from "react-icons/fi";

import cn from "classnames";

import styles from "./shell.module.scss";

export const Shell = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.shell}>
      <div className={cn(styles.nav, { [styles.open]: false })}>
        <button className={styles.navButton} onClick={() => navigate("/")}>
          <FiHome />
        </button>
        {/*<button*/}
        {/*  className={styles.navButton}*/}
        {/*  onClick={() => navigate(routes.newAnalysis)}*/}
        {/*>*/}
        {/*  <FiPlus />*/}
        {/*</button>*/}
      </div>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
};
