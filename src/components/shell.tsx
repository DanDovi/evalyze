import { Link, Outlet } from "react-router";
import { useState } from "react";
import { FiMenu } from "react-icons/fi";

import cn from "classnames";

import styles from "./shell.module.scss";

export const Shell = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.shell}>
      <div className={cn(styles.nav, { [styles.open]: open })}>
        <button className={styles.openButton} onClick={() => setOpen(!open)}>
          <FiMenu />
        </button>
        <Link className={styles.homeButton} to="/">
          Video event tracker
        </Link>
      </div>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
};
