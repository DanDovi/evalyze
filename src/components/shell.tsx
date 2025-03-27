import { Link, Outlet, useNavigate } from "react-router";
import { FiHome, FiPlus } from "react-icons/fi";
import { routes } from "../routes.ts";
import cn from "classnames";

import styles from "./shell.module.scss";
import { openSingleVideoOpts, useOpenFile } from "../hooks/useOpenFile.ts";

export const Shell = () => {
  const navigate = useNavigate();
  const { openFileDialog } = useOpenFile();

  const onNewAnalysis = async () => {
    const res = await openFileDialog(openSingleVideoOpts);
    if (res === null) return;

    navigate(routes.newAnalysis, { state: { file: res } });
  };

  return (
    <div className={styles.shell}>
      <div className={cn(styles.nav, { [styles.open]: false })}>
        <Link className={styles.navButton} to={"/"}>
          <FiHome />
        </Link>
        <button className={styles.navButton} onClick={onNewAnalysis}>
          <FiPlus />
        </button>
      </div>
      <div className={styles.outlet}>
        <Outlet />
      </div>
    </div>
  );
};
