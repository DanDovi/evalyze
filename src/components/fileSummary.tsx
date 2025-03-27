import { Analysis } from "../state/fileController.ts";
import { Link } from "react-router";
import { formatSeconds } from "../utils/time.ts";
import { formatDate } from "../utils/dates.ts";

import styles from "./fileSummary.module.scss";

type FileSummaryProps = Analysis;

export const FileSummary = ({
  id,
  name,
  duration,
  lastOpenedAt,
}: FileSummaryProps) => {
  return (
    <Link to={`/analysis/${id}`} className={styles.fileSummary} title={name}>
      <div>
        <span className={styles.name} >{name}</span>
        <div className={styles.details}>
          <div>{`Duration: ${formatSeconds(duration)}`}</div>
          <div>{`Last opened: ${formatDate(lastOpenedAt)}`}</div>
        </div>
      </div>
    </Link>
  );
};
